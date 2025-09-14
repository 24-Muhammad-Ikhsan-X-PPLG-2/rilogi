import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AnimateRoute from "@/components/AnimateRoute";

const InterFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rilogi",
  description:
    "Ngobrol lebih seru dengan Rilogi — aplikasi chat yang dirancang untuk menghadirkan kedekatan di setiap pesan. Ringan, ramah, dan selalu siap menemani setiap momen komunikasi kamu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${InterFont.variable} ${InterFont.className} antialiased overflow-x-hidden`}
      >
        <AnimateRoute>{children}</AnimateRoute>
      </body>
    </html>
  );
}
