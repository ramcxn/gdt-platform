'use client'
import CrudModule from '@/components/crud/CrudModule'
import { asistenciaConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={asistenciaConfig} />
}
