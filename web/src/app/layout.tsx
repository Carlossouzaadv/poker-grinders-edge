import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins"
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
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
