import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function checkAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin:', error);
    return false;
  }
}

// "Admin Mode" gates the most sensitive quick links on /admin (e.g. the
// Firebase Console shortcut) on top of the base admin role. Reads the
// Firestore field `isAdminMode` if present, falling back to the legacy
// `isGodMode` field so existing user documents keep working without any
// Firestore migration — a document can be updated to the new field name
// whenever convenient, but doesn't have to be.
export async function checkAdminMode(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin' && (userData.isAdminMode === true || userData.isGodMode === true);
    }
    return false;
  } catch (error) {
    console.error('Error checking admin mode:', error);
    return false;
  }
}
