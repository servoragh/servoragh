import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

export const metadata: Metadata = {
  title: "Servora — Local Services & Business Marketplace | Northern Ghana",
  description: "Connect with verified local service providers, skilled artisans, equipment suppliers, and local businesses for any task across Northern Ghana.",
  keywords: ["Northern Ghana services", "Ghana service marketplace", "local artisans Ghana", "skilled technicians Ghana", "Northern Ghana businesses", "equipment rentals", "everyday services"],
  openGraph: {
    title: "Servora — Local Services & Business Marketplace | Northern Ghana",
    description: "Discover verified artisans, service professionals, local products, and equipment rentals across Northern Ghana.",
    url: "https://servora.vercel.app",
    siteName: "Servora Ghana",
    locale: "en_GH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <AIAssistantWidget />
        <PwaInstallBanner />
      </body>
    </html>
  );
}
