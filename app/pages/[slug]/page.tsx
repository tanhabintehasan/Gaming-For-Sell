import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> } ) {
  const { slug } = await params
  const page = await prisma.contentPage.findUnique({
    where: { slug },
  })

  if (!page || !page.isPublished) {
    notFound()
  }

  const content = page.rawContent
    .replace(/\n/g, '<br />')
    .replace(/#{1,6}\s+(.+)/g, '<h2 class="text-lg font-bold mt-6 mb-3 text-white">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-[rgba(180,200,255,0.85)]">$1</em>')

  return (
    <div className="min-h-screen relative lg:py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 py-4 lg:py-0 lg:mb-6">
          <Link href="/profile" className="p-2 -ml-2 lg:hidden text-white hover:text-[#00f5ff] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold lg:text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>{page.title}</h1>
        </div>

        <Card className="p-5 lg:p-8 glass-card border-0">
          <div
            className="prose prose-sm max-w-none text-[rgba(180,200,255,0.75)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Card>
      </div>
    </div>
  )
}
