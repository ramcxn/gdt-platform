'use client'
import CrudModule from '@/components/crud/CrudModule'
import { almacenConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={almacenConfig} />
}
