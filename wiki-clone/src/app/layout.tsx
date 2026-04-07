import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lev Manovich Knowledge Base",
  description: "A comprehensive wiki on Lev Manovich's new media theory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
