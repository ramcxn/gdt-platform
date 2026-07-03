'use client'
import CrudModule from '@/components/crud/CrudModule'
import { sellosConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={sellosConfig} />
}
