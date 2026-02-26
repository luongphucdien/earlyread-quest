import { BigButton } from "@/components/ui/BigButton"
import { ScreenCard } from "@/components/ui/ScreenCard"
import type { FinishResponse } from "@/lib/types"

type ChildSummaryScreenProps = {
    summary: FinishResponse | null
    onContinue: () => void
}

function medalMessage(score: number | undefined) {
    if (typeof score !== "number") {
        return "Shiny Star Medal"
    }
    if (score >= 85) {
        return "Gold Explorer Medal"
    }
    if (score >= 65) {
        return "Silver Brave Medal"
    }
    return "Bronze Try-Again Medal"
}

export function ChildSummaryScreen({
    summary,
    onContinue,
}: ChildSummaryScreenProps) {
    const medal = medalMessage(summary?.overall_score)

    return (
        <ScreenCard
            title="You Did It!"
            subtitle="Great effort today. Every challenge helps us learn more."
        >
            <div className="space-y-4">
                <div className="rounded-2xl bg-[var(--surface-muted)] p-5">
                    <p className="text-xl font-black text-[var(--success)]">{medal}</p>
                    <p className="mt-2 text-slate-700">
                        {summary?.summary ??
                            "You were focused and thoughtful. Keep reading and playing word games!"}
                    </p>
                </div>
                <BigButton onClick={onContinue}>Show Parent Report</BigButton>
            </div>
        </ScreenCard>
    )
}
