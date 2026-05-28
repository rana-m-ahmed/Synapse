import type { Metadata } from "next";
import { Bodoni_Moda, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Synapse - Support, evolved.",
  description: "Synthesized Intelligence for the Avant-Garde.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${bodoniModa.variable} ${hankenGrotesk.variable} ${spaceMono.variable} antialiased bg-sand-bg text-charcoal-text min-h-screen selection:bg-electric-tangerine selection:text-white`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
