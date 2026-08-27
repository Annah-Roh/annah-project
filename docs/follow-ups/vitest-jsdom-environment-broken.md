# vitest의 jsdom 환경이 이 체크아웃에서 뜨지 않는다

## 증상

`bun run test`가 테스트 내용과 무관하게 실패한다(exit 1). jsdom 환경을 쓰는 테스트 파일이
하나도 없어도 같은 오류가 난다.

```
Error: require() of ES Module node_modules/@exodus/bytes/encoding-lite.js
from node_modules/html-encoding-sniffer/lib/html-encoding-sniffer.js not supported.
Serialized Error: { code: 'ERR_REQUIRE_ESM' }
```

## 근거

- `find-the-odd-alien` 작업 전부터 재현된다. 당시 유일한 순수 테스트였던
  `lib/utils.test.ts`만 돌려도 같은 오류가 났다.
- `html-encoding-sniffer@6.0.0`은 CommonJS인데 의존하는 `@exodus/bytes@1.15.1`이
  `"type": "module"`이다.
- 이 환경의 Node는 v22.9.0이다. `require(esm)`은 Node 22.12부터 플래그 없이 동작한다.
- `NODE_OPTIONS=--experimental-require-module`을 붙여도 해결되지 않았다.

## 영향

- `vitest.config.mts`의 기본 환경이 `jsdom`이라, vitest가 환경을 미리 로드하면서
  테스트 파일 종류와 무관하게 오류가 남는다.
- 컴포넌트 테스트(Testing Library)를 아예 작성할 수 없다. 그래서 이번 작업의
  화면 동작은 Playwright e2e(`e2e/odd-alien.spec.ts`)로 검증했고,
  순수 로직 테스트는 `features/odd-alien/round.test.ts` 상단에
  `// @vitest-environment node`를 붙여 우회했다.
- 이 우회 때문에 `bunx vitest run`은 12개 테스트가 통과하면서도 exit 1이다.

## 다음 단계 후보

1. Node를 22.12 이상으로 올린다(가장 단순하고 근본 원인에 해당).
2. `package.json`에 `overrides`로 `@exodus/bytes`를 CommonJS를 함께 제공하는
   버전으로 고정한다.
3. 위가 막히면 `vitest.config.mts`의 기본 환경을 `node`로 바꾸고, DOM이 필요한
   파일만 `// @vitest-environment jsdom`으로 켠다. 다만 jsdom 자체가 여전히
   깨진 상태이므로 컴포넌트 테스트는 이 방법으로도 살아나지 않는다.
