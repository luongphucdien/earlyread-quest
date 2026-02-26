import type { PropsWithChildren } from "react"

type ScreenCardProps = PropsWithChildren<{
    title: string
    subtitle?: string
}>

export function ScreenCard({ title, subtitle, children }: ScreenCardProps) {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8">
            <section className="w-full rounded-3xl bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(47,128,237,0.12)] md:p-10">
                <h1 className="text-3xl font-black text-[var(--primary-strong)] md:text-4xl">
                    {title}
                </h1>
                {subtitle ? (
                    <p className="mt-2 text-base text-slate-600 md:text-lg">{subtitle}</p>
                ) : null}
                <div className="mt-6">{children}</div>
            </section>
        </main>
    )
}
