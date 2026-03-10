"use client"

import { RadioGroup } from "@/components"
import { ChallengesType, GameType } from "@/util/types"
import Image from "next/image"
import { createContext, useContext, useEffect } from "react"

interface GameContextProps {
    onAudioReplay: () => void
    onSelectOption: (option: string) => void
    onGameSwitch: () => void
    game: GameType
    gameInfo: ChallengesType | null
    options: string[]
}
export const GameContext = createContext<GameContextProps>({
    onAudioReplay: () => {},
    onSelectOption: () => {},
    onGameSwitch: () => {},
    game: "image_color",
    gameInfo: null,
    options: [],
})

export const GameBody = () => {
    const {
        game,
        onGameSwitch,
        gameInfo,
        onAudioReplay,
        options,
        onSelectOption,
    } = useContext(GameContext)

    useEffect(() => {
        onGameSwitch()
    }, [game])

    return (
        <>
            {game === "image_color" && (
                <Image
                    src={gameInfo!.image_color.image_url}
                    alt="Image color challenge"
                    width={800}
                    height={320}
                    className="h-52 w-full rounded-2xl border border-slate-200 bg-slate-100 object-cover"
                />
            )}

            {game === "scramble" && (
                <div className="rounded-2xl bg-(--surface-muted) p-4 text-center text-3xl font-black tracking-widest text-slate-700">
                    {gameInfo!.scramble.scrambled_word}
                </div>
            )}

            {game === "audio_mismatch" && (
                <div className="space-y-3 rounded-2xl bg-(--surface-muted) p-4">
                    <p className="text-lg text-slate-700">
                        Text on screen:{" "}
                        <span className="font-black">
                            {gameInfo!.audio_mismatch.shown_text}
                        </span>
                    </p>
                    <audio
                        controls
                        src={gameInfo!.audio_mismatch.audio_url}
                        className="w-full"
                        onPlay={onAudioReplay}
                    >
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}

            <RadioGroup.Root
                className="grid gap-3 md:grid-cols-2"
                defaultValue={""}
                onValueChange={(e) => onSelectOption(e.value ?? "")}
            >
                {options.map((option) => (
                    <RadioGroup.Item
                        key={option}
                        value={option}
                        onClick={() => onSelectOption(option)}
                    >
                        <RadioGroup.ItemText>{option}</RadioGroup.ItemText>
                        <RadioGroup.ItemHiddenInput />
                    </RadioGroup.Item>
                ))}
            </RadioGroup.Root>
        </>
    )
}
