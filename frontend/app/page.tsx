"use client"

import { Button, Card, RadioGroup } from "@/components"
import Link from "next/link"
import { useState } from "react"

export default function Page() {
    const AGE_BANDS = ["4-5", "6-7", "8-9", "10-11"]

    const [age, setAge] = useState<string>("")
    const [ready, setReady] = useState<boolean>(false)

    const handleSelectAge = (age: string) => {
        setAge(age)
        setReady(true)
    }

    const onNext = () => {
        window.localStorage.setItem("earlyread_quest_age", age)
    }

    return (
        <Card.Root>
            <Card.Title>EarlyRead Quest</Card.Title>
            <Card.Subtitle>
                A short learning adventure to help spot reading strengths
            </Card.Subtitle>
            <Card.Body>
                <div className="space-y-6">
                    <p className="rounded-2xl bg-(--surface-muted) p-4 text-slate-700">
                        Choose an age band, then start the session. Your child
                        will play a few quick challenges with friendly feedback.
                    </p>

                    <RadioGroup.Root
                        className="grid grid-cols-2 gap-3 md:grid-cols-4"
                        defaultValue={""}
                        onValueChange={(e) => handleSelectAge(e.value ?? "")}
                    >
                        <RadioGroup.Label className="col-span-full">
                            Child age band
                        </RadioGroup.Label>

                        {AGE_BANDS.map((band) => (
                            <RadioGroup.Item key={band} value={band}>
                                <RadioGroup.ItemText>
                                    {band}
                                </RadioGroup.ItemText>
                                <RadioGroup.ItemHiddenInput />
                            </RadioGroup.Item>
                        ))}
                    </RadioGroup.Root>
                    <Link href={"/tutorial"}>
                        <Button.Root onClick={onNext} disabled={!ready}>
                            Next
                        </Button.Root>
                    </Link>
                </div>
            </Card.Body>
        </Card.Root>
    )
}
