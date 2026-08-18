import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import Navbar from "@/components/navbar";
import WebSocketNotification from "@/components/websocket-notification";

export const metadata: Metadata = {
  title: "LEXACOMMERCE - Multi-Vendor Platform",
  description: "Platform e-commerce multi-vendor (Light Version) built with Next.js and FastAPI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <WebSocketNotification />
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
