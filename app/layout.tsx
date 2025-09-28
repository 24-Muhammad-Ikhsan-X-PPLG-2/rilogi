import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AnimateRoute from "@/components/AnimateRoute";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@/providers/theme-provider";
import { ChatProvider } from "@/providers/chat-provider";

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
    <html lang="en" className="scroll-smooth">
      <body
        className={`${InterFont.variable} ${InterFont.className} antialiased overflow-x-hidden`}
      >
        <ChatProvider>
          <ThemeProvider>
            <AnimateRoute>{children}</AnimateRoute>
            <ToastContainer draggable />
          </ThemeProvider>
        </ChatProvider>
      </body>
    </html>
  );
}
