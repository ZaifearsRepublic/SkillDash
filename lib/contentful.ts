import { createClient } from 'contentful';

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env.local file.`
    );
  }

  return value;
}

export const contentfulClient = createClient({
  space: requireEnvironmentVariable('CONTENTFUL_SPACE_ID'),
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
  accessToken: requireEnvironmentVariable('CONTENTFUL_DELIVERY_TOKEN'),
});