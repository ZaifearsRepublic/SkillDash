import type { Document } from '@contentful/rich-text-types';
import { contentfulClient } from '@/lib/contentful';

const BLOG_CONTENT_TYPE = 'stockSimulatorBdBlogPost';

type ArticleType = 'BlogPosting' | 'Guide' | 'HowTo' | 'NewsArticle';

type UnknownRecord = Record<string, unknown>;

export interface BlogImage {
  url: string;
  width: number;
  height: number;
  title: string | null;
}

export interface BlogAuthor {
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatar: BlogImage | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  coverImage: BlogImage | null;
  coverImageAlt: string;
  content: Document;
  category: string;
  tags: string[];
  publishedAt: string;
  lastVerifiedAt: string | null;
  articleType: ArticleType;
  featured: boolean;
  author: BlogAuthor | null;
  faq: unknown;
  sources: unknown;
  updatedAt: string;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getFirstLocalizedValue(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  const values = Object.values(value);

  return values.find((item) => item !== undefined) ?? null;
}

function getStringValue(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (isRecord(value)) {
    const localizedValue = getFirstLocalizedValue(value);

    return typeof localizedValue === 'string' ? localizedValue : null;
  }

  return null;
}

function getBooleanValue(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (isRecord(value)) {
    const localizedValue = getFirstLocalizedValue(value);

    return typeof localizedValue === 'boolean' ? localizedValue : false;
  }

  return false;
}

function getNumberValue(value: unknown): number | null {
  if (typeof value === 'number') {
    return value;
  }

  if (isRecord(value)) {
    const localizedValue = getFirstLocalizedValue(value);

    return typeof localizedValue === 'number' ? localizedValue : null;
  }

  return null;
}

function getStringArray(value: unknown): string[] {
  const localizedValue = isRecord(value)
    ? getFirstLocalizedValue(value)
    : value;

  if (!Array.isArray(localizedValue)) {
    return [];
  }

  return localizedValue.filter(
    (item): item is string => typeof item === 'string'
  );
}

function getRecordValue(value: unknown): UnknownRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  return value;
}

function getResourceFields(value: unknown): UnknownRecord | null {
  const directResource = getRecordValue(value);

  if (!directResource) {
    return null;
  }

  const directFields = getRecordValue(directResource.fields);

  if (directFields) {
    return directFields;
  }

  for (const localizedValue of Object.values(directResource)) {
    const localizedResource = getRecordValue(localizedValue);
    const localizedFields = localizedResource
      ? getRecordValue(localizedResource.fields)
      : null;

    if (localizedFields) {
      return localizedFields;
    }
  }

  return null;
}

function getRequiredString(
  fields: UnknownRecord,
  fieldName: string
): string {
  const value = getStringValue(fields[fieldName]);

  if (!value) {
    throw new Error(
      `Contentful blog post is missing the required "${fieldName}" field.`
    );
  }

  return value;
}

function getDocument(value: unknown): Document {
  const directValue = getRecordValue(value);

  if (
    directValue &&
    directValue.nodeType === 'document' &&
    Array.isArray(directValue.content)
  ) {
    return directValue as unknown as Document;
  }

  if (isRecord(value)) {
    for (const localizedValue of Object.values(value)) {
      const document = getRecordValue(localizedValue);

      if (
        document &&
        document.nodeType === 'document' &&
        Array.isArray(document.content)
      ) {
        return document as unknown as Document;
      }
    }
  }

  throw new Error(
    'Contentful blog post is missing a valid Rich Text document in the "content" field.'
  );
}

function getAsset(value: unknown): BlogImage | null {
  const fields = getResourceFields(value);

  if (!fields) {
    return null;
  }

  const file = getRecordValue(fields.file);

  if (!file) {
    return null;
  }

  const url = getStringValue(file.url);

  if (!url) {
    return null;
  }

  const details = getRecordValue(file.details);
  const image = details ? getRecordValue(details.image) : null;

  return {
    url: url.startsWith('http') ? url : `https:${url}`,
    width: getNumberValue(image?.width) ?? 1600,
    height: getNumberValue(image?.height) ?? 900,
    title: getStringValue(fields.title),
  };
}

function getArticleType(value: string): ArticleType {
  const allowedTypes: ArticleType[] = [
    'BlogPosting',
    'Guide',
    'HowTo',
    'NewsArticle',
  ];

  if (allowedTypes.includes(value as ArticleType)) {
    return value as ArticleType;
  }

  return 'BlogPosting';
}

function mapAuthor(value: unknown): BlogAuthor | null {
  const fields = getResourceFields(value);

  if (!fields) {
    return null;
  }

  const name = getStringValue(fields.name);
  const slug = getStringValue(fields.slug);
  const role = getStringValue(fields.role);
  const bio = getStringValue(fields.bio);

  if (!name || !slug || !role || !bio) {
    return null;
  }

  return {
    name,
    slug,
    role,
    bio,
    avatar: getAsset(fields.avatar),
    linkedinUrl: getStringValue(fields.linkedinUrl),
    githubUrl: getStringValue(fields.githubUrl),
  };
}

function mapBlogPost(entry: unknown): BlogPost {
  const entryRecord = getRecordValue(entry);
  const fields = getResourceFields(entry);
  const sys = entryRecord ? getRecordValue(entryRecord.sys) : null;

  if (!fields) {
    throw new Error('Could not read Contentful blog post fields.');
  }

  const id = getStringValue(sys?.id);

  if (!id) {
    throw new Error('Could not read the Contentful blog post ID.');
  }

  const title = getRequiredString(fields, 'title');
  const slug = getRequiredString(fields, 'slug');
  const excerpt = getRequiredString(fields, 'excerpt');
  const coverImageAlt = getRequiredString(fields, 'coverImageAlt');
  const category = getRequiredString(fields, 'category');
  const publishedAt = getRequiredString(fields, 'publishedAt');
  const articleType = getArticleType(
    getRequiredString(fields, 'articleType')
  );

  return {
    id,
    title,
    slug,
    excerpt,
    seoTitle: getStringValue(fields.seoTitle),
    seoDescription: getStringValue(fields.seoDescription),
    coverImage: getAsset(fields.coverImage),
    coverImageAlt,
    content: getDocument(fields.content),
    category,
    tags: getStringArray(fields.tags),
    publishedAt,
    lastVerifiedAt: getStringValue(fields.lastVerifiedAt),
    articleType,
    featured: getBooleanValue(fields.featured),
    author: mapAuthor(fields.author),
    faq: fields.faq ?? null,
    sources: fields.sources ?? null,
    updatedAt: getStringValue(sys?.updatedAt) ?? publishedAt,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const response = await contentfulClient.getEntries({
    content_type: BLOG_CONTENT_TYPE,
    order: ['-fields.publishedAt'],
    include: 2,
    limit: 100,
  });

  return response.items.map((entry) => mapBlogPost(entry));
}

export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  const response = await contentfulClient.getEntries({
    content_type: BLOG_CONTENT_TYPE,
    'fields.featured': true,
    order: ['-fields.publishedAt'],
    include: 2,
    limit: 10,
  });

  return response.items.map((entry) => mapBlogPost(entry));
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const response = await contentfulClient.getEntries({
    content_type: BLOG_CONTENT_TYPE,
    'fields.slug': slug,
    include: 2,
    limit: 1,
  });

  const post = response.items[0];

  return post ? mapBlogPost(post) : null;
}

export async function getBlogSlugs(): Promise<string[]> {
  const posts = await getBlogPosts();

  return posts.map((post) => post.slug);
}