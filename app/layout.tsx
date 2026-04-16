import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { FakeOrderNotifications } from "@/components/fake-order-notifications";
import "./globals.css";

export const metadata: Metadata = {
  title: "速凌电竞 - 专业游戏陪玩服务平台",
  description: "速凌电竞是专业的游戏陪玩服务平台，提供三角洲行动、王者荣耀、和平精英等热门游戏的陪玩、代打、教学服务。",
  other: {
    "google": "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <div className="futuristic-grid" />
        <div className="futuristic-scanlines" />
        <LayoutWrapper>{children}</LayoutWrapper>
        <FakeOrderNotifications />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
