import type { Metadata } from "next";
// 1. Inter font import karein
import { Inter } from "next/font/google";
import "./globals.css";

// 2. Font configuration subset ke sath configure karein
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter", // CSS variable create karne ke liye
});

export const metadata: Metadata = {
    title: "Repairo Admin",
    description: "Secure Admin Panel for Repairo",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        {/* 3. className mein font apply kar dein */}
        <body className={`${inter.className} antialiased`}>
        {children}
        </body>
        </html>
    );
}