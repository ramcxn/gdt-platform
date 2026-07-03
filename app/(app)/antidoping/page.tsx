'use client'
import CrudModule from '@/components/crud/CrudModule'
import { antidopingConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={antidopingConfig} />
}
