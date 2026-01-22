import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./theme-init.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Move Everything - Mini-App Sharing",
  description: "Share content from Move Everything mini-apps with beautiful previews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      style={{ backgroundColor: '#0A0F1E', color: '#ffffff' }}
    >
      <body
        suppressHydrationWarning
        style={{ backgroundColor: '#0A0F1E', color: '#ffffff' }}
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0F1E] dark:bg-[#0A0F1E] bg-white dark:text-white text-gray-900 transition-colors duration-200`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = theme === 'dark' || (!theme && prefersDark);
                  
                  // Apply styles immediately before any rendering
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.backgroundColor = '#0A0F1E';
                    document.documentElement.style.color = '#ffffff';
                    if (document.body) {
                      document.body.style.backgroundColor = '#0A0F1E';
                      document.body.style.color = '#ffffff';
                    }
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.backgroundColor = '#ffffff';
                    document.documentElement.style.color = '#111827';
                    if (document.body) {
                      document.body.style.backgroundColor = '#ffffff';
                      document.body.style.color = '#111827';
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
