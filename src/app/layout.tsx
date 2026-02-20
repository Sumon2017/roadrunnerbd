import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoadRunnerBD | Premium Bike Accessories",
  description: "RoadRunnerBD is your premier destination for high-quality imported motorbike accessories in Bangladesh.",
};

import PageTransition from "@/components/PageTransition";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-white selection:text-black min-h-screen bg-black overflow-x-hidden">
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
