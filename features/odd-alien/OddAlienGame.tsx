"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Alien } from "@/features/odd-alien/Alien";
import { createRound, type Round } from "@/features/odd-alien/round";

type Status = "playing" | "correct" | "over";

/** 정답을 눌렀을 때 다음 라운드로 넘어가기 전 성공 표시를 보여주는 시간. */
const SUCCESS_PAUSE_MS = 420;

export function OddAlienGame() {
  const [round, setRound] = useState<Round | null>(null);
  const [status, setStatus] = useState<Status>("playing");
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  const start = useCallback((roundNumber: number) => {
    setRound(createRound(roundNumber));
    setPickedIndex(null);
    setStatus("playing");
  }, []);

  // 라운드는 마운트한 뒤에 만든다. 서버와 hydration 렌더는 모두 빈 격자를 그리고,
  // 무작위 배치는 그 뒤에 채워야 서버·클라이언트가 어긋나지 않는다.
  // 클라이언트 전용 초기화라 한 번만 실행되며, 연쇄 렌더로 이어지지 않는다.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start(1);
  }, [start]);

  // 성공 표시를 잠깐 보여준 다음 다음 라운드로 넘어간다.
  useEffect(() => {
    if (status !== "correct" || !round) return;

    const timer = setTimeout(() => start(round.roundNumber + 1), SUCCESS_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [status, round, start]);

  function handlePick(index: number) {
    if (!round || status !== "playing") return;

    setPickedIndex(index);
    setStatus(index === round.oddIndex ? "correct" : "over");
  }

  const columns = round?.columns ?? 2;
  const rows = round ? Math.ceil(round.aliens.length / round.columns) : 2;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          WHO&apos;S DIFFERENT?
        </h1>
        <p className="text-muted-foreground text-sm">
          누가 봐도 똑같죠? …정말 그럴까요? 👽
        </p>
        <p aria-live="polite" className="text-lg font-medium">
          ROUND {round?.roundNumber ?? 1}
        </p>
      </header>

      <div
        className="grid w-full shrink-0 gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          // 초반 라운드에서 외계인이 화면을 다 채우지 않도록 폭을 열 수에 맞추고,
          // 마지막 라운드에서도 격자와 결과가 스크롤 없이 함께 보이도록 세로 여유로 한 번 더 제한한다.
          maxWidth: `min(88vw, ${columns * 7}rem, 34rem, calc((100vh - 21rem) * ${columns / rows}))`,
        }}
      >
        {round?.aliens.map((appearance, index) => (
          <button
            key={index}
            type="button"
            aria-label={`외계인 ${index + 1}`}
            disabled={status !== "playing"}
            onClick={() => handlePick(index)}
            className={[
              "aspect-square rounded-xl p-[6%] transition",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring",
              status === "playing" ? "hover:bg-accent cursor-pointer" : "",
              status === "correct" && index === pickedIndex
                ? "bg-emerald-500/15 ring-2 ring-emerald-500"
                : "",
              status === "over" && index === pickedIndex
                ? "bg-destructive/15 ring-2 ring-destructive"
                : "",
              status === "over" && index === round.oddIndex
                ? "bg-emerald-500/15 ring-2 ring-emerald-500"
                : "",
            ].join(" ")}
          >
            <Alien appearance={appearance} />
          </button>
        ))}
      </div>

      {status === "over" && round && (
        <section
          role="status"
          className="flex flex-col items-center gap-3 text-center"
        >
          <p className="text-muted-foreground text-sm">
            초록색 테두리가 정답이었습니다.
          </p>
          <p className="text-xl font-semibold">
            도달 라운드 {round.roundNumber}
          </p>
          <Button onClick={() => start(1)}>다시 시작</Button>
        </section>
      )}
    </main>
  );
}
