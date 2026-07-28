import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { BackToTop } from "@/components/ui/BackToTop";
import { ClickParticles } from "@/components/effects/ClickParticles";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { MusicPlayer } from "@/components/widgets/MusicPlayer";
import { SITE } from "@/lib/constants";
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
  title: {
    default: SITE.title,
    template: `%s | ${SITE.title}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    type: "website",
    siteName: SITE.title,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /> */}
      <body className="flex min-h-full flex-col bg-bg text-text">

        <ThemeProvider>
          <ProgressBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
          <MusicPlayer />
          <ClickParticles />
          <CursorGlow />
        </ThemeProvider>
      </body>
    </html>
  );
}
