import Link from "next/link"
import { Suspense } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlogPostDetailSkeleton } from "@/components/blog-skeleton"

interface Post {
  userId: number
  id: number
  title: string
  body: string
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error("Failed to fetch post")
    return res.json()
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

async function BlogPostContent({ id }: { id: string }) {
  const post = await getPost(id)

  if (!post) {
    return (
      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold">Blog post nije pronađen</h1>
          <p className="mb-6 text-gray-600">Izvinjavam se, blog post koji tražite ne postoji.</p>
          <Link href="/blog">
            <Button className="bg-blue-600 hover:bg-blue-700">Povratak na blog</Button>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/blog" className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Povratak na blog
        </Link>

        <article className="rounded-lg bg-white p-8 shadow-sm md:p-12">
          <div className="mb-6 border-b pb-6">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Članak #{post.id}
            </span>
            <h1 className="mt-2 text-4xl font-bold md:text-5xl">{post.title}</h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>18. siječnja 2025.</span>
              <span>•</span>
              <span>~{Math.ceil(post.body.split(" ").length / 200)} min čitanja</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {post.body.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-6 leading-relaxed text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 border-t pt-8">
            <p className="mb-6 text-sm text-gray-600">
              Jeste li zainteresirani za postavljanje ciljeva i izgradnju navika? Pokrenite svoju GoalTrack putanju
              hoje.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">Počnite s GoalTrackom</Button>
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const post = await getPost((await params).id)
  return {
    title: post?.title ? `${post.title} - GoalTrack Blog` : "Blog Post - GoalTrack",
    description: post?.body?.substring(0, 160) || "Čitaj blog post na GoalTracku",
  }
}

export async function generateStaticParams() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts")
  const posts: Post[] = await res.json()
  return posts.slice(0, 20).map((post) => ({
    id: String(post.id),
  }))
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<BlogPostDetailSkeleton />}>
        <BlogPostContent id={id} />
      </Suspense>
    </main>
  )
}
