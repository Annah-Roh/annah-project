import type { AlienAppearance } from "@/features/odd-alien/round";

/** 픽셀 격자 한 칸의 크기(단위). 20칸 x 20칸 = 100x100 뷰박스. */
const CELL = 5;

type Seg = [number, number];
type RowSeg = { row: number; segments: Seg[] };
type Protrusion = { cx: number; baseY: number; reach: number; tip: "ball" | "flag" };
type Anchor = { cx: number; cy: number };
type Mouth = { cx: number; cy: number; style: "bar" | "teeth" };

/** 외계인 종(모양) 하나의 정의. 실루엣과 이목구비 위치만 다르고, 색과 배율은 appearance가 정한다. */
type Species = {
  bodyRows: RowSeg[];
  shadeRowCount: number;
  eyeScale: number;
  eyes: Anchor[];
  protrusions: Protrusion[];
  mouth: Mouth;
  spots: Anchor[];
};

function expand([start, end]: Seg): Seg {
  return [start - 1, end + 1];
}

/** 실루엣 맨 위·아래 칸을 한 칸씩 넓혀 테두리 캡을 만든다. */
function outlineRowsFor(bodyRows: RowSeg[]): RowSeg[] {
  const first = bodyRows[0];
  const last = bodyRows[bodyRows.length - 1];
  return [
    { row: first.row - 1, segments: first.segments.map(expand) },
    ...bodyRows.map(({ row, segments }) => ({ row, segments: segments.map(expand) })),
    { row: last.row + 1, segments: last.segments.map(expand) },
  ];
}

const SPECIES: Species[] = [
  // 1. 다리형 - 머리·목·몸통에 두 다리가 갈라진 기본형
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
      { row: 18, segments: [[6, 8], [11, 13]] },
      { row: 19, segments: [[6, 7], [12, 13]] },
    ],
    shadeRowCount: 3,
    eyeScale: 1,
    eyes: [{ cx: 38, cy: 38 }, { cx: 62, cy: 38 }],
    protrusions: [
      { cx: 38, baseY: 26, reach: 21, tip: "ball" },
      { cx: 62, baseY: 26, reach: 21, tip: "ball" },
    ],
    mouth: { cx: 50, cy: 50, style: "bar" },
    spots: [{ cx: 32, cy: 48 }, { cx: 68, cy: 48 }],
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
    protrusions: [{ cx: 50, baseY: 26, reach: 20, tip: "ball" }],
    mouth: { cx: 50, cy: 66, style: "teeth" },
    spots: [{ cx: 38, cy: 58 }, { cx: 62, cy: 58 }],
  },
  // 3. 비행접시형 - 돔 위에 안테나, 원반에 창문 두 개
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
    protrusions: [{ cx: 50, baseY: 31, reach: 18, tip: "ball" }],
    mouth: { cx: 50, cy: 57, style: "bar" },
    spots: [{ cx: 50, cy: 37 }],
  },
  // 4. 동글이형 - 둥근 몸에 귀처럼 솟은 더듬이 두 개
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
    protrusions: [
      { cx: 34, baseY: 27, reach: 16, tip: "ball" },
      { cx: 66, baseY: 27, reach: 16, tip: "ball" },
    ],
    mouth: { cx: 50, cy: 70, style: "teeth" },
    spots: [{ cx: 38, cy: 44 }, { cx: 62, cy: 44 }],
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
    protrusions: [{ cx: 50, baseY: 23, reach: 17, tip: "flag" }],
    mouth: { cx: 50, cy: 58, style: "bar" },
    spots: [{ cx: 36, cy: 66 }, { cx: 64, cy: 66 }],
  },
  // 6. 각진형 - 네모난 몸통에 짧은 다리
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
      { row: 15, segments: [[7, 8], [11, 12]] },
      { row: 16, segments: [[7, 8], [11, 12]] },
    ],
    shadeRowCount: 2,
    eyeScale: 1.1,
    eyes: [{ cx: 50, cy: 42 }],
    protrusions: [{ cx: 50, baseY: 26, reach: 19, tip: "ball" }],
    mouth: { cx: 50, cy: 56, style: "teeth" },
    spots: [{ cx: 50, cy: 66 }],
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
      { row: 14, segments: [[7, 8], [11, 12]] },
    ],
    shadeRowCount: 2,
    eyeScale: 1.7,
    eyes: [{ cx: 50, cy: 52 }],
    protrusions: [{ cx: 50, baseY: 31, reach: 15, tip: "flag" }],
    mouth: { cx: 50, cy: 65, style: "bar" },
    spots: [{ cx: 40, cy: 60 }, { cx: 60, cy: 60 }],
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
    protrusions: [
      { cx: 40, baseY: 33, reach: 14, tip: "ball" },
      { cx: 60, baseY: 33, reach: 14, tip: "ball" },
    ],
    mouth: { cx: 50, cy: 68, style: "bar" },
    spots: [{ cx: 34, cy: 68 }, { cx: 66, cy: 68 }],
  },
  // 9. 큰귀형 - 키가 크고 귀(더듬이)가 양옆으로 길게 뻗음
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
      { row: 15, segments: [[7, 8], [11, 12]] },
    ],
    shadeRowCount: 2,
    eyeScale: 1.2,
    eyes: [{ cx: 50, cy: 44 }],
    protrusions: [
      { cx: 28, baseY: 26, reach: 18, tip: "ball" },
      { cx: 72, baseY: 26, reach: 18, tip: "ball" },
    ],
    mouth: { cx: 50, cy: 60, style: "bar" },
    spots: [{ cx: 40, cy: 52 }, { cx: 60, cy: 52 }],
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

