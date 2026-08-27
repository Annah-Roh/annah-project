/**
 * 라운드 생성 규칙. 난이도 계단(외계인 수 증가 + 차이 축소)이 여기에 모인다.
 */

/** 외계인 하나의 외형. 배율 값은 기본 형태에 곱하고, 델타 값은 종의 기본 개수에 더한다. */
export type AlienAppearance = {
  /** 몸통 색상의 색조(0–360). */
  hue: number;
  eyeSize: number;
  mouthWidth: number;
  spotSize: number;
  /** 종의 기본 다리 수에 더해지는 값. 0이면 차이 없음. */
  legCountDelta: number;
  /** 종의 기본 팔 쌍 수에 더해지는 값. 0이면 차이 없음. */
  armCountDelta: number;
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
 * 격자가 항상 정사각형(n×n)으로 채워지도록 완전제곱수만 쓰고, 값마다 세 라운드씩 유지하며 64를 넘지 않는다.
 */
const ALIEN_COUNTS = [
  4, 4, 4, 9, 9, 9, 16, 16, 16, 25, 25, 25, 36, 36, 36, 49, 49, 49, 64, 64, 64,
];

/** 세부 요소 차이로 넘어가는 라운드. 색조 차이가 하한에 닿기 전에 세부 요소가 끼어들도록 여유를 둔다. */
const DETAIL_MODE_FROM_ROUND = 6;

/** 색조 차이. 뚜렷하게 시작해 라운드마다 좁아지되 하한 아래로는 내려가지 않는다. */
const HUE_SHIFT_START = 60;
const HUE_SHIFT_STEP = 8;
const HUE_SHIFT_FLOOR = 12;

/** 세부 요소 배율 편차. 색상과 같은 방식으로 좁아진다. */
const DETAIL_DEVIATION_START = 0.55;
const DETAIL_DEVIATION_STEP = 0.05;
const DETAIL_DEVIATION_FLOOR = 0.18;

/** 라운드당 제한 시간(ms). 라운드가 올라가도 줄어들지 않고 항상 동일하다. */
const TIME_LIMIT_MS = 8000;

/** 배율(곱셈)로 적용되는 세부 요소 키. */
const SCALE_DETAIL_KEYS = ["eyeSize", "mouthWidth", "spotSize"] as const;
/** 델타(덧셈)로 적용되는 세부 요소 키. 다리·팔 개수는 이산값이라 배율로 표현할 수 없다. */
const COUNT_DETAIL_KEYS = ["legCountDelta", "armCountDelta"] as const;
const DETAIL_KEYS = [...SCALE_DETAIL_KEYS, ...COUNT_DETAIL_KEYS] as const;

/** 편차가 가장 좁아져도 다리 수 차이가 최소 1개는 나도록 하는 기준값. */
const LEG_DELTA_BASE = 4;
/** 팔은 쌍 단위라 항상 1쌍 차이로 고정한다. */
const ARM_DELTA_BASE = 1;

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

export function timeLimitFor(): number {
  return TIME_LIMIT_MS;
}

export function createRound(roundNumber: number, random: Random = Math.random): Round {
  const count = alienCountFor(roundNumber);
  const mode = differenceModeFor(roundNumber);

  const base: AlienAppearance = {
    hue: Math.floor(random() * 360),
    eyeSize: 1,
    mouthWidth: 1,
    spotSize: 1,
    legCountDelta: 0,
    armCountDelta: 0,
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

  if (key === "legCountDelta") {
    return { ...base, legCountDelta: direction * Math.max(1, Math.round(LEG_DELTA_BASE * deviation)) };
  }
  if (key === "armCountDelta") {
    return { ...base, armCountDelta: direction * Math.max(1, Math.round(ARM_DELTA_BASE * deviation)) };
  }
  return { ...base, [key]: base[key] * (1 + direction * deviation) };
}
