// lib/firebaseAdmin.ts
// Single source of truth for Firebase Admin SDK initialization. Server-only
// routes that need the Admin SDK (getFirestore()/getAuth() from
// 'firebase-admin/*') but don't need any specific export from here just do
// `import '@/lib/firebaseAdmin';` for the side effect of calling
// initializeApp() once per server process.

import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
  universe_domain: 'googleapis.com',
};

if (
  !serviceAccount.project_id ||
  !serviceAccount.private_key_id ||
  !serviceAccount.private_key ||
  !serviceAccount.client_email ||
  !serviceAccount.client_id ||
  !serviceAccount.client_x509_cert_url
) {
  throw new Error(
    'Missing required Firebase Admin SDK configuration. Check environment variables: FIREBASE_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_ADMIN_CLIENT_ID, FIREBASE_ADMIN_CLIENT_CERT_URL'
  );
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
    projectId: serviceAccount.project_id,
  });
}
