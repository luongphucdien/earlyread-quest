import { ScreenCard } from "@/components/ui/ScreenCard"
import type { CategoryStats, FinishResponse, RiskLevel } from "@/lib/types"

type ParentReportScreenProps = {
    summary: FinishResponse | null
}

function normalizeRisk(risk: RiskLevel | undefined) {
    if (risk === "high") {
        return { label: "High", tone: "text-[var(--danger)] bg-red-50" }
    }
    if (risk === "medium") {
        return { label: "Medium", tone: "text-[var(--warning)] bg-amber-50" }
    }
    return { label: "Low", tone: "text-[var(--success)] bg-emerald-50" }
}

function toStatsEntries(summary: FinishResponse | null): Array<[string, CategoryStats]> {
    const raw = summary?.subscores ?? {}
    return Object.entries(raw)
        .filter(([, value]) => typeof value === "object" && value !== null)
        .map(([key, value]) => {
            const typed = value as CategoryStats
            return [
                key,
                {
                    accuracy: typed.accuracy ?? 0,
                    avgResponseTimeMs: typed.avgResponseTimeMs ?? 0,
                },
            ]
        })
}

export function ParentReportScreen({ summary }: ParentReportScreenProps) {
    const risk = normalizeRisk(summary?.risk_level)
    const rows = toStatsEntries(summary)

    return (
        <ScreenCard
            title="Parent / Educator Report"
            subtitle="Session overview with early reading indicators."
        >
            <div className="space-y-5">
                <div className={`rounded-xl p-4 text-lg font-bold ${risk.tone}`}>
                    Risk Level: {risk.label}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[420px] text-left text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 font-bold">Category</th>
                                <th className="px-4 py-3 font-bold">Accuracy</th>
                                <th className="px-4 py-3 font-bold">Avg Response Time (ms)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length ? (
                                rows.map(([category, stats]) => (
                                    <tr key={category} className="border-t border-slate-100">
                                        <td className="px-4 py-3 capitalize">
                                            {category.replaceAll("_", " ")}
                                        </td>
                                        <td className="px-4 py-3">
                                            {Math.round(stats.accuracy)}%
                                        </td>
                                        <td className="px-4 py-3">
                                            {Math.round(stats.avgResponseTimeMs)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-4 text-slate-500">
                                        No per-category stats were returned by the backend.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Disclaimer: This tool supports early screening only and is not a
                    clinical diagnosis. Consult a qualified reading specialist for formal
                    assessment.
                </p>
            </div>
        </ScreenCard>
    )
}
