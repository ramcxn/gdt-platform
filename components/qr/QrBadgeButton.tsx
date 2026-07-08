/* eslint-disable */
'use client'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, X, Printer } from 'lucide-react'

/**
 * Botón por fila que abre una credencial con código QR.
 * value: contenido del QR (id o número de empleado/zona).
 */
export default function QrBadgeButton({ value, title, subtitle }: { value: string; title: string; subtitle?: string }) {
  const [open, setOpen] = useState(false)
  if (!value) return null

  function handlePrint() {
    const w = window.open('', '_blank', 'width=400,height=560')
    if (!w) return
    const svg = document.getElementById(`qr-badge-${value}`)?.outerHTML ?? ''
    w.document.write(`<html><head><title>Credencial</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:32px">
        <h2 style="margin-bottom:4px">${title}</h2>
        <p style="color:#64748b;margin-top:0">${subtitle ?? ''}</p>
        <div style="margin:24px auto">${svg}</div>
        <p style="font-family:monospace;font-size:13px">${value}</p>
        <script>window.onload = () => { window.print(); window.close() }</script>
      </body></html>`)
    w.document.close()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} title="Ver código QR"
        className="p-1.5 text-slate-400 hover:text-indigo-400 cursor-pointer">
        <QrCode className="w-4 h-4" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setOpen(false)}>
          <div className="glass-card rounded-2xl border border-white/10 p-8 text-center max-w-xs w-full"
            style={{ background: 'var(--bg-card, #0f1f35)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-end -mt-4 -mr-4">
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            {subtitle && <p className="text-sm text-slate-400 mb-4">{subtitle}</p>}
            <div className="bg-white rounded-xl p-4 inline-block">
              <QRCodeSVG id={`qr-badge-${value}`} value={value} size={180} level="M" />
            </div>
            <p className="font-mono text-xs text-slate-400 mt-3">{value}</p>
            <button onClick={handlePrint}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer btn-accent">
              <Printer className="w-4 h-4" /> Imprimir credencial
            </button>
          </div>
        </div>
      )}
    </>
  )
}
