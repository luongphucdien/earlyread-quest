"use client"

import { Card } from "@/components"
import { useParams } from "next/navigation"

export default function Page() {
    const { id } = useParams<{ id: string }>()

    return (
        <Card.Root>
            <Card.Title>Round</Card.Title>
            <Card.Subtitle>sdadas</Card.Subtitle>
            <Card.Body>{id}</Card.Body>
        </Card.Root>
    )
}
