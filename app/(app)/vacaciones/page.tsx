'use client'
import CrudModule from '@/components/crud/CrudModule'
import { vacacionesConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={vacacionesConfig} />
}
