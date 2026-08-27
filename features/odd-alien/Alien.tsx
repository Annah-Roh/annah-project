import type { AlienAppearance } from "@/features/odd-alien/round";

/** 픽셀 격자 한 칸의 크기(단위). 20칸 x 20칸 = 100x100 뷰박스. */
const CELL = 5;
/** 격자 한 변의 칸 수. */
const GRID = 20;
/** 팔이 몸통 옆으로 뻗어나가는 길이(칸). */
const ARM_REACH = 3;
/** 다리가 몸통 아래로 뻗어나가는 최대 길이(칸). */
const MAX_LEG_LENGTH = 3;
/** 다리 수의 하한·상한. 너무 많아지면 지저분해 보여서 범위를 좁게 둔다. */
const MIN_LEGS = 0;
const MAX_LEGS = 4;
/** eyeSize 편차를 동공 크기에 적용할 때의 증폭 배수. 동공은 흰자보다 작아서 그대로 적용하면 티가 안 난다. */
const PUPIL_AMPLIFY = 1.6;
/**
 * 세부 요소 하나가 "차이 나는 값"으로 뽑혔을 때, 뷰박스 기준으로 보장하는 최소 크기 차이(칸).
 * 종의 배율(eyeScale 등)이나 라운드의 편차 비율이 아무리 작아도 이 값 밑으로는 떨어지지 않는다.
 * round.ts의 편차 비율만으로는 종·요소 조합마다 최악의 경우를 다 계산해야 해서, 렌더링 단계에서
 * 절대값으로 한 번 더 못박는다.
 */
const MIN_DETAIL_DELTA = 3.5;

/** actual이 baseline과 다르면(=이 요소가 이번 라운드의 차이점이면) 최소 MIN_DETAIL_DELTA만큼은 벌어지게 한다. */
function withMinDelta(baseline: number, actual: number): number {
  const diff = actual - baseline;
  if (diff === 0) return actual;
  return baseline + Math.sign(diff) * Math.max(Math.abs(diff), MIN_DETAIL_DELTA);
}

type Seg = [number, number];
type RowSeg = { row: number; segments: Seg[] };
type Anchor = { cx: number; cy: number };
type Mouth = { cx: number; cy: number; style: "bar" | "teeth" };

/**
 * 외계인 종(모양) 하나의 정의. 실루엣과 이목구비 위치만 다르고, 색과 배율은 appearance가 정한다.
 * legCount는 몸통 맨 아래에 붙는 기본 다리 수(0–4), armRows는 팔이 붙을 수 있는 몸통 행
 * 두 개다. 기본으로는 첫 번째 행만 팔로 켜지고(2개), 팔 수 차이가 생기면 두 번째 행까지
 * 켜지거나(4개) 아예 꺼진다(0개).
 */
type Species = {
  bodyRows: RowSeg[];
  shadeRowCount: number;
  eyeScale: number;
  eyes: Anchor[];
  mouth: Mouth;
  spots: Anchor[];
  legCount: number;
  armRows: number[];
};

