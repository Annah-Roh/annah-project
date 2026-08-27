"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Alien } from "@/features/odd-alien/Alien";
import { createRound, type Round } from "@/features/odd-alien/round";

type Status = "playing" | "correct" | "wrong" | "over";

/** 정답을 눌렀을 때 다음 라운드로 넘어가기 전 성공 표시를 보여주는 시간. */
const SUCCESS_PAUSE_MS = 420;

/** 오답을 눌렀을 때 정답 위치를 보여준 뒤 결과 화면으로 넘어가기까지의 시간. */
const REVEAL_PAUSE_MS = 2000;

/** 도달 라운드에 따라 다르게 보여줄 관찰력 평가 문구. 낮은 기준부터 확인한다. */
const OBSERVATION_TIERS: { minRound: number; comment: string }[] = [
  { minRound: 15, comment: "혹시 외계인이신가요? 압도적인 관찰력이에요! 👽" },
  { minRound: 11, comment: "타고난 관찰력의 소유자시네요!" },
  { minRound: 8, comment: "꽤 예리한 눈을 가지셨어요!" },
  { minRound: 4, comment: "평균은 하시네요, 나쁘지 않아요!" },
  { minRound: 0, comment: "아직 몸풀기 단계예요. 다시 도전해보세요!" },
];

function observationCommentFor(roundNumber: number) {
  return OBSERVATION_TIERS.find((tier) => roundNumber >= tier.minRound)!.comment;
}

export function OddAlienGame() {
  const [round, setRound] = useState<Round | null>(null);
  const [status, setStatus] = useState<Status>("playing");
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  const start = useCallback((roundNumber: number) => {
    setRound(createRound(roundNumber));
    setPickedIndex(null);
    setStatus("playing");
  }, []);

  // 라운드는 시작 버튼을 눌렀을 때 처음 만든다. round가 null인 동안은
  // 서버·클라이언트 모두 같은 시작 화면을 그리므로 hydration이 어긋나지 않는다.
  // 성공 표시를 잠깐 보여준 다음 다음 라운드로 넘어간다.
  useEffect(() => {
    if (status !== "correct" || !round) return;

    const timer = setTimeout(() => start(round.roundNumber + 1), SUCCESS_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [status, round, start]);

  // 오답을 누르면 정답 위치를 잠깐 보여준 다음 결과 화면으로 넘어간다.
  useEffect(() => {
    if (status !== "wrong") return;

    const timer = setTimeout(() => setStatus("over"), REVEAL_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  function handlePick(index: number) {
    if (!round || status !== "playing") return;

    setPickedIndex(index);
    setStatus(index === round.oddIndex ? "correct" : "wrong");
  }

  const columns = round?.columns ?? 2;
  const rows = round ? Math.ceil(round.aliens.length / round.columns) : 2;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
      <header className="flex flex-col items-center gap-2 text-center">
        {status === "over" && round ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">GAME OVER</h1>
            <p className="text-sm font-medium">최종 도달 ROUND {round.roundNumber}</p>
            <p className="text-muted-foreground text-sm">
              {observationCommentFor(round.roundNumber)}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              WHO&apos;S DIFFERENT?
            </h1>
            <p className="text-muted-foreground text-sm">
              누가 봐도 똑같죠? …정말 그럴까요? 👽
            </p>
          </>
        )}
      </header>

      {!round && <Button onClick={() => start(1)}>START</Button>}

      {round && status !== "over" && (
        <div
          className="grid w-full shrink-0 gap-2"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            // 초반 라운드에서 외계인이 화면을 다 채우지 않도록 폭을 열 수에 맞추고,
            // 마지막 라운드에서도 격자와 결과가 스크롤 없이 함께 보이도록 세로 여유로 한 번 더 제한한다.
            maxWidth: `min(88vw, ${columns * 7}rem, 34rem, calc((100vh - 21rem) * ${columns / rows}))`,
          }}
        >
          {round.aliens.map((appearance, index) => (
            <button
              key={index}
              type="button"
              aria-label={`외계인 ${index + 1}`}
              disabled={status !== "playing"}
              onClick={() => handlePick(index)}
              className={[
                "aspect-square w-full rounded-xl p-[6%] transition",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                status === "playing" ? "hover:bg-accent cursor-pointer" : "",
                status === "correct" && index === pickedIndex
                  ? "bg-emerald-500/15 ring-2 ring-emerald-500"
                  : "",
                status === "wrong" && index === pickedIndex
                  ? "bg-destructive/15 ring-2 ring-destructive"
                  : "",
                status === "wrong" && index === round.oddIndex
                  ? "bg-emerald-500/15 ring-2 ring-emerald-500"
                  : "",
              ].join(" ")}
            >
              <Alien appearance={appearance} species={round.species} />
            </button>
          ))}
        </div>
      )}

      {round && status === "wrong" && (
        <p aria-live="polite" className="text-sm font-medium text-emerald-700">
          아쉽네요. 정답은 이 녀석!
        </p>
      )}

      {round && status !== "over" && status !== "wrong" && (
        <p aria-live="polite" className="text-lg font-medium">
          ROUND {round.roundNumber}
        </p>
      )}

      {status === "over" && round && (
        <section role="status" className="flex flex-col items-center gap-3 text-center">
          <Button onClick={() => start(1)}>RESTART</Button>
        </section>
      )}
    </main>
  );
}
