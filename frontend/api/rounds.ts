import { RoundType } from "@/util/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL
export const getRound = async (req_round_id: string) => {
    const response = await window.fetch(`${API_URL}/rounds/${req_round_id}`, {
        method: "GET",
    })

    const {
        round_id,
        round_number,
        total_rounds,
        next_round_id,
        challenges,
    }: RoundType = await response.json()
    return {
        round_id,
        round_number,
        total_rounds,
        next_round_id,
        challenges,
    }
}
