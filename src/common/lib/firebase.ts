import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_REALTIME_DATABASE_URL, // Realtime Database 使用時のみ必要
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from '@/_DoNotCommit/env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_REALTIME_DATABASE_URL, // Realtime Database 使用時のみ必要
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

export const initializeFirebaseApp = () => (!getApps().length ? initializeApp(firebaseConfig) : getApp());
