/* eslint-disable */
'use client'
import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Search, Loader2, Download, X, Camera } from 'lucide-react'

// ─── Tipos de configuración ───────────────────────────────────────────────
export type FieldType = 'text' | 'number' | 'date' | 'datetime' | 'select' | 'boolean' | 'textarea' | 'photo'

export interface FieldDef {
  key: string
  label: string
  type?: FieldType          // default 'text'
  options?: string[]        // para type 'select'
  required?: boolean
  table?: boolean           // mostrar como columna (default: true para los primeros 6)
  badge?: Record<string, string>  // valor -> color (green|blue|amber|red|slate|indigo|purple)
}

export interface KpiDef {
  icon: string
  label: string
  sub?: string
  count: (rows: any[]) => number
}

export interface CrudConfig {
  table: string
  icon: string
  title: string
  subtitle: string
  orderBy?: string          // default 'created_at'
  orderAsc?: boolean
  fields: FieldDef[]
  kpis?: KpiDef[]
  addLabel?: string
  headerLink?: { href: string; label: string; icon?: ReactNode }  // botón extra en el header
  rowActions?: (row: any) => ReactNode                            // acciones extra por fila
}

// ─── Utilidades ───────────────────────────────────────────────────────────
const BADGE: Record<string, string> = {
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  slate: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
}

function fmt(value: any, f: FieldDef): string {
  if (value === null || value === undefined || value === '') return '—'
  if (f.type === 'boolean') return value ? 'Sí' : 'No'
  if (f.type === 'date') return new Date(value + (String(value).length <= 10 ? 'T00:00:00' : '')).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  if (f.type === 'datetime') return new Date(value).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  if (f.type === 'number' && typeof value === 'number') return value.toLocaleString('es-MX')
  return String(value)
}

function toCsv(rows: any[], fields: FieldDef[]): string {
  const esc = (s: any) => `"${String(s ?? '').replace(/"/g, '""')}"`
  const head = fields.map(f => esc(f.label)).join(',')
  const body = rows.map(r => fields.map(f => esc(r[f.key])).join(',')).join('\n')
  return '﻿' + head + '\n' + body
}

