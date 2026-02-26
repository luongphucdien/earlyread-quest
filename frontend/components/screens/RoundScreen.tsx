import { useEffect, useState } from "react"
import Image from "next/image"
import { BigButton } from "@/components/ui/BigButton"
import { ProgressDots } from "@/components/ui/ProgressDots"
import { ScreenCard } from "@/components/ui/ScreenCard"
import type { RoundResponse, TaskComponent } from "@/lib/types"

type RoundScreenProps = {
    round: RoundResponse
    onChallengeSubmit: (
        component: TaskComponent,
        selected: string,
        latencyMs: number,
        extra?: Record<string, unknown>,
    ) => Promise<void>
}

const ORDER: TaskComponent[] = ["image_color", "scramble", "audio_mismatch"]

function titleForComponent(component: TaskComponent) {
    if (component === "image_color") {
        return "Color Challenge"
    }
    if (component === "scramble") {
        return "Word Fix"
    }
    return "Listen vs Read"
}

export function RoundScreen({ round, onChallengeSubmit }: RoundScreenProps) {
    const [challengeIndex, setChallengeIndex] = useState(0)
    const [startedAt, setStartedAt] = useState(() => Date.now())
    const [selected, setSelected] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [audioReplayCount, setAudioReplayCount] = useState(0)

    const finished = challengeIndex >= ORDER.length

    useEffect(() => {
        setStartedAt(Date.now())
    }, [challengeIndex])

    useEffect(() => {
        setChallengeIndex(0)
        setSelected(null)
        setAudioReplayCount(0)
        setStartedAt(Date.now())
    }, [round.round_id])

    if (finished) {
        return (
            <ScreenCard
                title="Round Complete!"
                subtitle="Great focus and effort. Preparing next step..."
            >
                <p className="text-lg text-slate-600">Please wait a moment.</p>
            </ScreenCard>
        )
    }

    const component = ORDER[challengeIndex]
    const challenge = component ? round.challenges[component] : undefined
    const choices = challenge?.options ?? []

    if (!component || !challenge) {
        return (
            <ScreenCard
                title={`Round ${round.round_number ?? 1}`}
                subtitle="Loading challenge..."
            >
                <p className="text-lg text-slate-600">Preparing activity.</p>
            </ScreenCard>
        )
    }

    async function submitAnswer() {
        if (!selected || isSubmitting) {
            return
        }

        const latencyMs = Date.now() - startedAt
        setIsSubmitting(true)
        try {
            await onChallengeSubmit(component, selected, latencyMs, {
                audio_replay_count:
                    component === "audio_mismatch" ? audioReplayCount : undefined,
            })
            setSelected(null)
            setAudioReplayCount(0)
            setChallengeIndex((value) => value + 1)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <ScreenCard
            title={`Round ${round.round_number ?? 1}`}
            subtitle={`${titleForComponent(component)} - Challenge ${challengeIndex + 1} of 3`}
        >
            <ProgressDots total={3} current={challengeIndex} />

            <div className="space-y-5">
                <p className="text-xl font-bold text-slate-700">{challenge.prompt}</p>

                {component === "image_color" ? (
                    <Image
                        src={challenge.imageUrl}
                        alt="Challenge prompt"
                        width={800}
                        height={320}
                        className="h-52 w-full rounded-2xl border border-slate-200 bg-slate-100 object-cover"
                    />
                ) : null}

                {component === "scramble" ? (
                    <div className="rounded-2xl bg-[var(--surface-muted)] p-4 text-center text-3xl font-black tracking-widest text-slate-700">
                        {challenge.scrambledWord}
                    </div>
                ) : null}

                {component === "audio_mismatch" ? (
                    <div className="space-y-3 rounded-2xl bg-[var(--surface-muted)] p-4">
                        <p className="text-lg text-slate-700">
                            Text on screen:{" "}
                            <span className="font-black">{challenge.shownText}</span>
                        </p>
                        <audio controls src={challenge.audioUrl} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                        <button
                            type="button"
                            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-2 ring-slate-200"
                            onClick={() => setAudioReplayCount((value) => value + 1)}
                        >
                            I replayed audio
                        </button>
                    </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                    {choices.map((choice) => (
                        <button
                            key={choice}
                            type="button"
                            onClick={() => setSelected(choice)}
                            className={`rounded-2xl px-5 py-4 text-lg font-bold transition ${
                                selected === choice
                                    ? "bg-[var(--primary)] text-white"
                                    : "bg-white text-slate-700 ring-2 ring-slate-200 hover:ring-[var(--primary)]"
                            }`}
                        >
                            {choice}
                        </button>
                    ))}
                </div>

                <BigButton
                    variant="success"
                    disabled={!selected || isSubmitting}
                    onClick={submitAnswer}
                >
                    {isSubmitting ? "Saving answer..." : "Lock In Answer"}
                </BigButton>
            </div>
        </ScreenCard>
    )
}
