'use client';
import { initializeFirebaseApp } from '@/common/lib/firebase';

initializeFirebaseApp();
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