function protrusionNodes(p: Protrusion, antennaLength: number, shade: string, outline: string) {
  const rawTip = p.baseY - p.reach * antennaLength;
  const tipY = Math.max(2, Math.min(p.baseY - 8, rawTip));
  return (
    <g key={`${p.cx}-${p.baseY}`}>
      <rect x={p.cx - 1.75} y={tipY + 5} width={3.5} height={p.baseY - (tipY + 5)} fill={outline} />
      {p.tip === "flag" ? (
        <rect x={p.cx + 1} y={tipY - 3} width={7} height={7} fill={shade} />
      ) : (
        <rect x={p.cx - 4} y={tipY - 4} width={8} height={8} fill={shade} />
      )}
    </g>
  );
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
 * 외계인 하나를 16비트풍 픽셀아트로 그린다. `species`가 실루엣과 이목구비 배치를 고르고,
 * `appearance`의 색조·배율이 그 위에 라운드가 정한 차이를 입힌다.
 */
export function Alien({
  appearance,
  species,
}: {
  appearance: AlienAppearance;
  species: number;
}) {
  const { hue, eyeSize, antennaLength, mouthWidth, spotSize } = appearance;
  const shape = SPECIES[((species % SPECIES.length) + SPECIES.length) % SPECIES.length];

  const body = `oklch(0.74 0.16 ${hue})`;
  const shade = `oklch(0.5 0.15 ${hue})`;
  const spot = `oklch(0.62 0.16 ${hue})`;
  const highlight = `oklch(0.88 0.09 ${hue})`;
  const outline = `oklch(0.28 0.06 ${hue})`;

  const eyeW = 12 * eyeSize * shape.eyeScale;
  const eyeH = 16 * eyeSize * shape.eyeScale;
  const pupil = 6 * eyeSize * shape.eyeScale;
  const mouthW = 18 * mouthWidth;
  const spotSide = 8 * spotSize;

  const outlineRows = outlineRowsFor(shape.bodyRows);
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
      {shape.protrusions.map((p) => protrusionNodes(p, antennaLength, shade, outline))}

      {outlineRows.map((r, i) => rowRects(r, outline, `outline-${i}`))}
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
