import type { AlienAppearance } from "@/features/odd-alien/round";

/**
 * 외계인 하나를 그린다. 색조와 세부 요소 배율만 받아서 그리므로
 * 라운드가 정한 차이가 그대로 화면에 나타난다.
 */
export function Alien({ appearance }: { appearance: AlienAppearance }) {
  const { hue, eyeSize, antennaLength, mouthWidth, spotSize } = appearance;

  const body = `oklch(0.74 0.16 ${hue})`;
  const shade = `oklch(0.5 0.15 ${hue})`;
  const spot = `oklch(0.62 0.16 ${hue})`;

  const antennaTop = 33 - 20 * antennaLength;
  const eyeRx = 7 * eyeSize;
  const eyeRy = 9 * eyeSize;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      {[
        { base: 38, tip: 30 },
        { base: 62, tip: 70 },
      ].map(({ base, tip }) => (
        <g key={base}>
          <line
            x1={base}
            y1={36}
            x2={tip}
            y2={antennaTop + 5}
            stroke={shade}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <circle cx={tip} cy={antennaTop} r={5} fill={shade} />
        </g>
      ))}

      <ellipse cx={50} cy={60} rx={28} ry={30} fill={body} />

      <circle cx={32} cy={74} r={4 * spotSize} fill={spot} />
      <circle cx={68} cy={74} r={4 * spotSize} fill={spot} />

      {[40, 60].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={54} rx={eyeRx} ry={eyeRy} fill="white" />
          <circle cx={cx} cy={56} r={3.2 * eyeSize} fill="oklch(0.2 0 0)" />
        </g>
      ))}

      <ellipse cx={50} cy={76} rx={9 * mouthWidth} ry={4.5} fill={shade} />
    </svg>
  );
}
