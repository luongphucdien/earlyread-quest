"use client"

import { Button, Card, RadioGroup } from "@/components"
import { useState } from "react"

export default function Page() {
    const AGE_BANDS = ["4-5", "6-7", "8-9", "10-11"]

    const [age, setAge] = useState<string>("")
    const [ready, setReady] = useState<boolean>(false)

    const handleSelectAge = (age: string) => {
        setAge(age)
        setReady(true)
    }

    const onStart = () => {}

    return (
        <>
            <Card.Root>
                <Card.Title>EarlyRead Quest</Card.Title>
                <Card.Subtitle>
                    A short learning adventure to help spot reading strengths
                </Card.Subtitle>
                <Card.Body>
                    <div className="space-y-6">
                        <p className="rounded-2xl bg-(--surface-muted) p-4 text-slate-700">
                            Choose an age band, then start the session. Your
                            child will play a few quick challenges with friendly
                            feedback.
                        </p>

                        <RadioGroup.Root
                            className="grid grid-cols-2 gap-3 md:grid-cols-4"
                            defaultValue={""}
                            onValueChange={(e) =>
                                handleSelectAge(e.value ?? "")
                            }
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
                        {/* {error ? (
                            <p className="rounded-xl bg-red-50 p-3 text-sm text-[var(--danger)]">
                                {error}
                            </p>
                        ) : null} */}
                        <Button.Root onClick={onStart} disabled={!ready}>
                            Let&apos;s Start!
                        </Button.Root>
                    </div>
                </Card.Body>
            </Card.Root>
        </>
    )
}
