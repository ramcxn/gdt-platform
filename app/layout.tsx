import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const font = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GDT Platform — Gestión del Transporte CTPAT',
  description: 'Plataforma de gestión operativa y cumplimiento CTPAT',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${font.className} bg-background text-foreground antialiased`}>{children}</body>
    </html>
  )
}
