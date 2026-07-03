'use client'
import CrudModule from '@/components/crud/CrudModule'
import { analisisRiesgosConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={analisisRiesgosConfig} />
}
