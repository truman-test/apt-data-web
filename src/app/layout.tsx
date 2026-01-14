import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/common/QueryProvider";
import MapProvider from "@/components/map/MapProvider";
import { ToastContainer } from "@/components/common/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "아파트 실거래가 - 부동산 데이터 플랫폼",
    template: "%s | 아파트 실거래가",
  },
  description: "전국 아파트 실거래가 조회, 시세 분석, 단지 비교 서비스. 2,200만 건의 매매/전월세 거래 데이터를 한눈에.",
  keywords: ["아파트", "실거래가", "부동산", "시세", "매매", "전세", "월세", "아파트시세", "부동산시세"],
  authors: [{ name: "아파트시세" }],
  creator: "아파트시세",
  publisher: "아파트시세",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "아파트 실거래가",
    title: "아파트 실거래가 - 부동산 데이터 플랫폼",
    description: "전국 아파트 실거래가 조회, 시세 분석, 단지 비교 서비스",
  },
  twitter: {
    card: "summary_large_image",
    title: "아파트 실거래가 - 부동산 데이터 플랫폼",
    description: "전국 아파트 실거래가 조회, 시세 분석, 단지 비교 서비스",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        <ToastContainer />
      </body>
    </html>
  );
}
