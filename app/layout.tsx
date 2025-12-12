import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { NappyBot } from "@/components/chatbot/nappybot"
import "./globals.css"
import { Toaster } from "react-hot-toast"


const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NappyLocks - Soins Capillaires Naturels & Services de Coiffure",
  description:
    "Plateforme e-commerce intelligente dédiée aux services et produits capillaires naturels. Découvrez nos coiffures, produits naturels et prenez rendez-vous en ligne.",
  keywords: [
    "cheveux naturels",
    "coiffure afro",
    "produits capillaires",
    "NappyLocks",
    "soins cheveux",
    "salon de coiffure",
  ],
  openGraph: {
    title: "NappyLocks - Soins Capillaires Naturels",
    description: "Services et produits pour cheveux naturels",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/logonappy.jpg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logonappy.jpg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
    
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans antialiased`}>
        {children}
        <NappyBot />
        <Analytics />
        {/* TOASTER MAGIQUE ICI */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={12}
          containerStyle={{ margin: "16px" }}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#fff",
              borderRadius: "12px",
              padding: "14px 18px",
              fontSize: "15px",
              fontWeight: "500",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            },
           success: {
      duration: 3500,
      style: {
        background: "#10b981",
      },
              icon: (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ),
              }, error: {
              duration: 5000,
              style: {
                background: "#ef4444",
              }
            }
          }}
        />
      </body>
    </html>
  )
}
