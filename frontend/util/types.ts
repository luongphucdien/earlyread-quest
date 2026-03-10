type CommonChallengeType = {
    prompt: string
    options: string[]
    correct_answer: string
}

export type ChallengesType = {
    image_color: CommonChallengeType & { image_url: string }
    scramble: CommonChallengeType & { scrambled_word: string }
    audio_mismatch: CommonChallengeType & {
        shown_text: string
        audio_url: string
    }
}

export type RoundType = {
    round_id: string
    round_number: number
    total_rounds: number
    next_round_id: string | null
    challenges: ChallengesType
}

export type GameType = "image_color" | "scramble" | "audio_mismatch"

export const Game: Record<
    GameType,
    Readonly<{ order: number; name: string }>
> = {
    image_color: { order: 1, name: "Color Challenge" },
    scramble: { order: 2, name: "Word Fix" },
    audio_mismatch: { order: 3, name: "Listen and Read" },
}

export type EventType = {
    session_id: string
    round_id: string
    task_component: GameType
    selected: string
    correct: string
    is_correct: boolean
    latency_ms: number
    attempt_number: number
    extra?: Record<string, unknown>
}
