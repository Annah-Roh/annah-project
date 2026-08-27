# find-the-odd-alien 코드 리뷰 잔여 항목

`code-review low` 1회 결과 중, 수용 기준을 깨지도 주 경로를 깨뜨리지도 않아
고치지 않고 남긴 항목이다.

- `features/odd-alien/round.ts`의 `createRound`는 주입된 `random`이 1.0을 반환하면
  `oddIndex`가 배열 범위를 벗어나 정답 없는 라운드를 만들고, 세부 요소 모드에서는
  `DETAIL_KEYS` 인덱스도 벗어나 외형 값이 NaN이 된다. 기본값 `Math.random`은 1.0을
  반환하지 않으므로 제품 경로에서는 발생하지 않는다.
- `features/odd-alien/round.ts`의 `Round.mode` 필드는 채워지지만 읽는 곳이 없다.
