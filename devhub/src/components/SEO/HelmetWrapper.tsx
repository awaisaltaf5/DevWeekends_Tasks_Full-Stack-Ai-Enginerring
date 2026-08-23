import { Helmet } from 'react-helmet-async'

export const SITE_URL = 'https://devhub.app'
export const DEFAULT_TITLE = 'DevHub - Discover, Bookmark & Organize GitHub Repositories'
export const DEFAULT_DESCRIPTION = 'DevHub helps you discover, search, bookmark, and organize the best open-source GitHub repositories. Find trending projects, save with tags and notes, and track your favorite repos.'

export const pageMetadata = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: 'GitHub, repositories, open source, discover repos, bookmark repos, trending projects, developer tools',
    ogImage: `${SITE_URL}/og-image.png`,
    canonical: `${SITE_URL}/`,
  },
  search: {
    title: 'Search GitHub Repositories - DevHub',
    description: 'Search and discover GitHub repositories. Filter by language, stars, and more. Find the perfect open-source project for your next build.',
    keywords: 'search GitHub, find repositories, repo search, GitHub explorer, open source search',
    ogImage: `${SITE_URL}/og-image.png`,
    canonical: `${SITE_URL}/search`,
  },
  bookmarks: {
    title: 'My Bookmarks - DevHub',
    description: 'Manage your bookmarked GitHub repositories. Organize with tags, add notes, and export your collection.',
    keywords: 'bookmarks, saved repos, GitHub bookmarks, repository manager, organize repos',
    ogImage: `${SITE_URL}/og-image.png`,
    canonical: `${SITE_URL}/bookmarks`,
  },
}

export const getDynamicPageMetadata = (repo) => {
  if (!repo) return null
  
  const title = `${repo.full_name || repo.name} - DevHub`
  const description = repo.description || `View ${repo.full_name || repo.name} on DevHub. ${repo.stargazers_count?.toLocaleString() || 0} stars on GitHub.`
  const keywords = [
    repo.name,
    repo.language,
    ...(repo.topics || []),
    'GitHub repository',
    'open source',
  ].filter(Boolean).join(', ')
  
  return {
    title,
    description,
    keywords,
    ogImage: repo.owner?.avatar_url || `${SITE_URL}/og-image.png`,
    canonical: `${SITE_URL}/repo/${repo.owner?.login}/${repo.name}`,
    type: 'article',
    publishedTime: repo.created_at,
    updatedTime: repo.updated_at,
  }
}

function SEOHelmet({ pageKey, dynamicData }) {
  const page = pageKey ? pageMetadata[pageKey] : null
  const metadata = dynamicData || page
  
  if (!metadata) return null

  const schemaData = dynamicData ? {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: dynamicData.full_name || dynamicData.name,
    description: dynamicData.description,
    codeRepository: dynamicData.html_url,
    programmingLanguage: dynamicData.language,
    dateCreated: dynamicData.created_at,
    dateModified: dynamicData.updated_at,
    author: {
      '@type': 'Person',
      name: dynamicData.owner?.login,
      url: dynamicData.owner?.html_url,
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/HowToFavoritesAction',
      userInteractionCount: dynamicData.stargazers_count,
    },
  } : null

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="title" content={metadata.title} />
      <meta name="description" content={metadata.description} />
      {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}
      
      {/* Canonical */}
      {metadata.canonical && <link rel="canonical" href={metadata.canonical} />}
      
      {/* Open Graph */}
      <meta property="og:type" content={metadata.type || 'website'} />
      <meta property="og:url" content={metadata.canonical || SITE_URL} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:image" content={metadata.ogImage} />
      {metadata.ogImage && <meta property="og:image:alt" content={metadata.title} />}
      <meta property="og:site_name" content="DevHub" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metadata.canonical || SITE_URL} />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={metadata.ogImage} />
      {metadata.ogImage && <meta name="twitter:image:alt" content={metadata.title} />}
      
      {/* Article Specific Meta */}
      {metadata.type === 'article' && (
        <>
          {metadata.publishedTime && <meta property="article:published_time" content={metadata.publishedTime} />}
          {metadata.updatedTime && <meta property="article:modified_time" content={metadata.updatedTime} />}
        </>
      )}
      
      {/* Structured Data */}
      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  )
}

export default SEOHelmet