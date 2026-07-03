'use client'
import CrudModule from '@/components/crud/CrudModule'
import { accionesCorrectivasConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={accionesCorrectivasConfig} />
}
