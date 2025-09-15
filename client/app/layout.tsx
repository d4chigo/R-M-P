import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { Navbar } from "@/components/Navbar";
import { TutorialTour } from "@/components/TutorialTour";
import { TutorialFloatingButton } from "@/components/TutorialFloatingButton";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary"; // Asegúrate de crear este componente

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "R-M-P",
  description:
    "Plataforma integral para la administración de vehículos, rutas, clientes y operaciones logísticas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TutorialProvider>
              <Navbar />
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
              <TutorialTour />
              <Toaster />
            </TutorialProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
