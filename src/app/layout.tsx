import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Analyst",
  description: "Personal AI-driven stock analyst",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}