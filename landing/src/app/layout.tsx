import type { Metadata } from "next";
import { Manrope, Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADA | Business & Inventory Management",
  description: "ADA is a comprehensive ERP system designed for small businesses to track orders, manage expenses, and automate material inventory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${workSans.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen flex flex-col font-body">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
