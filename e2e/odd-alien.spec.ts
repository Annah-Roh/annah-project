import { expect, test } from "@playwright/test";

/** 화면에 놓인 외계인 버튼들. */
function aliens(page: import("@playwright/test").Page) {
  return page.getByRole("button", { name: /^외계인 \d+$/ });
}

/**
 * 정답 외계인의 인덱스를 찾는다. 나머지는 모두 같은 모습이므로
 * 렌더된 SVG 마크업이 소수(=1개)인 것이 정답이다.
 */
async function findOddIndex(page: import("@playwright/test").Page) {
  const markups = await aliens(page).evaluateAll((nodes) =>
    nodes.map((node) => node.querySelector("svg")?.innerHTML ?? "")
  );

  const counts = new Map<string, number>();
  for (const markup of markups) {
    counts.set(markup, (counts.get(markup) ?? 0) + 1);
  }

  const oddIndex = markups.findIndex((markup) => counts.get(markup) === 1);
  expect(oddIndex, "정답 외계인이 정확히 하나 있어야 한다").toBeGreaterThanOrEqual(0);
  return oddIndex;
}

test("접속하면 제목과 시작 버튼만 보이고, 시작을 누르면 1라운드가 시작된다", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("WHO'S DIFFERENT?")).toBeVisible();
  await expect(page.getByText("ROUND 1")).toHaveCount(0);
  await expect(aliens(page)).toHaveCount(0);

  await page.getByRole("button", { name: "시작", exact: true }).click();

  await expect(page.getByText("ROUND 1")).toBeVisible();
  await expect(aliens(page).first()).toBeVisible();
});

test("정답을 누르면 다음 라운드로 넘어가고 외계인이 늘어난다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "시작", exact: true }).click();

  const firstCount = await aliens(page).count();
  await aliens(page).nth(await findOddIndex(page)).click();

  await expect(page.getByText("ROUND 2")).toBeVisible();
  expect(await aliens(page).count()).toBeGreaterThan(firstCount);
});

test("오답을 누르면 게임이 끝나고 정답과 도달 라운드가 보인다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "시작", exact: true }).click();

  const oddIndex = await findOddIndex(page);
  const wrongIndex = oddIndex === 0 ? 1 : 0;
  await aliens(page).nth(wrongIndex).click();

  await expect(page.getByText("도달 라운드 1")).toBeVisible();
  await expect(page.getByText("초록색 테두리가 정답이었습니다.")).toBeVisible();
  await expect(aliens(page).nth(oddIndex)).toHaveClass(/ring-emerald-500/);
  await expect(aliens(page).first()).toBeDisabled();
});

test("여러 라운드를 통과한 뒤 재시작하면 1라운드로 돌아간다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "시작", exact: true }).click();

  for (const nextRound of [2, 3]) {
    await aliens(page).nth(await findOddIndex(page)).click();
    await expect(page.getByText(`ROUND ${nextRound}`)).toBeVisible();
  }

  const wrongIndex = (await findOddIndex(page)) === 0 ? 1 : 0;
  await aliens(page).nth(wrongIndex).click();
  await expect(page.getByText("도달 라운드 3")).toBeVisible();

  await page.getByRole("button", { name: "다시 시작" }).click();

  await expect(page.getByText("ROUND 1")).toBeVisible();
  await expect(page.getByText(/도달 라운드/)).toHaveCount(0);
  expect(await aliens(page).count()).toBe(4);
});
