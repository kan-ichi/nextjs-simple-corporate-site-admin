'use client';
import { initializeFirebaseApp } from '@/common/lib/firebase';
import { AuthProvider } from '@/components/AuthProvider';

initializeFirebaseApp();
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
