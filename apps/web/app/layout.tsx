import type { Metadata } from 'next';
import { Lexend, Source_Sans_3, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ToastProvider } from '@/components/ui/Toast';
import { SiteChrome } from '@/components/layout/SiteChrome';

const lexend = Lexend({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
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
    default: `${siteConfig.name} — Tri thức & Thông tin Thị trường Tài chính`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — Tri thức & Thông tin Thị trường Tài chính`,
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
    <html lang="vi" suppressHydrationWarning className={`${sourceSans.variable} ${lexend.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
        <JsonLd data={[generateWebSiteJsonLd(), generateOrganizationJsonLd()]} />
        <Providers>
          <ToastProvider>
            <SiteChrome>{children}</SiteChrome>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
