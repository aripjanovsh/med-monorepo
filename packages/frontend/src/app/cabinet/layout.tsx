import type { Metadata } from "next";
import { Cabinet } from "@/components/layouts/cabinet";
import { AuthGuard } from "@/features/auth/components/auth-guard";

export const metadata: Metadata = {
  title: "DataDoc.",
  description: "Professional medical dashboard application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <Cabinet>{children}</Cabinet>
    </AuthGuard>
  );
}
