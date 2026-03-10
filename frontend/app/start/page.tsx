"use client"

import { logEvent } from "@/api/events"
import { getRound } from "@/api/rounds"
import { Button, Card, Progress } from "@/components"
import { Game, GameType, RoundType } from "@/util/types"
import { useEffect, useState } from "react"
import { GameBody, GameContext } from "./(game)/game-body"

export default function Page() {
    // interface GameResult {
    //     round
    // }

    const [round, setRound] = useState<RoundType>()
    const [currentGame, setCurrentGame] = useState<GameType>("image_color")
    const [audioReplayCount, setAudioReplayCount] = useState(0)
    const [option, setOption] = useState<string>()
    const [isFinished, setIsFinished] = useState(false)
    const [startTime, setStartTime] = useState(0)
    const [isLogging, setIsLogging] = useState(false)

    useEffect(() => {
        const first_round_id = window.localStorage.getItem("first_round_id")

        if (first_round_id) {
            let ignore = false
            getRound(first_round_id).then((res) => {
                if (!ignore) {
                    setRound(res)
                }
            })

            return () => {
                ignore = true
            }
        }
    }, [])

    const onGameSwitch = () => {
        setStartTime(Date.now())
        setOption(undefined)
    }

    const onAudioReplay = () => {
        setAudioReplayCount((value) => value + 1)
    }

    const onSelectOption = (option: string) => {
        setOption(option)
    }

    const onNext = async () => {
        switch (currentGame) {
            case "image_color":
                setCurrentGame("scramble")
                break
            case "scramble":
                setCurrentGame("audio_mismatch")
                break
            default:
                setIsFinished(true)
                console.log("POST round to backend")
                break
        }

        if (round) {
            await logEvent({
                session_id: window.localStorage.getItem("session_id")!,
                round_id: round.round_id,
                task_component: currentGame,
                selected: option!,
                correct: round.challenges[currentGame].correct_answer,
                is_correct:
                    option === round.challenges[currentGame].correct_answer,
                latency_ms: Date.now() - startTime,
                attempt_number: 1,
                extra:
                    currentGame === "audio_mismatch"
                        ? {
                              audio_replay_count: audioReplayCount,
                          }
                        : undefined,
            })
        }
    }

    const onNextRound = () => {
        if (round!.round_number! < round!.total_rounds!) {
            getRound(round!.next_round_id!)
                .then((res) => setRound(res))
                .catch((error) => console.error(error))
            setIsFinished(false)
            setOption("")
            setCurrentGame("image_color")
        }
    }

    const onSubmit = () => {}

    return (
        <Card.Root>
            {isFinished && (
                <>
                    <Card.Title>You Did Great!</Card.Title>
                    <Card.Subtitle>Great focus and effort!</Card.Subtitle>
                    <Card.Body className="space-y-6">
                        <p className="rounded-2xl bg-(--surface-muted) p-4 text-center text-xl font-bold">
                            {round!.round_number < round!.total_rounds
                                ? "Get ready for next round!"
                                : "Good job! You finished them all!"}
                        </p>
                        <Button.Root onClick={onNextRound}>
                            {round!.round_number < round!.total_rounds
                                ? "Next Round"
                                : "Show Report"}
                        </Button.Root>
                    </Card.Body>
                </>
            )}

            {round && !isFinished && (
                <>
                    <Card.Title>Round {round.round_number}</Card.Title>
                    <Card.Subtitle>
                        {`${Game[currentGame].name} - Challenge ${Game[currentGame].order} of 3`}
                    </Card.Subtitle>
                    <Card.Body>
                        <div className="space-y-6">
                            <Progress.Root
                                total={3}
                                current={Game[currentGame].order}
                            />

                            <p className="text-xl font-bold text-slate-700">
                                {round.challenges[currentGame].prompt}
                            </p>

                            <GameContext
                                value={{
                                    game: currentGame,
                                    gameInfo: round.challenges,
                                    onAudioReplay,
                                    onSelectOption,
                                    onGameSwitch,
                                    options:
                                        round.challenges[currentGame].options,
                                }}
                            >
                                <GameBody />
                            </GameContext>

                            <Button.Root
                                color="var(--success)"
                                onClick={onNext}
                                disabled={!option || isLogging}
                            >
                                {isLogging ? "Saving..." : "Next"}
                            </Button.Root>
                        </div>
                    </Card.Body>
                </>
            )}
        </Card.Root>
    )
}
