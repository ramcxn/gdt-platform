'use client'
import CrudModule from '@/components/crud/CrudModule'
import { clientesConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={clientesConfig} />
}
