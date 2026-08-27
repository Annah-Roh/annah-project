// 순수 로직이라 DOM이 필요 없다. 이 체크아웃의 jsdom이 깨져 있어 node 환경을 쓴다.
// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  alienCountFor,
  createRound,
  detailDeviationFor,
  differenceModeFor,
  hueShiftFor,
} from "@/features/odd-alien/round";

/** 호출 순서를 고정해 라운드 생성을 결정적으로 만든다. */
function sequence(values: number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

describe("alienCountFor", () => {
  it("라운드가 올라가도 외계인 수가 줄지 않는다", () => {
    for (let round = 2; round <= 30; round += 1) {
      expect(alienCountFor(round)).toBeGreaterThanOrEqual(
        alienCountFor(round - 1)
      );
    }
  });

  it("외계인 수에 상한이 있다", () => {
    expect(alienCountFor(100)).toBe(alienCountFor(20));
    expect(alienCountFor(100)).toBeLessThanOrEqual(64);
  });
});

describe("differenceModeFor", () => {
  it("5라운드까지는 색상으로 구별한다", () => {
    expect(differenceModeFor(1)).toBe("color");
    expect(differenceModeFor(5)).toBe("color");
  });

  it("6라운드부터는 세부 요소로 구별한다", () => {
    expect(differenceModeFor(6)).toBe("detail");
    expect(differenceModeFor(20)).toBe("detail");
  });
});

describe("차이의 크기", () => {
  it("색조 차이가 라운드마다 좁아지고 하한에서 멈춘다", () => {
    expect(hueShiftFor(2)).toBeLessThan(hueShiftFor(1));
    expect(hueShiftFor(7)).toBeLessThan(hueShiftFor(4));
    expect(hueShiftFor(50)).toBe(hueShiftFor(7));
    expect(hueShiftFor(50)).toBeGreaterThan(0);
  });

  it("세부 요소 편차가 라운드마다 좁아지고 하한에서 멈춘다", () => {
    expect(detailDeviationFor(9)).toBeLessThan(detailDeviationFor(8));
    expect(detailDeviationFor(100)).toBe(detailDeviationFor(16));
    expect(detailDeviationFor(100)).toBeGreaterThan(0);
  });
});

describe("createRound", () => {
  it("정답 하나를 빼면 나머지 외계인은 모두 같다", () => {
    const round = createRound(3, sequence([0.5]));
    const others = round.aliens.filter((_, index) => index !== round.oddIndex);

    expect(others.length).toBeGreaterThan(0);
    for (const alien of others) {
      expect(alien).toEqual(others[0]);
    }
  });

  it("정답 외계인은 나머지와 다르다", () => {
    for (const roundNumber of [1, 4, 7, 8, 12]) {
      const round = createRound(roundNumber, sequence([0.3, 0.7, 0.1]));
      const other = round.aliens.find((_, i) => i !== round.oddIndex);

      expect(round.aliens[round.oddIndex]).not.toEqual(other);
    }
  });

  it("색상 라운드에서는 색조만 다르다", () => {
    const round = createRound(2, sequence([0.3, 0.7, 0.1]));
    const odd = round.aliens[round.oddIndex];
    const other = round.aliens.find((_, i) => i !== round.oddIndex)!;

    expect(odd.hue).not.toBe(other.hue);
    expect({ ...odd, hue: 0 }).toEqual({ ...other, hue: 0 });
  });

  it("세부 요소 라운드에서는 색조가 같고 세부 요소 하나만 다르다", () => {
    const round = createRound(9, sequence([0.3, 0.7, 0.1]));
    const odd = round.aliens[round.oddIndex];
    const other = round.aliens.find((_, i) => i !== round.oddIndex)!;

    expect(odd.hue).toBe(other.hue);

    const changed = (["eyeSize", "mouthWidth", "spotSize", "legCountDelta", "armCountDelta"] as const)
      .filter((key) => odd[key] !== other[key]);
    expect(changed).toHaveLength(1);
  });

  it("정답 위치가 특정 칸에 고정되지 않는다", () => {
    const positions = new Set(
      [0.05, 0.35, 0.65, 0.95].map(
        (pick) => createRound(5, sequence([0.5, 0.5, pick])).oddIndex
      )
    );

    expect(positions.size).toBeGreaterThan(1);
  });

  it("격자 열 수로 모든 외계인을 담을 수 있다", () => {
    for (let roundNumber = 1; roundNumber <= 20; roundNumber += 1) {
      const round = createRound(roundNumber, sequence([0.5]));
      const rows = Math.ceil(round.aliens.length / round.columns);

      expect(round.columns * rows).toBeGreaterThanOrEqual(round.aliens.length);
    }
  });
});
