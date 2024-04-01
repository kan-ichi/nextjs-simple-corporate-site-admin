'use client';
import React, { createContext, useContext, useState } from 'react';

/**
 * グローバルに状態を管理するコンテキスト
 */
export const AppGlobalContext = createContext<
  [AppGlobalContextValue, React.Dispatch<React.SetStateAction<AppGlobalContextValue>>] | undefined
>(undefined);

/**
 * グローバルな状態を表すコンテキストの値
 */
export interface AppGlobalContextValue {
  /**
   * 本番環境の場合は true
   */
  isProduction: boolean;
}

/**
 * グローバルな状態を管理するためのプロバイダーコンポーネント
 * @example
 * // 使用例（layout.tsx に配置すること）
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <>
 *       <html lang="ja">
 *         <body className={notoSansJP.className}>
 *           <AppGlobalContextProvider>{children}</AppGlobalContextProvider>
 *         </body>
 *       </html>
 *     </>
 *   );
 * }
 */
export function AppGlobalContextProvider({ children }: { children: React.ReactNode }) {
  const [appGlobalContextValue, setAppGlobalContextValue] = useState<AppGlobalContextValue>({
    isProduction: false,
    // AppGlobalContextValue に項目を追加したら、ここで初期値を設定する
  });

  return (
    <AppGlobalContext.Provider value={[appGlobalContextValue, setAppGlobalContextValue]}>
      {children}
    </AppGlobalContext.Provider>
  );
}

/**
 * グローバルな状態にアクセスするためのカスタムフック
 * @example
 * // コンポーネント（～.tsx）内での使用例（ページ以外の場所では使用できないので注意）
 * const [appGlobalContextValue, setAppGlobalContextValue] = useAppGlobalContextValue();
 */
export function useAppGlobalContextValue() {
  const context = useContext(AppGlobalContext);
  if (!context) {
    throw new Error('useAppGlobalContextValue must be used within an AppGlobalContextProvider');
  }
  return context;
}
