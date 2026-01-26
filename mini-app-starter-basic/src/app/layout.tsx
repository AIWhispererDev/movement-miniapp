import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini App Starter Basic",
  description: "A simple counter mini app starter with basic styling",
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
