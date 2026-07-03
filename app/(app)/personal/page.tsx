'use client'
import CrudModule from '@/components/crud/CrudModule'
import { personalConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={personalConfig} />
}
