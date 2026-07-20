import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas — The Infrastructure Intelligence Platform",
  description:
    "One intelligent operating system for the full lifecycle of infrastructure: engineering, manufacturing, procurement, construction, finance, and operations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-ink-50 text-ink-900">{children}</body>
    </html>
  );
}
