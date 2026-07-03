'use client'
import CrudModule from '@/components/crud/CrudModule'
import { zonasConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={zonasConfig} />
}
