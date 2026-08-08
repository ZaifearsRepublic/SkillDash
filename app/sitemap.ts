import type { MetadataRoute } from 'next';
import { getAllDseStocks } from '@/lib/dseStocks';
import { getBlogPosts } from '@/lib/contentful-blog';

const baseUrl = (
  process.env.NEXT_PUBLIC_MAIN_DOMAIN ||
  'https://www.stocksimulator.tech'
).replace(/\/$/, '');

export const revalidate = 3600;

function withBaseUrl(path: string): string {
  return `${baseUrl}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [stocks, blogPosts] = await Promise.all([
    getAllDseStocks(),
    getBlogPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: withBaseUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: withBaseUrl('/trade'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: withBaseUrl('/stocks'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: withBaseUrl('/blog'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: withBaseUrl('/about-us'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const stockRoutes: MetadataRoute.Sitemap = stocks.map((stock) => ({
    url: withBaseUrl(
      `/stocks/${encodeURIComponent(stock.symbol.toLowerCase())}`
    ),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: withBaseUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: post.lastVerifiedAt ? 'weekly' : 'monthly',
    priority: post.featured ? 0.8 : 0.7,
  }));

  return [...staticRoutes, ...blogRoutes, ...stockRoutes];
}