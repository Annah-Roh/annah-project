/**
 * 외계인 몸통 색의 명도·채도. Alien.tsx의 렌더링과 round.ts의 색상 차이 보장 로직이
 * 같은 값을 봐야 하므로 여기 한 곳에 둔다.
 */
export const BODY_LIGHTNESS = 0.74;
export const BODY_CHROMA = 0.16;

/**
 * oklch(L C H)를 실제 화면에 뜨는 sRGB(0–255)로 변환한다. 브라우저의 색역 매핑과 완전히
 * 같지는 않지만(단순 클램프), 실측 대비 채널마다 오차 1 이내로 거의 일치해서 "이 색상 차이가
 * 화면에서 실제로 얼마나 벌어지는지" 판단하는 데 충분하다.
 */
export function oklchToRgb(l: number, c: number, hueDeg: number): [number, number, number] {
  const h = (hueDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const toSrgb = (x: number) => {
    const clamped = Math.min(1, Math.max(0, x));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  return [toSrgb(r) * 255, toSrgb(g) * 255, toSrgb(bl) * 255];
}

/** 몸통 색 기준으로, 색조 두 값이 화면에 실제로 얼마나 다른 색으로 보이는지(RGB 유클리드 거리)를 잰다. */
export function bodyColorDistance(hueA: number, hueB: number): number {
  const [r1, g1, b1] = oklchToRgb(BODY_LIGHTNESS, BODY_CHROMA, hueA);
  const [r2, g2, b2] = oklchToRgb(BODY_LIGHTNESS, BODY_CHROMA, hueB);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}
