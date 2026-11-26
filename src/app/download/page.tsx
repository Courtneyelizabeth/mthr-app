import { stripe, ITEMS } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export default async function DownloadPage({ searchParams }: { searchParams: { session_id?: string } }) {
  let files: string[] = []
  const id = searchParams.session_id ?? ''
  try {
    const s = await stripe().checkout.sessions.retrieve(id)
    if (s.payment_status === 'paid') files = ITEMS[s.metadata?.item ?? '']?.files ?? []
  } catch {}
  return (
    <div className="px-8 pt-16 pb-24 max-w-[520px] mx-auto text-center">
      {files.length ? (
        <>
          <h1 className="font-cormorant font-light text-[40px] leading-none text-mthr-black">thank <em>you.</em></h1>
          <p className="text-[12px] text-mthr-mid mt-3">your download{files.length > 1 ? 's are' : ' is'} ready. download now and save them somewhere safe — each file can be downloaded up to 3 times. we’ve also emailed you this link.</p>
          <div className="mt-8 flex flex-col gap-3 items-center">
            {files.map(f => (
              <a key={f} href={`/api/download?session_id=${id}&file=${f}`} className="px-6 py-3 bg-mthr-black text-white text-[10px] tracking-[0.14em] uppercase rounded-full">
                download volume {f.replace('vol', '')} (pdf) ↓
              </a>
            ))}
          </div>
        </>
      ) : (
        <p className="text-[12px] text-mthr-mid">we couldn’t find that purchase. if you were charged, reply to your receipt and we’ll sort it out.</p>
      )}
    </div>
  )
}