// ─── Componente principal ─────────────────────────────────────────────────
export default function CrudModule({ config }: { config: CrudConfig }) {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  async function handlePhotoUpload(fieldKey: string, file: File) {
    if (!empresaId) return
    setUploading(fieldKey)
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${empresaId}/${config.table}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('evidencias').upload(path, file, { upsert: false })
    setUploading(null)
    if (upErr) { setError('Error al subir foto: ' + upErr.message); return }
    const { data } = supabase.storage.from('evidencias').getPublicUrl(path)
    setForm(f => ({ ...f, [fieldKey]: data.publicUrl }))
  }

  const tableFields = useMemo(() => {
    const explicit = config.fields.filter(f => f.table)
    if (explicit.length > 0) return explicit
    return config.fields.slice(0, 6)
  }, [config.fields])

  useEffect(() => { fetchData() }, [config.table])

  async function fetchData() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { setLoading(false); return }
    const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
    if (!perfil?.empresa_id) { setLoading(false); return }
    setEmpresaId(perfil.empresa_id)
    const { data } = await supabase
      .from(config.table)
      .select('*')
      .eq('empresa_id', perfil.empresa_id)
      .order(config.orderBy ?? 'created_at', { ascending: config.orderAsc ?? false })
      .limit(500)
    setRows(data ?? [])
    setLoading(false)
  }

  function openNew() {
    const initial: Record<string, any> = {}
    config.fields.forEach(f => { if (f.type === 'boolean') initial[f.key] = true })
    setForm(initial); setEditing(null); setError(null); setModalOpen(true)
  }

  function openEdit(row: any) {
    const initial: Record<string, any> = {}
    config.fields.forEach(f => {
      let v = row[f.key]
      if (f.type === 'datetime' && v) v = new Date(v).toISOString().slice(0, 16)
      initial[f.key] = v ?? (f.type === 'boolean' ? false : '')
    })
    setForm(initial); setEditing(row); setError(null); setModalOpen(true)
  }

  async function handleSave() {
    setError(null)
    for (const f of config.fields) {
      if (f.required && (form[f.key] === '' || form[f.key] === null || form[f.key] === undefined)) {
        setError(`El campo "${f.label}" es obligatorio.`); return
      }
    }
    setSaving(true)
    const payload: Record<string, any> = {}
    config.fields.forEach(f => {
      let v = form[f.key]
      if (v === '' || v === undefined) v = null
      if (f.type === 'number' && v !== null) v = Number(v)
      payload[f.key] = v
    })
    let err
    if (editing) {
      ({ error: err } = await supabase.from(config.table).update(payload).eq('id', editing.id))
    } else {
      payload.empresa_id = empresaId
      ;({ error: err } = await supabase.from(config.table).insert(payload))
    }
    setSaving(false)
    if (err) { setError(err.message); return }
    setModalOpen(false)
    fetchData()
  }

  async function handleDelete(row: any) {
    if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return
    const { error: err } = await supabase.from(config.table).delete().eq('id', row.id)
    if (err) { alert('No se pudo eliminar: ' + err.message); return }
    fetchData()
  }

  function handleExport() {
    const blob = new Blob([toCsv(filtered, config.fields)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${config.table}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const filtered = useMemo(() => {
    if (!search) return rows
    const term = search.toLowerCase()
    return rows.filter(r => config.fields.some(f => String(r[f.key] ?? '').toLowerCase().includes(term)))
  }, [rows, search, config.fields])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center btn-accent">{config.icon}</div>
          <div>
            <h1 className="text-xl font-bold text-white">{config.title}</h1>
            <p className="text-slate-400 text-sm">{config.subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {config.headerLink && (
            <Link href={config.headerLink.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-white/10 text-slate-300 hover:bg-white/5">
              {config.headerLink.icon}{config.headerLink.label}
            </Link>
          )}
          <button onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-white/10 text-slate-300 hover:bg-white/5 cursor-pointer">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer btn-accent">
            <Plus className="w-4 h-4" /> {config.addLabel ?? 'Nuevo registro'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      {config.kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {config.kpis.map((k, i) => (
            <div key={i} className="glass-card rounded-xl p-5 border border-white/5">
              <span className="text-2xl block mb-2">{k.icon}</span>
              <p className="text-3xl font-bold text-white">{k.count(rows)}</p>
              <p className="text-sm text-slate-400 mt-0.5">{k.label}</p>
              {k.sub && <p className="text-xs text-slate-500 mt-1">{k.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Tabla */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white bg-transparent border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-white/5 text-slate-400">
              <tr>
                {tableFields.map(f => <th key={f.key} className="px-4 py-3 whitespace-nowrap">{f.label}</th>)}
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={tableFields.length + 1} className="px-4 py-10 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin inline-block" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={tableFields.length + 1} className="px-4 py-10 text-center text-slate-500">
                  No hay registros. Crea el primero con “{config.addLabel ?? 'Nuevo registro'}”.
                </td></tr>
              ) : filtered.map(row => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  {tableFields.map((f, i) => (
                    <td key={f.key} className={`px-4 py-3 whitespace-nowrap ${i === 0 ? 'font-medium text-white' : ''}`}>
                      {f.type === 'photo' && row[f.key] ? (
                        <a href={row[f.key]} target="_blank" rel="noreferrer">
                          <img src={row[f.key]} alt={f.label} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                        </a>
                      ) : f.badge && row[f.key] ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${BADGE[f.badge[row[f.key]] ?? 'slate']}`}>
                          {String(row[f.key]).replace(/_/g, ' ')}
                        </span>
                      ) : fmt(row[f.key], f)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {config.rowActions?.(row)}
                      <button onClick={() => openEdit(row)} className="p-1.5 text-slate-400 hover:text-blue-400 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(row)} className="p-1.5 text-slate-400 hover:text-red-400 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal alta/edición */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setModalOpen(false)}>
          <div className="glass-card rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-card, #0f1f35)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0" style={{ background: 'var(--bg-card, #0f1f35)' }}>
              <h2 className="text-lg font-bold text-white">{editing ? 'Editar' : 'Nuevo'} — {config.title}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.fields.map(f => (
                <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    {f.label}{f.required && <span className="text-red-400"> *</span>}
                  </label>
                  {f.type === 'select' ? (
                    <select value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-transparent border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-slate-800">
                      <option value="">— Seleccionar —</option>
                      {f.options?.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </select>
                  ) : f.type === 'boolean' ? (
                    <label className="flex items-center gap-2 py-2 cursor-pointer">
                      <input type="checkbox" checked={!!form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })}
                        className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-slate-300">Sí</span>
                    </label>
                  ) : f.type === 'photo' ? (
                    <div className="flex items-center gap-3">
                      <input type="file" accept="image/*" capture="environment" className="hidden"
                        ref={el => { fileInputRefs.current[f.key] = el }}
                        onChange={e => { const file = e.target.files?.[0]; if (file) handlePhotoUpload(f.key, file) }} />
                      <button type="button" onClick={() => fileInputRefs.current[f.key]?.click()}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-white/10 text-slate-300 hover:bg-white/5 cursor-pointer">
                        <Camera className="w-4 h-4" />
                        {uploading === f.key ? 'Subiendo...' : form[f.key] ? 'Cambiar foto' : 'Tomar / subir foto'}
                      </button>
                      {form[f.key] && <img src={form[f.key]} alt="" className="w-12 h-12 rounded-lg object-cover border border-white/10" />}
                    </div>
                  ) : f.type === 'textarea' ? (
                    <textarea rows={3} value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-transparent border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'datetime' ? 'datetime-local' : 'text'}
                      value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-transparent border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]" />
                  )}
                </div>
              ))}
              {error && <p className="sm:col-span-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5 cursor-pointer">Cancelar</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 cursor-pointer btn-accent">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
