import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme.provider";
import { ReduxProvider } from "@/components/providers/redux.provider";
import { AuthInitializer } from "@/features/auth/components/auth-initializer";
import { DialogManagerProvider } from "@/lib/dialog-manager/dialog-manager";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const gilroy = localFont({
  src: [
    {
      path: "../assets/fonts/Gilroy/Gilroy-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/Gilroy/Gilroy-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/Gilroy/Gilroy-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gilroy",
  display: "swap",
});

export const metadata: Metadata = {
  title: "datadoc.",
  description: "Professional medical dashboard application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${gilroy.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ReduxProvider>
          <AuthInitializer />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="theme"
          >
            <DialogManagerProvider>
              {children}
              <Toaster />
            </DialogManagerProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
