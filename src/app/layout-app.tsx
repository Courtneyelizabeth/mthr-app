import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
