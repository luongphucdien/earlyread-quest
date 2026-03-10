import { ark } from "@ark-ui/react"
import { ButtonHTMLAttributes, CSSProperties } from "react"

interface RootProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "fill" | "border"
    color?: string
}
const Root = (props: RootProps) => {
    const { variant = "fill", color, ...others } = props

    return (
        <ark.button
            {...others}
            data-scope="button"
            data-part="root"
            data-variant={variant}
            style={
                {
                    "--color": color,
                } as CSSProperties
            }
        />
    )
}

export const Button = {
    Root: Root,
}
