import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tami Dash — CreateWhiz Monitor",
  description: "Dashboard monitoring user, credit, dan deliverables CreateWhiz",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
