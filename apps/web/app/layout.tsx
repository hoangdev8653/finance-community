import type { Metadata } from 'next';
import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/navigation/Header';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

import { getSiteUrlObject, siteConfig } from '@/lib/seo/site-config';
import { generateWebSiteJsonLd, generateOrganizationJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: {
    default: `${siteConfig.name} — Institutional Knowledge & Market Intelligence`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — Institutional Knowledge & Market Intelligence`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
        <JsonLd data={[generateWebSiteJsonLd(), generateOrganizationJsonLd()]} />
        <Providers>
          <ToastProvider>
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <MobileNavigation />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
