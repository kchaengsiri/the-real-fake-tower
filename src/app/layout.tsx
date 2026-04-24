import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "The Real Fake Tower",
  description:
    "A mathematical puzzle game - climb the tower by defeating enemies!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
