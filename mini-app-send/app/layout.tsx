import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Send Tokens - Movement Mini App",
  description: "Send MOVE tokens instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
