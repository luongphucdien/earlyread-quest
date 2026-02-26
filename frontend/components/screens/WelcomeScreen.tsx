import { BigButton } from "@/components/ui/BigButton"
import { ScreenCard } from "@/components/ui/ScreenCard"

type WelcomeScreenProps = {
    ageBand: string
    isStarting: boolean
    error: string | null
    onAgeBandChange: (value: string) => void
    onStart: () => void
}

const AGE_BANDS = ["4-5", "6-7", "8-9", "10-11"]

export function WelcomeScreen({
    ageBand,
    isStarting,
    error,
    onAgeBandChange,
    onStart,
}: WelcomeScreenProps) {
    return (
        <ScreenCard
            title="EarlyRead Quest"
            subtitle="A short learning adventure to help spot reading strengths."
        >
            <div className="space-y-6">
                <p className="rounded-2xl bg-[var(--surface-muted)] p-4 text-slate-700">
                    Choose an age band, then start the session. Your child will play a few
                    quick challenges with friendly feedback.
                </p>
                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Child age band
                    </label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {AGE_BANDS.map((band) => (
                            <button
                                key={band}
                                type="button"
                                onClick={() => onAgeBandChange(band)}
                                className={`rounded-xl px-3 py-3 text-base font-bold transition ${
                                    ageBand === band
                                        ? "bg-[var(--primary)] text-white"
                                        : "bg-white text-slate-700 ring-2 ring-slate-200 hover:ring-[var(--primary)]"
                                }`}
                            >
                                {band}
                            </button>
                        ))}
                    </div>
                </div>
                {error ? (
                    <p className="rounded-xl bg-red-50 p-3 text-sm text-[var(--danger)]">
                        {error}
                    </p>
                ) : null}
                <BigButton onClick={onStart} disabled={isStarting}>
                    {isStarting ? "Starting session..." : "Start Session"}
                </BigButton>
            </div>
        </ScreenCard>
    )
}
