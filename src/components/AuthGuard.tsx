import { useAuthContext } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

type Props = {
  children: ReactNode;
};

/**
 * ユーザーが認証済みの場合は受け取った children を描画し、未認証の場合はログイン画面にリダイレクトします
 */
export const AuthGuard = ({ children }: Props) => {
  const router = useRouter();
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser === null) {
      console.log(AuthGuard.name, 'authUser is null');
      router.push('/login');
    }
  }, [router, authUser]);

  if (authUser === undefined) {
    console.log(AuthGuard.name, 'authUser is undefined');
    return <div>読み込み中...</div>;
  }

  if (authUser === null) {
    return null;
  }

  return children;
};
