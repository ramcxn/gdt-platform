'use client'
import CrudModule from '@/components/crud/CrudModule'
import { instalacionesConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={instalacionesConfig} />
}
