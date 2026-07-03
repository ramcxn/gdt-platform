'use client'
import CrudModule from '@/components/crud/CrudModule'
import { inventarioConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={inventarioConfig} />
}
