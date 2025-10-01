import type { Metadata } from "next";
import { Inter, Poppins, Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import I18nProvider from '@/components/I18nProvider';

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
  title: "Poker Hand Replayer | Estude suas mãos de Poker de Graça",
  description: "A ferramenta de estudo que faltava para os grinders. Visualize suas mãos de poker de forma interativa e gratuita. Suporte para PokerStars, GGPoker e mais.",
  keywords: "poker, hand replayer, estudo poker, PokerStars, GGPoker, grinder, análise mãos",
  authors: [{ name: "Poker Grinder's Edge" }],
  openGraph: {
    title: "Poker Hand Replayer - Estude de Graça",
    description: "A ferramenta de estudo que faltava para os grinders",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${poppins.variable} ${montserrat.variable} ${openSans.variable} font-sans antialiased`}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
