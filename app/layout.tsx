import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Raleway, Noto_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMonoHeading = JetBrains_Mono({subsets:['latin'],variable:'--font-heading'});

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WHO'S DIFFERENT?",
  description: "누가 봐도 똑같죠? …정말 그럴까요? 👽",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, raleway.variable, jetbrainsMonoHeading.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
