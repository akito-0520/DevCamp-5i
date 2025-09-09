import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebaseConfig";

export async function signInWithGoogle() {
  try {
    // まずポップアップを試す
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // IDトークンを取得
    const idToken = await user.getIdToken();

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        idToken,
      },
    };
  } catch (error: any) {
    // Google sign in error: error

    // ポップアップがブロックされた場合はリダイレクトを試す
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { success: false, redirect: true };
      } catch (redirectError: any) {
        return {
          success: false,
          error: redirectError.message || "Googleログインに失敗しました",
        };
      }
    }

    return {
      success: false,
      error: error.message || "Googleログインに失敗しました",
    };
  }
}

export async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const idToken = await result.user.getIdToken();
      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          idToken,
        },
      };
    }
    return { success: false };
  } catch (error: any) {
    // Redirect result error: error
    return {
      success: false,
      error: error.message || "リダイレクト結果の取得に失敗しました",
    };
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    // Sign out error: error
    return {
      success: false,
      error: error.message || "ログアウトに失敗しました",
    };
  }
}
