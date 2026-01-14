import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/common/QueryProvider";
import MapProvider from "@/components/map/MapProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "아파트 실거래가 - 부동산 데이터 플랫폼",
  description: "전국 아파트 실거래가, 시세 분석, 학군/교통 정보를 한눈에",
  keywords: ["아파트", "실거래가", "부동산", "시세", "학군"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <MapProvider>
            {children}
          </MapProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
