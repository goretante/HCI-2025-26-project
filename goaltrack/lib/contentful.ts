import { createClient, type ChainModifiers, type Entry, type EntrySkeletonType } from 'contentful'

// Definiši BlogPost skeleton type za Contentful
interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: 'blogPost'
  fields: {
    title: {
      'en-US': string
    }
    richText: {
      'en-US': any
    }
    medij?: {
      'en-US': {
        sys: {
          id: string
          linkType: 'Asset'
          type: 'Link'
        }
      }
    }
  }
}

type BlogPostEntry = Entry<BlogPostSkeleton, ChainModifiers, string>

export interface BlogPost {
  id: string
  title: string
  richText: any
  medij?: {
    url: string
    title?: string
  }
}

function getContentfulClient() {
  const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN

  if (!spaceId) {
    throw new Error('NEXT_PUBLIC_CONTENTFUL_SPACE_ID je obavezna varijabla okruženja!')
  }
  if (!accessToken) {
    throw new Error('CONTENTFUL_ACCESS_TOKEN je obavezna varijabla okruženja!')
  }

  return createClient({
    space: spaceId,
    accessToken: accessToken,
  })
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const contentfulClient = getContentfulClient()
    
    const response = await contentfulClient.getEntries<BlogPostSkeleton>({
      content_type: 'blogPost',
      order: ['-sys.createdAt'],
      limit: 100,
      include: 2,
    })

    const assets = response.includes?.Asset || []
    
    return response.items.map((item) => transformEntry(item, assets))
  } catch (error) {
    console.error('Greška pri dohvaćanju blog članaka:', error)
    return []
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const contentfulClient = getContentfulClient()
    
    const response = await contentfulClient.getEntry<BlogPostSkeleton>(id, {
      include: 2,
    })
    
    const assets = (response as any).includes?.Asset || []
    return transformEntry(response, assets)
  } catch (error) {
    console.error(`Greška pri dohvaćanju blog članka sa id ${id}:`, error)
    return null
  }
}

function transformEntry(entry: BlogPostEntry, assets: any[] = []): BlogPost {
  const fields = entry.fields as any
  
  const medijLink = fields.medij?.['en-US'] || fields.medij

  let medijData: BlogPost['medij'] = undefined
  
  if (medijLink?.sys?.id) {
    const asset = assets.find((a: any) => a.sys.id === medijLink.sys.id)
    
    if (asset?.fields?.file?.url) {
      medijData = {
        url: `https:${asset.fields.file.url}`,
        title: asset.fields.title || undefined,
      }
    }
  }

  return {
    id: entry.sys.id,
    title: fields.title || 'Bez naslova',
    richText: fields.richText || null,
    medij: medijData,
  }
}