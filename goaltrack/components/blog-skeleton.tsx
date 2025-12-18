export function PostSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="p-6 flex flex-col h-full">
        <div className="mb-4">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="mb-3 space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-5/6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="mb-4 flex-grow space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}

export function BlogPageSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )
}

export function BlogPostDetailSkeleton() {
  return (
    <article className="rounded-lg bg-white p-8 shadow-sm md:p-12">
      <div className="mb-6 border-b pb-6">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-4/5 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t pt-8">
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </article>
  )
}
