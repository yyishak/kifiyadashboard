import type { Metadata } from "next"
import { Geist_Mono, Inter_Tight } from "next/font/google"
import "./globals.css"

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${interTight.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b4b56] text-white">
        {children}
      </body>
    </html>
  )
}
