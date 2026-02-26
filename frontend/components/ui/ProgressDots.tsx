type ProgressDotsProps = {
    total: number
    current: number
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
    return (
        <div className="mb-6 flex gap-2">
            {Array.from({ length: total }).map((_, index) => {
                const active = index === current
                const complete = index < current
                return (
                    <span
                        key={index}
                        className={`h-3 w-10 rounded-full ${
                            active
                                ? "bg-[var(--primary)]"
                                : complete
                                  ? "bg-[var(--success)]"
                                  : "bg-slate-200"
                        }`}
                    />
                )
            })}
        </div>
    )
}
