import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Footer from '@/components/shared/Footer';
import { getBlogPosts, type BlogPost } from '@/lib/contentful-blog';

const baseUrl = 'https://www.stocksimulator.tech';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Bangladesh Stock Market Blog | DSE Guides & Investing Education',
  description:
    'Educational guides about the Dhaka Stock Exchange, BO accounts, DSE trading hours, circuit breakers, brokers, and paper trading in Bangladesh.',
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    type: 'website',
    url: `${baseUrl}/blog`,
    title: 'Bangladesh Stock Market Blog | StockSimulatorBD',
    description:
      'Learn about DSE trading, BO accounts, market rules, brokers, and paper trading through practical Bangladesh-focused guides.',
    siteName: 'StockSimulatorBD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bangladesh Stock Market Blog | StockSimulatorBD',
    description:
      'Practical guides on DSE trading, BO accounts, market rules, brokers, and paper trading in Bangladesh.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function estimateReadingTime(post: BlogPost): number {
  const approximateWordCount = post.excerpt.trim().split(/\s+/).length * 8;

  return Math.max(1, Math.ceil(approximateWordCount / 200));
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${baseUrl}/blog#blog`,
    name: 'StockSimulatorBD Blog',
    description:
      'Educational articles about the Dhaka Stock Exchange, paper trading, BO accounts, market rules, and financial literacy in Bangladesh.',
    url: `${baseUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'StockSimulatorBD',
      url: baseUrl,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.seoDescription || post.excerpt,
      url: `${baseUrl}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: post.author
        ? {
            '@type': 'Person',
            name: post.author.name,
          }
        : undefined,
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogListSchema).replace(/</g, '\\u003c'),
        }}
      />

      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-12">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Bangladesh market education
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Learn the Bangladesh stock market
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Practical, educational guides on the Dhaka Stock Exchange, BO
                accounts, DSE market rules, trading concepts, brokers, and
                paper-trading preparation.
              </p>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Educational information only. This blog is not investment,
                trading, legal, or financial advice. Verify time-sensitive
                market information with official sources before acting.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[250px] sm:max-w-[310px] lg:max-w-[430px]">
              <div className="absolute inset-x-6 bottom-4 top-10 rounded-full bg-emerald-500/15 blur-3xl dark:bg-emerald-400/10" />

              <Image
                src="/images/blog-hero-mascot.png"
                alt="StockSimulatorBD learner studying a simulated stock market dashboard"
                width={1024}
                height={1024}
                priority
                sizes="(max-width: 640px) 250px, (max-width: 1024px) 310px, 430px"
                className="relative h-auto w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-semibold">Articles are coming soon.</h2>

            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Publish an article in Contentful to display it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => {
              const readingTime = estimateReadingTime(post);

              return (
                <article
                  key={post.id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800"
                    aria-label={`Read ${post.title}`}
                  >
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage.url}
                        alt={post.coverImageAlt}
                        width={post.coverImage.width}
                        height={post.coverImage.height}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-center text-lg font-bold text-white">
                        StockSimulatorBD
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {post.category}
                      </span>

                      {post.featured && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                          Featured
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold leading-snug tracking-tight">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {post.excerpt}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(post.publishedAt)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {readingTime} min read
                      </span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:gap-3 dark:text-emerald-400"
                    >
                      Read guide
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-slate-900 p-8 text-white dark:bg-emerald-950 sm:p-10">
            <h2 className="text-2xl font-bold">
              Learn by practising, not risking real money.
            </h2>

            <p className="mt-3 max-w-2xl text-slate-300">
              Explore StockSimulatorBD to practise DSE-style investing concepts
              with virtual money before making real-world financial decisions.
            </p>

            <Link
              href="/simulator"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Open StockSimulatorBD
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}