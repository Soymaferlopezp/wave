import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import { AccessibilityProvider } from "@/contexts/accessibility-context"
import "./globals.css"

const atkinsonHyperlegible = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-atkinson",
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "W.A.V.E - Web3 Accessibility & Virtual Education",
  description:
    "Learn Web3 without barriers. Your safe and accessible gateway to blockchain education built for everyone.",
  generator: "v0.app",
  keywords:
    "Web3, accessibility, education, blockchain, inclusive design, dyslexia-friendly, ADHD support, autism-friendly",
  authors: [{ name: "W.A.V.E Team" }],
  openGraph: {
    title: "W.A.V.E - Web3 Accessibility & Virtual Education",
    description:
      "Learn Web3 without barriers. Your safe and accessible gateway to blockchain education built for everyone.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${atkinsonHyperlegible.variable} antialiased`}
      >
        <AccessibilityProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AccessibilityProvider>
      </body>
    </html>
  )
}
