import type { Metadata } from "next"
import { Inter_Tight } from "next/font/google"
import "./globals.css"
import { ThemeToggle } from "@/components/ThemeToggle"

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "MSME Financing Dashboard",
  description: "MSME financing dashboard built with Next.js + deck.gl",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[color:var(--bg)] text-[color:var(--fg)]">
        <div className="pointer-events-none fixed right-4 top-4 z-50">
          <div className="pointer-events-auto">
            <ThemeToggle />
          </div>
        </div>
        {children}
      </body>
    </html>
  )
}
