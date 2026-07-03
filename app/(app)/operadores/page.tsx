'use client'
import CrudModule from '@/components/crud/CrudModule'
import { operadoresConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={operadoresConfig} />
}
