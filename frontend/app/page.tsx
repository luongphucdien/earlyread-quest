"use client"

import { useMemo, useState } from "react"
import { ChildSummaryScreen } from "@/components/screens/ChildSummaryScreen"
import { InstructionsScreen } from "@/components/screens/InstructionsScreen"
import { ParentReportScreen } from "@/components/screens/ParentReportScreen"
import { RoundScreen } from "@/components/screens/RoundScreen"
import { WelcomeScreen } from "@/components/screens/WelcomeScreen"
import { finishSession, getRound, logEvent, startSession } from "@/lib/api"
import type { AppScreen, FinishResponse, RoundResponse, TaskComponent } from "@/lib/types"

type SessionState = {
    sessionId: string
    currentRoundId: string
}

const COMPONENT_TO_CORRECT_KEY: Record<TaskComponent, keyof RoundResponse["challenges"]> = {
    image_color: "image_color",
    scramble: "scramble",
    audio_mismatch: "audio_mismatch",
}

export default function Page() {
    const [screen, setScreen] = useState<AppScreen>("welcome")
    const [ageBand, setAgeBand] = useState("6-7")
    const [session, setSession] = useState<SessionState | null>(null)
    const [round, setRound] = useState<RoundResponse | null>(null)
    const [finishData, setFinishData] = useState<FinishResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isStarting, setIsStarting] = useState(false)

    const canRenderRound = useMemo(
        () => screen === "round" && !!round && !!session,
        [screen, round, session],
    )

    async function handleStartSession() {
        setIsStarting(true)
        setError(null)
        try {
            const started = await startSession(ageBand)
            const roundData = await getRound(started.first_round_id)
            setSession({
                sessionId: started.session_id,
                currentRoundId: started.first_round_id,
            })
            setRound(roundData)
            setScreen("instructions")
        } catch (startError) {
            setError(
                startError instanceof Error
                    ? startError.message
                    : "Could not start session.",
            )
        } finally {
            setIsStarting(false)
        }
    }

    async function handleChallengeSubmit(
        component: TaskComponent,
        selected: string,
        latencyMs: number,
        extra?: Record<string, unknown>,
    ) {
        if (!session || !round) {
            return
        }

        const challenge = round.challenges[COMPONENT_TO_CORRECT_KEY[component]]
        const correct = challenge.correctAnswer
        const isCorrect = selected === correct

        await logEvent({
            session_id: session.sessionId,
            round_id: round.round_id,
            task_component: component,
            selected,
            correct,
            is_correct: isCorrect,
            latency_ms: latencyMs,
            attempt_number: 1,
            extra,
        })

        if (component !== "audio_mismatch") {
            return
        }

        if (round.next_round_id) {
            const nextRound = await getRound(round.next_round_id)
            setRound(nextRound)
            setSession((previous) =>
                previous
                    ? { ...previous, currentRoundId: round.next_round_id as string }
                    : previous,
            )
            return
        }

        const finished = await finishSession(session.sessionId)
        setFinishData(finished)
        setScreen("child-summary")
    }

    if (screen === "welcome") {
        return (
            <WelcomeScreen
                ageBand={ageBand}
                isStarting={isStarting}
                error={error}
                onAgeBandChange={setAgeBand}
                onStart={handleStartSession}
            />
        )
    }

    if (screen === "instructions") {
        return <InstructionsScreen onBegin={() => setScreen("round")} />
    }

    if (canRenderRound && round) {
        return (
            <RoundScreen round={round} onChallengeSubmit={handleChallengeSubmit} />
        )
    }

    if (screen === "child-summary") {
        return (
            <ChildSummaryScreen
                summary={finishData}
                onContinue={() => setScreen("parent-report")}
            />
        )
    }

    return <ParentReportScreen summary={finishData} />
}
