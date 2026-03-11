import { SummaryType } from "@/util/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL
export const getIds = async (ageBand: string) => {
    const body = JSON.stringify({
        age_band: ageBand,
    })

    try {
        const response = await window.fetch(`${API_URL}/sessions/start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: body,
        })

        if (!response.ok) {
            throw new Error(`Response Status: ${response.status}`)
        }

        const { session_id, first_round_id } = await response.json()
        return { session_id, first_round_id }
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            return { error: error.name, message: error.message }
        } else {
            console.error("Unknown error")
            return { error: "Unknown", message: "None" }
        }
    }
}

export const getReport = async (session_id: string) => {
    try {
        const response = await window.fetch(
            `${API_URL}/sessions/${session_id}/finish`,
            {
                method: "POST",
            }
        )

        if (!response.ok) {
            throw new Error(`Response Status: ${response.status}`)
        }

        const summary: SummaryType = await response.json()
        return summary
    } catch (error) {
        console.error(error)
    }
}
