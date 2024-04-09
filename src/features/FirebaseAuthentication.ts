import { User, getAuth, signInAnonymously, signOut } from 'firebase/auth';
/**
 * Firebase Authentication 関連の機能
 */
export module FirebaseAuthentication {
  /**
   * Firebase Authentication に匿名ログインします
   */
  export const loginAsAnonymousUser = async (): Promise<User | null> => {
    const auth = getAuth();
    await signInAnonymously(auth)
      .then(async () => {
        console.log(loginAsAnonymousUser.name, 'User logged in:', auth.currentUser?.uid);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(loginAsAnonymousUser.name, 'Error logging in:', errorCode, errorMessage);
      });
    return auth?.currentUser;
  };

  /**
   * Firebase Authentication からログアウトして、ユーザーを削除します
   */
  export const logoutAndDeleteCurrentUser = async (): Promise<string | undefined> => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      await signOut(auth)
        .then(() => {
          console.log(logoutAndDeleteCurrentUser.name, 'User logged out:', user.uid);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(logoutAndDeleteCurrentUser.name, 'Error logging out:', errorCode, errorMessage);
        });
      await deleteUser(user);
    }
    return user?.uid;
  };

  /**
   * Firebase Authentication からユーザーを削除します
   */
  export const deleteUser = async (user: User | null = null): Promise<string | undefined> => {
    let uid: string | undefined = undefined;
    if (!user) {
      user = getAuth().currentUser;
    }
    if (user) {
      uid = user.uid;
      await user
        .delete()
        .then(() => {
          console.log(deleteUser.name, 'User deleted:', uid);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(deleteUser.name, 'Error deleting user:', errorCode, errorMessage);
        });
    }
    return uid;
  };
}
