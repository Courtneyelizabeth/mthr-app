import { notFound } from 'next/navigation'
import pages from '../../../../public/reader/pages.json'
import ReaderClient from './ReaderClient'

// Free preview length. Everything is free for now; set to e.g. 8 later to turn this into a preview.
const FREE_PAGES = 100000
const TITLES: Record<string, string> = { vol1: 'the golden season · volume 1', vol2: 'the golden season · volume 2' }

export function generateStaticParams() {
  return Object.keys(TITLES).map(vol => ({ vol }))
}

export default function ReadPage({ params }: { params: { vol: string } }) {
  const count = (pages as Record<string, number>)[params.vol]
  if (!count) notFound()
  return <ReaderClient vol={params.vol} count={count} title={TITLES[params.vol]} freePages={FREE_PAGES} />
}
