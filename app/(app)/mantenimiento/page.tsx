'use client'
import CrudModule from '@/components/crud/CrudModule'
import { mantenimientoConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={mantenimientoConfig} />
}
