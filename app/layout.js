import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import {
  ClerkProvider,

} from "@clerk/nextjs";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MoneyMap",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen mt-36">{children}</main>
          <footer className="bg-blue-100 py-12">
            <div className="mx-auto container text-center px-4 text-gray-600">
              © {new Date().getFullYear()} Utkarsh Singh Rawat. All rights reserved.
            </div>
          </footer>
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
