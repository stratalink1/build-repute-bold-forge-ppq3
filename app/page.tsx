import nextDynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const PageClient = nextDynamic(() => import('./PageClient'), { ssr: false })

export default function Page() {
  return <PageClient />
}
