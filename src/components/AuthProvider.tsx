import type { User } from '@firebase/auth';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

/**
 * 認証状態（undefined：初期値、null：未認証、User：認証済ユーザー）
 */
export type GlobalAuthState = {
  authUser: User | null | undefined;
};
const initialState: GlobalAuthState = {
  authUser: undefined,
};
const AuthContext = createContext<GlobalAuthState>(initialState);

type Props = { children: ReactNode };

/**
 * 認証状態をグローバルに管理するコンテキスト
 */
export const AuthProvider = ({ children }: Props) => {
  const [authUserState, setAuthUserState] = useState<GlobalAuthState>(initialState);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log(AuthProvider.name, onAuthStateChanged.name, 'User:', user?.uid);
        if (user) {
          setAuthUserState({ authUser: user });
        } else {
          setAuthUserState({ authUser: null });
        }
      },
      (error) => {
        console.error(AuthProvider.name, onAuthStateChanged.name, 'error:', error);
        setAuthUserState({ authUser: null });
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={authUserState}>{children}</AuthContext.Provider>;
};

/**
 * ユーザー認証情報を取得します
 */
export const useAuthContext = () => useContext(AuthContext);
