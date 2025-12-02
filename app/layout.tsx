import "@/app/globals.css";import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// Initialize Firebase (this will be used by client components)
import "@/firebase/init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orange Treads - Iloilo's Best Treads",
  description:
    "Orange Treads is Iloilo's best treads. We offer a wide range of shoes for all your needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
