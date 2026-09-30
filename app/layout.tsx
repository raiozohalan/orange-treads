import "@/app/globals.css"
import { AppStoreProvider } from "@/providers/app-store-provider"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Orange Treads - Iloilo's Best Treads",
  description:
    "Orange Treads is Iloilo's best treads. We offer a wide range of shoes for all your needs.",
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
        <AppStoreProvider>
          <Toaster id="top-center" visibleToasts={5} position="top-center"/>
          <Toaster id="bottom-right" visibleToasts={5} position="bottom-right"/>
          {children}
        </AppStoreProvider>
      </body>
    </html>
  )
}