const SPECIES: Species[] = [
  // 1. 다리형 - 머리·목·몸통에 여러 다리가 붙은 기본형
  {
    bodyRows: [
      { row: 4, segments: [[8, 11]] },
      { row: 5, segments: [[6, 13]] },
      { row: 6, segments: [[5, 14]] },
      { row: 7, segments: [[4, 15]] },
      { row: 8, segments: [[4, 15]] },
      { row: 9, segments: [[4, 15]] },
      { row: 10, segments: [[5, 14]] },
      { row: 11, segments: [[6, 13]] },
      { row: 12, segments: [[5, 14]] },
      { row: 13, segments: [[4, 15]] },
      { row: 14, segments: [[4, 15]] },
      { row: 15, segments: [[5, 14]] },
      { row: 16, segments: [[5, 14]] },
      { row: 17, segments: [[6, 13]] },
    ],
    shadeRowCount: 3,
    eyeScale: 1,
    eyes: [{ cx: 38, cy: 38 }, { cx: 62, cy: 38 }],
    mouth: { cx: 50, cy: 50, style: "bar" },
    spots: [{ cx: 32, cy: 48 }, { cx: 68, cy: 48 }],
    legCount: 3,
    armRows: [7, 12],
  },
  // 2. 기둥형 - 세로로 긴 몸통에 눈 하나
  {
    bodyRows: [
      { row: 4, segments: [[8, 11]] },
      { row: 5, segments: [[7, 12]] },
      { row: 6, segments: [[6, 13]] },
      { row: 7, segments: [[6, 13]] },
      { row: 8, segments: [[6, 13]] },
      { row: 9, segments: [[6, 13]] },
      { row: 10, segments: [[6, 13]] },
      { row: 11, segments: [[6, 13]] },
      { row: 12, segments: [[6, 13]] },
      { row: 13, segments: [[6, 13]] },
      { row: 14, segments: [[6, 13]] },
      { row: 15, segments: [[5, 14]] },
    ],
    shadeRowCount: 2,
    eyeScale: 1.5,
    eyes: [{ cx: 50, cy: 44 }],
    mouth: { cx: 50, cy: 66, style: "teeth" },
    spots: [{ cx: 38, cy: 58 }, { cx: 62, cy: 58 }],
    legCount: 3,
    armRows: [7, 12],
  },
  // 3. 비행접시형 - 돔 위에 원반, 창문 두 개
  {
    bodyRows: [
      { row: 6, segments: [[9, 10]] },
      { row: 7, segments: [[8, 11]] },
      { row: 8, segments: [[7, 12]] },
      { row: 9, segments: [[6, 13]] },
      { row: 10, segments: [[2, 17]] },
      { row: 11, segments: [[3, 16]] },
      { row: 12, segments: [[6, 7], [12, 13]] },
      { row: 13, segments: [[6, 7], [12, 13]] },
    ],
    shadeRowCount: 1,
    eyeScale: 0.55,
    eyes: [{ cx: 40, cy: 52 }, { cx: 60, cy: 52 }],
    mouth: { cx: 50, cy: 57, style: "bar" },
    spots: [{ cx: 50, cy: 37 }],
    legCount: 2,
    armRows: [9, 11],
  },
  // 4. 동글이형 - 둥근 몸에 귀처럼 솟은 돌기 두 개
  {
    bodyRows: [
      { row: 5, segments: [[8, 11]] },
      { row: 6, segments: [[6, 13]] },
      { row: 7, segments: [[5, 14]] },
      { row: 8, segments: [[4, 15]] },
      { row: 9, segments: [[4, 15]] },
      { row: 10, segments: [[4, 15]] },
      { row: 11, segments: [[4, 15]] },
      { row: 12, segments: [[4, 15]] },
      { row: 13, segments: [[5, 14]] },
      { row: 14, segments: [[6, 13]] },
      { row: 15, segments: [[8, 11]] },
    ],
    shadeRowCount: 2,
    eyeScale: 1.4,
    eyes: [{ cx: 50, cy: 56 }],
    mouth: { cx: 50, cy: 70, style: "teeth" },
    spots: [{ cx: 38, cy: 44 }, { cx: 62, cy: 44 }],
    legCount: 1,
    armRows: [7, 11],
  },
  // 5. 고깔형 - 아래로 갈수록 넓어지는 삼각 몸통
  {
    bodyRows: [
      { row: 4, segments: [[9, 10]] },
      { row: 5, segments: [[8, 11]] },
      { row: 6, segments: [[8, 11]] },
      { row: 7, segments: [[7, 12]] },
      { row: 8, segments: [[7, 12]] },
      { row: 9, segments: [[6, 13]] },
      { row: 10, segments: [[6, 13]] },
      { row: 11, segments: [[5, 14]] },
      { row: 12, segments: [[5, 14]] },
      { row: 13, segments: [[4, 15]] },
      { row: 14, segments: [[4, 15]] },
      { row: 15, segments: [[3, 16]] },
      { row: 16, segments: [[3, 16]] },
    ],
    shadeRowCount: 2,
    eyeScale: 1.3,
    eyes: [{ cx: 50, cy: 44 }],
    mouth: { cx: 50, cy: 58, style: "bar" },
    spots: [{ cx: 36, cy: 66 }, { cx: 64, cy: 66 }],
    legCount: 3,
    armRows: [7, 12],
  },
  // 6. 각진형 - 네모난 몸통에 여러 다리
  {
    bodyRows: [
      { row: 5, segments: [[6, 13]] },
      { row: 6, segments: [[6, 13]] },
      { row: 7, segments: [[6, 13]] },
      { row: 8, segments: [[6, 13]] },
      { row: 9, segments: [[6, 13]] },
      { row: 10, segments: [[6, 13]] },
      { row: 11, segments: [[6, 13]] },
      { row: 12, segments: [[6, 13]] },
      { row: 13, segments: [[6, 13]] },
      { row: 14, segments: [[6, 13]] },
    ],
    shadeRowCount: 2,
    eyeScale: 1.1,
    eyes: [{ cx: 50, cy: 42 }],
    mouth: { cx: 50, cy: 56, style: "teeth" },
    spots: [{ cx: 50, cy: 66 }],
    legCount: 2,
    armRows: [7, 12],
  },
  // 7. 아기형 - 작고 동그란 몸에 눈이 크게
  {
    bodyRows: [
      { row: 7, segments: [[8, 11]] },
      { row: 8, segments: [[6, 13]] },
      { row: 9, segments: [[5, 14]] },
      { row: 10, segments: [[5, 14]] },
      { row: 11, segments: [[5, 14]] },
      { row: 12, segments: [[5, 14]] },
      { row: 13, segments: [[6, 13]] },
    ],
    shadeRowCount: 2,
    eyeScale: 1.7,
    eyes: [{ cx: 50, cy: 52 }],
    mouth: { cx: 50, cy: 65, style: "bar" },
    spots: [{ cx: 40, cy: 60 }, { cx: 60, cy: 60 }],
    legCount: 2,
    armRows: [8, 12],
  },
  // 8. 넓적이형 - 옆으로 퍼진 납작한 몸통
  {
    bodyRows: [
      { row: 8, segments: [[6, 13]] },
      { row: 9, segments: [[4, 15]] },
      { row: 10, segments: [[3, 16]] },
      { row: 11, segments: [[2, 17]] },
      { row: 12, segments: [[2, 17]] },
      { row: 13, segments: [[3, 16]] },
      { row: 14, segments: [[4, 15]] },
      { row: 15, segments: [[6, 13]] },
    ],
    shadeRowCount: 2,
    eyeScale: 0.9,
    eyes: [{ cx: 40, cy: 54 }, { cx: 60, cy: 54 }],
    mouth: { cx: 50, cy: 68, style: "bar" },
    spots: [{ cx: 34, cy: 68 }, { cx: 66, cy: 68 }],
    legCount: 3,
    armRows: [9, 13],
  },
  // 9. 큰귀형 - 키가 크고 귀가 양옆으로 길게 뻗음
  {
    bodyRows: [
      { row: 4, segments: [[8, 11]] },
      { row: 5, segments: [[7, 12]] },
      { row: 6, segments: [[6, 13]] },
      { row: 7, segments: [[6, 13]] },
      { row: 8, segments: [[6, 13]] },
      { row: 9, segments: [[6, 13]] },
      { row: 10, segments: [[6, 13]] },
      { row: 11, segments: [[6, 13]] },
      { row: 12, segments: [[6, 13]] },
      { row: 13, segments: [[6, 13]] },
    ],
    shadeRowCount: 2,
    eyeScale: 1.2,
    eyes: [{ cx: 50, cy: 44 }],
    mouth: { cx: 50, cy: 60, style: "bar" },
    spots: [{ cx: 40, cy: 52 }, { cx: 60, cy: 52 }],
    legCount: 2,
    armRows: [7, 11],
  },
];

