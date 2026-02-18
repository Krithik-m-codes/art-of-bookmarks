import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Art of Bookmarks - Smart Bookmark Manager",
  description:
    "Save, organize, and sync your bookmarks across all devices in real-time. Secure, fast, and beautifully designed bookmark manager with Google OAuth.",
  keywords: [
    "bookmarks",
    "bookmark manager",
    "bookmark organizer",
    "save links",
    "real-time sync",
    "productivity",
  ],
  authors: [{ name: "Art of Bookmarks" }],
  creator: "Art of Bookmarks",
  publisher: "Art of Bookmarks",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: "Art of Bookmarks",
    title: "Art of Bookmarks - Smart Bookmark Manager",
    description:
      "Save, organize, and sync your bookmarks across all devices in real-time",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Art of Bookmarks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Art of Bookmarks - Smart Bookmark Manager",
    description:
      "Save, organize, and sync your bookmarks across all devices in real-time",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased bg-linear-to-br from-blue-50 via-blue-50 to-purple-50`}>
        {children}
      </body>
    </html>
  );
}
