/**
 * 라운드 생성 규칙. 난이도 계단(외계인 수 증가 + 차이 축소)이 여기에 모인다.
 */

/** 외계인 하나의 외형. 세부 값은 기본 형태에 곱하는 배율이다. */
export type AlienAppearance = {
  /** 몸통 색상의 색조(0–360). */
  hue: number;
  eyeSize: number;
  antennaLength: number;
  mouthWidth: number;
  spotSize: number;
};

export type DifferenceMode = "color" | "detail";

export type Round = {
  roundNumber: number;
  /** 격자 열 수. 행 수는 외계인 수에서 계산된다. */
  columns: number;
  aliens: AlienAppearance[];
  oddIndex: number;
  mode: DifferenceMode;
  /** 이 라운드에 등장하는 외계인 종(모양). 라운드 안에서는 모두 같은 종을 쓴다. */
  species: number;
};

/** 준비된 외계인 종(모양) 수. 실제 모양 정의는 렌더링 쪽(Alien.tsx)이 갖는다. */
export const SPECIES_COUNT = 9;

/**
 * 라운드별 외계인 수. 줄지 않고, 마지막 값이 상한이다.
 * 상한이 없으면 정답 찾기가 관찰력이 아니라 운이 된다.
 */
const ALIEN_COUNTS = [4, 6, 9, 12, 16, 20, 25, 25, 30, 36, 42, 49, 56, 64];

/** 세부 요소 차이로 넘어가는 라운드. */
const DETAIL_MODE_FROM_ROUND = 8;

/** 색조 차이. 뚜렷하게 시작해 라운드마다 좁아지되 하한 아래로는 내려가지 않는다. */
const HUE_SHIFT_START = 60;
const HUE_SHIFT_STEP = 8;
const HUE_SHIFT_FLOOR = 12;

/** 세부 요소 배율 편차. 색상과 같은 방식으로 좁아진다. */
const DETAIL_DEVIATION_START = 0.55;
const DETAIL_DEVIATION_STEP = 0.05;
const DETAIL_DEVIATION_FLOOR = 0.18;

const DETAIL_KEYS = [
  "eyeSize",
  "antennaLength",
  "mouthWidth",
  "spotSize",
] as const;

export type Random = () => number;

export function alienCountFor(roundNumber: number): number {
  const index = Math.min(Math.max(roundNumber, 1), ALIEN_COUNTS.length) - 1;
  return ALIEN_COUNTS[index];
}

export function differenceModeFor(roundNumber: number): DifferenceMode {
  return roundNumber >= DETAIL_MODE_FROM_ROUND ? "detail" : "color";
}

export function hueShiftFor(roundNumber: number): number {
  const shrunk = HUE_SHIFT_START - (roundNumber - 1) * HUE_SHIFT_STEP;
  return Math.max(HUE_SHIFT_FLOOR, shrunk);
}

export function detailDeviationFor(roundNumber: number): number {
  const shrunk =
    DETAIL_DEVIATION_START -
    (roundNumber - DETAIL_MODE_FROM_ROUND) * DETAIL_DEVIATION_STEP;
  return Math.max(DETAIL_DEVIATION_FLOOR, shrunk);
}

export function createRound(roundNumber: number, random: Random = Math.random): Round {
  const count = alienCountFor(roundNumber);
  const mode = differenceModeFor(roundNumber);

  const base: AlienAppearance = {
    hue: Math.floor(random() * 360),
    eyeSize: 1,
    antennaLength: 1,
    mouthWidth: 1,
    spotSize: 1,
  };

  const odd =
    mode === "color"
      ? applyHueShift(base, hueShiftFor(roundNumber), random)
      : applyDetailDeviation(base, detailDeviationFor(roundNumber), random);

  const oddIndex = Math.floor(random() * count);
  const aliens = Array.from({ length: count }, (_, index) =>
    index === oddIndex ? odd : base
  );

  return {
    roundNumber,
    columns: Math.ceil(Math.sqrt(count)),
    aliens,
    oddIndex,
    mode,
    species: Math.floor(random() * SPECIES_COUNT),
  };
}

function applyHueShift(
  base: AlienAppearance,
  shift: number,
  random: Random
): AlienAppearance {
  const direction = random() < 0.5 ? -1 : 1;
  return { ...base, hue: (base.hue + direction * shift + 360) % 360 };
}

function applyDetailDeviation(
  base: AlienAppearance,
  deviation: number,
  random: Random
): AlienAppearance {
  const key = DETAIL_KEYS[Math.floor(random() * DETAIL_KEYS.length)];
  const direction = random() < 0.5 ? -1 : 1;
  return { ...base, [key]: base[key] * (1 + direction * deviation) };
}