function rowRects(
  { row, segments }: RowSeg,
  fill: string,
  key: string
) {
  return segments.map(([colStart, colEnd], i) => (
    <rect
      key={`${key}-${i}`}
      x={colStart * CELL}
      y={row * CELL}
      width={(colEnd - colStart + 1) * CELL}
      height={CELL}
      fill={fill}
    />
  ));
}

/**
 * 몸통 맨 아래 행의 전체 폭 안에 다리를 개수만큼 사이 간격을 두고 배치한다.
 * 폭은 고정이고 개수만 늘거나 줄므로, 다리 하나의 두께를 개수에 맞춰 조절해
 * 요청한 개수가 항상 그대로 보이게 한다(두께로 자르면 개수 차이가 화면에 드러나지 않는다).
 * 0개면 다리 없이 렌더링한다.
 */
function legNodes(bodyRows: RowSeg[], count: number, fill: string) {
  if (count <= 0) return [];

  const last = bodyRows[bodyRows.length - 1];
  const cols = last.segments.flat();
  const colStart = Math.min(...cols);
  const colEnd = Math.max(...cols);
  const spanPx = (colEnd - colStart + 1) * CELL;
  const legWidthPx = spanPx / (2 * count - 1);
  const length = Math.max(1, Math.min(MAX_LEG_LENGTH, GRID - 1 - last.row));
  const startRow = last.row + 1;

  return Array.from({ length: count }, (_, i) => (
    <rect
      key={`leg-${i}`}
      x={colStart * CELL + i * 2 * legWidthPx}
      y={startRow * CELL}
      width={legWidthPx}
      height={length * CELL}
      fill={fill}
    />
  ));
}

