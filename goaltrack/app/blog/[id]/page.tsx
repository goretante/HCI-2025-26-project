import { getBlogPostById } from "@/lib/contentful"
import Image from "next/image"
import Link from "next/link"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"
import { BLOCKS, MARKS } from "@contentful/rich-text-types"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export const dynamicParams = true
export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    const post = await getBlogPostById(id)

    if (!post) {
      return {
        title: "Članak nije pronađen",
        description: "Traženi članak nije dostupan",
      }
    }

    return {
      title: `${post.title} - GoalTrack Blog`,
      description: post.title,
    }
  } catch (error) {
    return {
      title: "Greška",
      description: "Došlo je do greške pri učitavanju članka",
    }
  }
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  console.log('📄 Učitavanje blog članka sa id:', id, 'tip:', typeof id)
  
  let post
  try {
    post = await getBlogPostById(id)
    console.log('✅ Članak učitan:', post?.id, post?.title)
  } catch (error) {
    console.error('❌ Greška pri dohvaćanju članka:', error)
    notFound()
  }

  if (!post) {
    console.log('⚠️ Članak je null, pozivam notFound()')
    notFound()
  }

  const richTextOptions = {
    renderMark: {
      [MARKS.BOLD]: (text: any) => <strong className="font-bold">{text}</strong>,
      [MARKS.ITALIC]: (text: any) => <em className="italic">{text}</em>,
      [MARKS.UNDERLINE]: (text: any) => <u className="underline">{text}</u>,
      [MARKS.CODE]: (text: any) => (
        <code className="bg-gray-200 text-gray-800 px-2 py-1 rounded font-mono text-sm">
          {text}
        </code>
      ),
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: any, children: any) => (
        <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (node: any, children: any) => (
        <h1 className="text-4xl font-bold mb-6 mt-8 text-gray-900">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (node: any, children: any) => (
        <h2 className="text-3xl font-bold mb-4 mt-6 text-gray-900">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (node: any, children: any) => (
        <h3 className="text-2xl font-bold mb-3 mt-5 text-gray-900">{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (node: any, children: any) => (
        <h4 className="text-xl font-bold mb-2 mt-4 text-gray-900">{children}</h4>
      ),
      [BLOCKS.UL_LIST]: (node: any, children: any) => (
        <ul className="list-disc mb-4 space-y-2 text-gray-700 pl-6">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node: any, children: any) => (
        <ol className="list-decimal mb-4 space-y-2 text-gray-700 pl-6">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (node: any, children: any) => (
        <li className="text-gray-700">{children}</li>
      ),
      [BLOCKS.QUOTE]: (node: any, children: any) => (
        <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700 bg-gray-50 py-4 pr-4">
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-8 border-gray-300" />,
    },
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Nazad na blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="mx-auto max-w-4xl px-4 py-12 md:py-20">
        {/* Featured Image */}
        {post.medij?.url && (
          <div className="relative w-full h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={post.medij.url}
              alt={post.medij.title || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
              <span>GoalTrack</span>
            </div>
            <span>•</span>
            <span>Blog članak</span>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-none mb-12 text-gray-800">
          {post.richText ? (
            documentToReactComponents(post.richText, richTextOptions)
          ) : (
            <p className="text-gray-600">Nema sadržaja za ovaj članak.</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
            <div>
              <p className="font-bold text-gray-900">GoalTrack</p>
              <p className="text-sm text-gray-600">Postavljajte ciljeve i gradite navike</p>
            </div>
          </div>
          
          <Link href="/blog">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <ChevronLeft className="h-4 w-4" />
              Vidi sve članke
            </Button>
          </Link>
        </div>
      </article>

      {/* Related Posts */}
      <section className="bg-white border-t border-gray-200 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold mb-8">Više članaka</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <p className="text-gray-500 col-span-full">Više članaka će biti dostupno uskoro</p>
          </div>
        </div>
      </section>
    </main>
  )
}