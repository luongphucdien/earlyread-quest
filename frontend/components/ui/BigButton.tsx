import type { ButtonHTMLAttributes } from "react"

type BigButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "success"
}

const classes = {
    primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)]",
    secondary:
        "bg-white text-[var(--foreground)] border-2 border-[var(--primary)] hover:bg-[var(--surface-muted)]",
    success: "bg-[var(--success)] text-white hover:brightness-110",
}

export function BigButton({
    variant = "primary",
    className = "",
    ...props
}: BigButtonProps) {
    return (
        <button
            className={`w-full rounded-2xl px-6 py-4 text-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${classes[variant]} ${className}`}
            {...props}
        />
    )
}
