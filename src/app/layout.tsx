import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SyncProvider } from "@/providers/SyncProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { PWARegister } from "@/components/pwa/PWARegister";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXTAUTH_URL || "https://runasty.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Runasty - Ranking de Corrida",
    template: "%s | Runasty",
  },
  description: "Ranking competitivo de corrida integrado com Strava. Compare seus melhores tempos de 5K, 10K e 21K! Conquiste a coroa e defenda sua dinastia!",
  keywords: ["corrida", "running", "strava", "ranking", "5k", "10k", "meia maratona", "recorde pessoal"],
  authors: [{ name: "Runasty" }],
  creator: "Runasty",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Runasty",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: "Runasty",
    title: "Runasty - Ranking Competitivo de Corrida com Strava",
    description: "Compare seus melhores tempos de 5K, 10K e 21K com outros corredores. Conquiste a coroa e defenda sua dinastia no ranking!",
  },
  twitter: {
    card: "summary_large_image",
    title: "Runasty - Ranking Competitivo de Corrida com Strava",
    description: "Compare seus tempos de 5K, 10K e 21K. Conquiste a coroa e defenda sua dinastia no ranking!",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Runasty" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Runasty" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Splash screens for iOS */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <PWARegister />
          <InstallPrompt />
          <AuthProvider>
            <SyncProvider>
              {children}
            </SyncProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
