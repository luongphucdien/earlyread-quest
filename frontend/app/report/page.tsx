"use client"

import { getReport } from "@/api/session"
import { Card } from "@/components"
import { Game, GameType, SummaryType } from "@/util/types"
import { useEffect, useRef, useState } from "react"

export default function Page() {
    const [report, setReport] = useState<SummaryType>()

    const session_id = useRef<string>("")

    useEffect(() => {
        const _session_id = window.localStorage.getItem("session_id")
        session_id.current = _session_id!

        getReport(_session_id!)
            .then((res) => {
                setReport(res)
            })
            .catch((error) => {
                console.error(error)
            })
    }, [])

    return (
        <Card.Root>
            <Card.Title>Parent / Educator Report</Card.Title>
            <Card.Subtitle>
                Session overview with early reading indicators
            </Card.Subtitle>

            <Card.Body>
                <div className="space-y-6">
                    {report && (
                        <div
                            className="rounded-xl p-4 text-lg font-bold data-[risk=high]:bg-red-50 data-[risk=high]:text-(--danger) data-[risk=low]:bg-emerald-50 data-[risk=low]:text-(--success) data-[risk=medium]:bg-amber-50 data-[risk=medium]:text-(--warning)"
                            data-risk={report.risk_level}
                        >
                            Risk Level:{" "}
                            {report.risk_level[0].toUpperCase() +
                                report.risk_level.slice(1)}
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full min-w-105 text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:font-bold">
                                    <th>Category</th>
                                    <th>Accuracy</th>
                                    <th>Average Response Time (ms)</th>
                                </tr>
                            </thead>

                            <tbody>
                                {report && (
                                    <>
                                        {Object.entries(report.subscores)
                                            .filter(
                                                ([_, v]) =>
                                                    typeof v === "object" &&
                                                    v !== null
                                            )
                                            .map(([k, v]) => (
                                                <tr
                                                    key={k}
                                                    className="border-t border-slate-100 [&>td]:px-6 [&>td]:py-3"
                                                >
                                                    <td>
                                                        {
                                                            Game[k as GameType]
                                                                .name
                                                        }
                                                    </td>
                                                    <td>
                                                        {Math.round(v.accuracy)}
                                                    </td>
                                                    <td>
                                                        {Math.round(
                                                            v.avgResponseTimeMs
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                        Disclaimer: This tool supports early screening only and
                        is not a clinical diagnosis. Consult a qualified reading
                        specialist for formal assessment.
                    </p>
                </div>
            </Card.Body>
        </Card.Root>
    )
}
