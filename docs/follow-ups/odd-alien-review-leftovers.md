# find-the-odd-alien 코드 리뷰 잔여 항목

`code-review low` 1회 결과 중, 수용 기준을 깨지도 주 경로를 깨뜨리지도 않아
고치지 않고 남긴 항목이다.

- `features/odd-alien/round.ts`의 `createRound`는 주입된 `random`이 1.0을 반환하면
  `oddIndex`가 배열 범위를 벗어나 정답 없는 라운드를 만들고, 세부 요소 모드에서는
  `DETAIL_KEYS` 인덱스도 벗어나 외형 값이 NaN이 된다. 기본값 `Math.random`은 1.0을
  반환하지 않으므로 제품 경로에서는 발생하지 않는다.
- `features/odd-alien/round.ts`의 `Round.mode` 필드는 채워지지만 읽는 곳이 없다.
- `features/odd-alien/Alien.tsx`의 종 정의에서 `eyeScale`이 큰 종(예: 아기형 1.7)은
  8라운드 이상 세부 요소 편차(최대 ×1.55)와 겹치면 눈 크기가 몸통·뷰박스 경계를
  넘어 일부 잘려 보일 수 있다. 정답 판별에는 지장이 없다.
- `features/odd-alien/round.ts`의 `SPECIES_COUNT`와 `Alien.tsx`의 `SPECIES` 배열
  길이가 각자 다른 파일의 매직 넘버로 중복돼 있다. 한쪽만 바꾸면 새 종이 뽑히지
  않거나 랜덤 값 일부가 낭비되는데, 컴파일 타임에 잡히지 않는다.
- `features/odd-alien/OddAlienGame.tsx`의 제한 시간 타이머 effect는 effect 본문에서
  바로 `setProgress(1)`을 호출해 `react-hooks/set-state-in-effect` eslint 규칙을
  위반한다(`npx eslint`에서 error). 화면 동작에는 지장이 없다.
