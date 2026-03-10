"use client"

import { getIds } from "@/api/session"
import { Button, Card } from "@/components"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Page() {
    const [ids, setIds] = useState<{
        session_id: string
        first_round_id: string
    }>({
        session_id: "",
        first_round_id: "",
    })

    const router = useRouter()

    useEffect(() => {
        if (ids.session_id !== "" && ids.first_round_id !== "") {
            window.localStorage.setItem("session_id", ids.session_id)
            window.localStorage.setItem("first_round_id", ids.first_round_id)
            router.push("/start")
        }
    }, [ids, router])

    const onStart = async () => {
        const age = window.localStorage.getItem("earlyread_quest_age")
        const { session_id, first_round_id } = await getIds(age ?? "")
        setIds({ session_id, first_round_id })
    }

    return (
        <Card.Root>
            <Card.Title>How To Play</Card.Title>
            <Card.Subtitle>
                Each round has 3 mini-challenges. Try your best and have fun
            </Card.Subtitle>
            <Card.Body>
                <ol className="list-inside list-decimal space-y-3 text-lg [&>li]:rounded-xl [&>li]:bg-(--surface-muted) [&>li]:p-3">
                    <li>Look carefully before tapping your answer</li>
                    <li>If you hear audio, you can replay it</li>
                    <li>Every answer helps us understand reading skills</li>
                </ol>

                <p className="mt-4 text-base text-slate-600">
                    There are no bad scores here. Just try your best!
                </p>

                <div className="mt-6">
                    <Button.Root onClick={onStart}>
                        Let&apos;s Start!
                    </Button.Root>
                </div>
            </Card.Body>
        </Card.Root>
    )
}
