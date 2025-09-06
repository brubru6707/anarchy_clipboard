import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Anarchy Clipboard - Free Infinite Canvas for Everyone",
  description: "Join the chaos! Drop memes, ads, art, and anything you want on our infinite collaborative canvas. No account required - pure digital anarchy with real-time collaboration.",
  keywords: "anarchy, clipboard, infinite canvas, memes, free advertising, collaborative, real-time, no account, digital chaos",
  author: "Anarchy Clipboard",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Anarchy Clipboard - Free Infinite Canvas",
    description: "Drop anything on our infinite canvas! Free memes, ads, art - no rules, no account needed. Join the digital anarchy!",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anarchy Clipboard - Free Infinite Canvas",
    description: "Drop anything on our infinite canvas! Free memes, ads, art - no rules, no account needed.",
  },
};

export default function RootLayout({ children }) {
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
