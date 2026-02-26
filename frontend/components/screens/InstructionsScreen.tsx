import { BigButton } from "@/components/ui/BigButton"
import { ScreenCard } from "@/components/ui/ScreenCard"

type InstructionsScreenProps = {
    onBegin: () => void
}

export function InstructionsScreen({ onBegin }: InstructionsScreenProps) {
    return (
        <ScreenCard
            title="How To Play"
            subtitle="Each round has 3 mini-challenges. Try your best and have fun."
        >
            <ol className="space-y-3 text-lg text-slate-700">
                <li className="rounded-xl bg-[var(--surface-muted)] p-4">
                    1. Look carefully before tapping your answer.
                </li>
                <li className="rounded-xl bg-[var(--surface-muted)] p-4">
                    2. If you hear audio, you can replay it.
                </li>
                <li className="rounded-xl bg-[var(--surface-muted)] p-4">
                    3. Every answer helps us understand reading skills.
                </li>
            </ol>
            <p className="mt-4 text-base text-slate-600">
                There are no bad scores here. This is a support tool, not a diagnosis.
            </p>
            <div className="mt-6">
                <BigButton onClick={onBegin}>Begin Round</BigButton>
            </div>
        </ScreenCard>
    )
}
