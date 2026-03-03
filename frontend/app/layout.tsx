import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "../components/style"
import "./globals.css"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "EarlyRead Quest",
    description: "Web-based game that detects early signs of dyslexia",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <div className="mx-auto grid min-h-screen w-full max-w-3xl place-items-center">
                    {children}
                </div>
            </body>
        </html>
    )
}
