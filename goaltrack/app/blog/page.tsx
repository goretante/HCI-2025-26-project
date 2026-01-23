import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { getBlogPosts } from "@/lib/contentful"
import type { BlogPost } from "@/lib/contentful"
import Link from "next/link"
import Image from "next/image"

const POSTS_PER_PAGE = 9

export const metadata = {
  title: "Blog - GoalTrack",
  description: "Pročitajte savjete i članke o postavljanju ciljeva i izgradnji navika",
}

// Funkcija koja ekstrahira tekst iz rich text strukture
function extractTextFromRichText(richText: any): string {
  if (!richText) return ""
  
  let text = ""
  
  const traverse = (node: any) => {
    if (!node) return
    
    if (node.nodeType === "text") {
      text += node.value + " "
    } else if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse)
    }
  }
  
  if (richText.content && Array.isArray(richText.content)) {
    richText.content.forEach(traverse)
  }
  
  return text.trim()
}

export default async function BlogPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10))

  const posts = await getBlogPosts()
  
  if (!posts || posts.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-12 px-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-2 text-4xl font-bold text-white">GoalTrack Blog</h1>
            <p className="text-lg text-purple-100">Savjeti i inspiracija za postizanje vaših ciljeva</p>
          </div>
        </div>

        <section className="px-4 py-12 md:py-20">
          <div className="mx-auto max-w-7xl text-center py-16">
            <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Još nema objavljenih članaka</h3>
            <p className="text-gray-500">Članci će se pojaviti ovdje kada budu objavljeni.</p>
          </div>
        </section>
      </main>
    )
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))
  const startIdx = (page - 1) * POSTS_PER_PAGE
  const paginatedPosts = posts.slice(startIdx, startIdx + POSTS_PER_PAGE)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Zaglavlje */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-12 px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-4xl font-bold text-white">GoalTrack Blog</h1>
          <p className="text-lg text-purple-100">Savjeti i inspiracija za postizanje vaših ciljeva</p>
        </div>
      </div>

      <section className="px-4 py-12 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Blog</h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Pročitajte savjete, trikove i članke o postavljanju ciljeva, izgradnji navika i postizanju uspjeha
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedPosts.map((post) => {
              const excerpt = extractTextFromRichText(post.richText)
              
              return (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <article className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg border border-gray-100 h-full flex flex-col cursor-pointer">
                    {/* Istaknuta slika */}
                    {post.medij?.url && (
                      <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                        <Image
                          src={post.medij.url}
                          alt={post.medij.title || post.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-grow">
                      {/* Naslov */}
                      <h2 className="mb-3 text-xl font-bold line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>

                      {/* Pregled teksta - samo obični tekst */}
                      {excerpt && (
                        <p className="mb-4 flex-grow text-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {excerpt}
                        </p>
                      )}

                      {/* CTA gumb */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Pročitaj članak
                        </Button>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>

          {/* Paginacija */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {page > 1 ? (
                  <Link href={`/blog?page=${page - 1}`}>
                    <Button variant="outline" className="gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Prethodna</span>
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="outline" 
                    className="gap-2 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Prethodna</span>
                  </Button>
                )}

                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/blog?page=${pageNum}`}
                      className={`h-10 w-10 flex items-center justify-center rounded-lg font-medium transition-all duration-200 ${
                        pageNum === page
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  ))}
                </div>

                {page < totalPages ? (
                  <Link href={`/blog?page=${page + 1}`}>
                    <Button variant="outline" className="gap-2">
                      <span className="hidden sm:inline">Sljedeća</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="outline" 
                    className="gap-2 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <span className="hidden sm:inline">Sljedeća</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <p className="text-sm text-gray-500">
                Stranica <span className="font-semibold text-gray-700">{page}</span> od <span className="font-semibold text-gray-700">{totalPages}</span>
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
