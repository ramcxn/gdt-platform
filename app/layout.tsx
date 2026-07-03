import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GDT Platform — Gestión del Transporte CTPAT",
  description: "Sistema de gestión de transporte con estándares CTPAT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('gdt-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased hide-scrollbar">
        {children}
      </body>
    </html>
  );
}
