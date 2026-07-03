'use client'
import CrudModule from '@/components/crud/CrudModule'
import { visitasConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={visitasConfig} />
}