/** 지정된 행마다 몸통 좌우 바깥으로 팔을 한 쌍씩 뻗는다. */
function armNodes(bodyRows: RowSeg[], rows: number[], fill: string) {
  return rows.flatMap((rowNumber) => {
    const rowSeg = bodyRows.find((r) => r.row === rowNumber);
    if (!rowSeg) return [];

    const cols = rowSeg.segments.flat();
    const colStart = Math.min(...cols);
    const colEnd = Math.max(...cols);
    const leftReach = Math.min(ARM_REACH, colStart);
    const rightReach = Math.min(ARM_REACH, GRID - 1 - colEnd);

    return [
      <rect
        key={`arm-l-${rowNumber}`}
        x={(colStart - leftReach) * CELL}
        y={rowNumber * CELL}
        width={leftReach * CELL}
        height={CELL}
        fill={fill}
      />,
      <rect
        key={`arm-r-${rowNumber}`}
        x={(colEnd + 1) * CELL}
        y={rowNumber * CELL}
        width={rightReach * CELL}
        height={CELL}
        fill={fill}
      />,
    ];
  });
}

/**
 * 팔 개수 차이(armCountDelta)를 종의 armRows에 반영한다. 기본은 첫 번째 행 한 쌍(팔 2개)만
 * 보이고, 델타가 양수면 두 번째 행까지 켜서 4개로, 음수면 팔 없이 0개로 만든다.
 */
function armRowsFor(armRows: number[], armCountDelta: number): number[] {
  const [first, second] = armRows;

  if (armCountDelta > 0) return second === undefined ? [first] : [first, second];
  if (armCountDelta < 0) return [];
  return [first];
}

function eyeNodes(e: Anchor, eyeW: number, eyeH: number, pupil: number) {
  return (
    <g key={`${e.cx}-${e.cy}`}>
      <rect x={e.cx - eyeW / 2} y={e.cy - eyeH / 2} width={eyeW} height={eyeH} fill="white" />
      <rect
        x={e.cx - pupil / 2}
        y={e.cy + 2 - pupil / 2}
        width={pupil}
        height={pupil}
        fill="oklch(0.2 0 0)"
      />
    </g>
  );
}

