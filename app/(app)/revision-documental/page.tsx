'use client'
import CrudModule from '@/components/crud/CrudModule'
import { revisionDocumentalConfig } from '@/lib/crud-configs'

export default function Page() {
  return <CrudModule config={revisionDocumentalConfig} />
}
