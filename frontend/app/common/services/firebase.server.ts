import admin from "firebase-admin";

// Firebase Admin SDKの初期化
let app: admin.app.App;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
} else {
  app = admin.apps[0]!;
}

export const auth = admin.auth(app);

/**
 * Firebase IDトークンを検証してユーザー情報を取得
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "IDトークンの検証に失敗しました",
    };
  }
}

/**
 * Firebaseユーザー情報からセッション用のユーザーIDを生成
 */
export function createUserIdFromFirebase(firebaseUid: string): string {
  return firebaseUid;
}
