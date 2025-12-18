import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { BlogPageSkeleton } from "@/components/blog-skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Post {
  userId: number
  id: number
  title: string
  body: string
}

interface PageProps {
  searchParams: Promise<{
    page?: string
  }>
}

const POSTS_PER_PAGE = 9

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      next: { revalidate: 3600 }, // Revalidate every hour
    })
    if (!res.ok) throw new Error("Failed to fetch posts")
    return res.json()
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

async function BlogGrid({ page }: { page: number }) {
  const posts = await getPosts()
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const startIdx = (page - 1) * POSTS_PER_PAGE
  const paginatedPosts = posts.slice(startIdx, startIdx + POSTS_PER_PAGE)

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {paginatedPosts.map((post) => (
          <article
            key={post.id}
            className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Članak #{post.id}
                </span>
              </div>
              <h2 className="mb-3 text-xl font-bold line-clamp-2">{post.title}</h2>
              <p className="mb-4 flex-grow text-gray-600 line-clamp-3">{post.body}</p>
              <Link href={`/blog/${post.id}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Pročitaj više</Button>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link href={`/blog?page=${page - 1}`}>
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Prethodna
              </Button>
            </Link>
          )}

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/blog?page=${pageNum}`}
                className={`h-9 w-9 flex items-center justify-center rounded-md font-medium transition-colors ${
                  pageNum === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </Link>
            ))}
          </div>

          {page < totalPages && (
            <Link href={`/blog?page=${page + 1}`}>
              <Button variant="outline" className="gap-2">
                Sljedeća
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        <p className="text-sm text-gray-600">
          Stranica {page} od {totalPages}
        </p>
      </div>
    </>
  )
}

export const metadata = {
  title: "Blog - GoalTrack",
  description: "Čitajte savjete i članke o postavljanju ciljeva i izgradnji navika",
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10))

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="px-4 py-12 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Blog</h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Čitajte savjete, trikove i članke o postavljanju ciljeva, izgradnji navika i postizanju uspjeha
            </p>
          </div>

          <Suspense fallback={<BlogPageSkeleton />}>
            <BlogGrid page={page} />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
