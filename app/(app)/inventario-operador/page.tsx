'use client'
import CrudModule from '@/components/crud/CrudModule'
import { inventarioOperadorConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={inventarioOperadorConfig} />
}
