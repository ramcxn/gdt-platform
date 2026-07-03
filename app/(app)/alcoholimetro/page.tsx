'use client'
import CrudModule from '@/components/crud/CrudModule'
import { alcoholimetroConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={alcoholimetroConfig} />
}
