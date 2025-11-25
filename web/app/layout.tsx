import type { Metadata } from "next";
import { Inter, Poppins, Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import "./globals.css";
import I18nProvider from '@/components/I18nProvider';
import DevAuth from '@/components/DevAuth';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins"
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat"
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans"
});

export const metadata: Metadata = {
  title: "PokerMastery | Free Poker Hand Analysis & Study Tool",
  description: "Advanced hand history replayer for serious poker grinders. Analyze your poker hands interactively for free. Support for PokerStars, GGPoker, and more.",
  keywords: "poker, hand replayer, poker study, PokerStars, GGPoker, grinder, hand analysis, PokerMastery",
  authors: [{ name: "PokerMastery" }],
  openGraph: {
    title: "PokerMastery - Free Poker Hand Analysis",
    description: "Professional poker hand history analysis and replay tool",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${montserrat.variable} ${openSans.variable} font-sans antialiased`}>
        <I18nProvider>
          {children}
          <DevAuth />
        </I18nProvider>
      </body>
    </html>
  );
}
