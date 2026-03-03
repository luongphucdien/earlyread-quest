import { ark } from "@ark-ui/react"
import { ButtonHTMLAttributes } from "react"

interface RootProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "fill" | "border"
}
const Root = (props: RootProps) => {
    const { variant = "fill", ...others } = props

    return (
        <ark.button
            {...others}
            data-scope="button"
            data-part="root"
            data-variant={variant}
        />
    )
}

export const Button = {
    Root: Root,
}
