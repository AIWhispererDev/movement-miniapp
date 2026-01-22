import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Social - Movement Mini App',
  description: 'Post messages and reactions on Movement Network',
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


