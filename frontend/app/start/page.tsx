"use client"

import { getRound } from "@/api/rounds"
import { Button, Card, Progress } from "@/components"
import { Game, GameType, RoundType } from "@/util/types"
import { useEffect, useState } from "react"
import { GameBody, GameContext } from "./(game)/game-body"

export default function Page() {
    // interface GameResult {
    //     round
    // }

    const [round, setRound] = useState<RoundType | undefined>()
    const [currentGame, setCurrentGame] = useState<GameType>("image_color")
    const [audioReplayCount, setAudioReplayCount] = useState(0)
    const [option, setOption] = useState("")
    const [isFinished, setIsFinished] = useState(false)

    const onGetRound = (round: RoundType) => {
        setRound(round)
    }

    const onAudioReplay = () => {
        setAudioReplayCount((value) => value + 1)
    }

    const onSelectOption = (option: string) => {
        setOption(option)
    }

    const onNext = async () => {
        setOption("")

        switch (currentGame) {
            case "image_color":
                setCurrentGame("scramble")
                break
            case "scramble":
                setCurrentGame("audio_mismatch")
                break
            default:
                setIsFinished(true)
                break
        }
    }

    useEffect(() => {
        const first_round_id = window.localStorage.getItem("first_round_id")

        const fetchRound = async () => {
            try {
                const _round = await getRound(first_round_id!)
                onGetRound(_round)
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error.message)
                } else {
                    console.error("Unknown Error")
                }
            }
        }

        fetchRound()
    }, [round])

    return (
        <Card.Root>
            {isFinished && (
                <>
                    <Card.Title>You Did Great!</Card.Title>
                    <Card.Subtitle>Great focus and effort!</Card.Subtitle>
                    <Card.Body className="space-y-6">
                        <p className="rounded-2xl bg-(--surface-muted) p-4 text-center text-xl font-bold">
                            Get ready for next round!
                        </p>
                        <Button.Root>Next Round</Button.Root>
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
                                    options:
                                        round.challenges[currentGame].options,
                                }}
                            >
                                <GameBody />
                            </GameContext>

                            <Button.Root
                                color="var(--success)"
                                onClick={onNext}
                                disabled={option === ""}
                            >
                                Next
                            </Button.Root>
                        </div>
                    </Card.Body>
                </>
            )}
        </Card.Root>
    )
}
