import { EventType } from "@/util/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const logEvent = async (event: EventType) => {
    const body = JSON.stringify(event)

    try {
        const response = await window.fetch(`${API_URL}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: body,
        })

        if (!response.ok) {
            throw new Error(`Response Status: ${response.status}`)
        }
    } catch (error) {
        console.error(error)
    }
}