function mouthNode(m: Mouth, mouthW: number, shade: string) {
  if (m.style === "teeth") {
    return (
      <g>
        <rect x={m.cx - mouthW / 2} y={m.cy - 3.5} width={mouthW} height={7} fill={shade} />
        {[-1, 0, 1].map((i) => (
          <rect
            key={i}
            x={m.cx + i * (mouthW / 4) - 1.5}
            y={m.cy - 1.5}
            width={3}
            height={3}
            fill="white"
          />
        ))}
      </g>
    );
  }
  return <rect x={m.cx - mouthW / 2} y={m.cy - 3.5} width={mouthW} height={7} fill={shade} />;
}

/**
 * 외계인 하나를 단순한 픽셀아트로 그린다. `species`가 실루엣과 이목구비 배치를 고르고,
 * `appearance`의 배율·델타가 그 위에 라운드가 정한 차이를 입힌다.
 */
export function Alien({
  appearance,
  species,
}: {
  appearance: AlienAppearance;
  species: number;
}) {
  const { hue, eyeSize, mouthWidth, spotSize, legCountDelta, armCountDelta } = appearance;
  const shape = SPECIES[((species % SPECIES.length) + SPECIES.length) % SPECIES.length];

  const body = `oklch(0.74 0.16 ${hue})`;
  const shade = `oklch(0.5 0.15 ${hue})`;
  const spot = `oklch(0.62 0.16 ${hue})`;
  const highlight = `oklch(0.88 0.09 ${hue})`;

  const eyeW = withMinDelta(12 * shape.eyeScale, 12 * eyeSize * shape.eyeScale);
  const eyeH = withMinDelta(16 * shape.eyeScale, 16 * eyeSize * shape.eyeScale);
  // 동공은 흰자보다 크기가 작아서 같은 비율로만 키우면 차이가 잘 안 보인다.
  // eyeSize가 벗어난 만큼을 증폭해서 동공 쪽 변화가 더 도드라지게 하되, 0 밑으로는 내려가지 않게 막는다.
  const pupilScale = Math.max(0.2, 1 + (eyeSize - 1) * PUPIL_AMPLIFY);
  const pupil = withMinDelta(6 * shape.eyeScale, 6 * pupilScale * shape.eyeScale);
  const mouthW = withMinDelta(18, 18 * mouthWidth);
  const spotSide = withMinDelta(8, 8 * spotSize);
  const legCount = Math.min(MAX_LEGS, Math.max(MIN_LEGS, shape.legCount + legCountDelta));
  const armRows = armRowsFor(shape.armRows, armCountDelta);

  const shadeRows = shape.bodyRows.slice(-shape.shadeRowCount);
  const firstRow = shape.bodyRows[0];
  const highlightX = firstRow.segments[0][0] * CELL + 3;
  const highlightY = firstRow.row * CELL + 3;

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {legNodes(shape.bodyRows, legCount, shade)}
      {armNodes(shape.bodyRows, armRows, body)}

      {shape.bodyRows.map((r, i) => rowRects(r, body, `body-${i}`))}
      {shadeRows.map((r, i) => rowRects(r, shade, `shade-${i}`))}
      <rect x={highlightX} y={highlightY} width={7} height={7} fill={highlight} />

      {shape.spots.map((s) => (
        <rect
          key={`${s.cx}-${s.cy}`}
          x={s.cx - spotSide / 2}
          y={s.cy - spotSide / 2}
          width={spotSide}
          height={spotSide}
          fill={spot}
        />
      ))}

      {shape.eyes.map((e) => eyeNodes(e, eyeW, eyeH, pupil))}
      {mouthNode(shape.mouth, mouthW, shade)}
    </svg>
  );
}
