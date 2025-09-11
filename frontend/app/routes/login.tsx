import { redirect } from "react-router";
import type { Route } from "./+types/login";
import { createUserSession, getUserId } from "../common/services/auth.server";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ログイン - 高専ハッカソンマッチング" },
    {
      name: "description",
      content: "高専生のためのハッカソンチーム編成プラットフォームへのログイン",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/home");
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "google") {
    const idToken = formData.get("idToken");

    if (typeof idToken === "string") {
      const { verifyIdToken, createUserIdFromFirebase } = await import(
        "../common/services/firebase.server"
      );
      const result = await verifyIdToken(idToken);

      if (result.success && result.user) {
        const { getUser, createUser } = await import(
          "../common/services/user.server"
        );
        const userId = createUserIdFromFirebase(result.user.uid);

        // Check if user exists
        const existingUser = await getUser(userId);

        if (!existingUser) {
          // Create new user for first-time login
          await createUser({
            userId: userId,
            firstName: "",
            lastName: "",
            nickName: "",
            userCategory: 0,
            discordAccount: "",
            schoolCategory: 0,
            schoolName: "",
            schoolYear: 0,
            schoolDepartment: "",
          });
        }

        return createUserSession(userId, "/home");
      }

      return new Response(
        JSON.stringify({
          error: result.error || "Googleログインに失敗しました",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "IDトークンが提供されていません" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // 通常のメール/パスワードログイン
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo") || "/home";

  if (typeof email !== "string" || email.length === 0) {
    return new Response(
      JSON.stringify({
        errors: { email: "メールアドレスを入力してください", password: null },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return new Response(
      JSON.stringify({
        errors: { email: null, password: "パスワードを入力してください" },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const userId = "demo-user-" + email.split("@")[0];
  return createUserSession(userId, redirectTo.toString());
}

interface LoginActionData {
  errors?: {
    email?: string | null;
    password?: string | null;
  };
  error?: string;
}

export default function LoginRoute({ actionData }: Route.ComponentProps) {
  const data = actionData as LoginActionData | undefined;
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkGoogleRedirect = async () => {
      const { checkRedirectResult } = await import(
        "../common/services/firebase-auth.client"
      );
      const result = await checkRedirectResult();

      if (result.success && result.user) {
        const form = new FormData();
        form.append("intent", "google");
        form.append("idToken", result.user.idToken);
        form.append("email", result.user.email || "");

        const response = await fetch("/login", {
          method: "POST",
          body: form,
        });

        if (response.ok) {
          window.location.href = "/home";
        }
      }
    };

    checkGoogleRedirect();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);

    const { signInWithGoogle } = await import(
      "../common/services/firebase-auth.client"
    );
    const result = await signInWithGoogle();

    if (result.success && result.user) {
      const form = new FormData();
      form.append("intent", "google");
      form.append("idToken", result.user.idToken);
      form.append("email", result.user.email || "");

      try {
        const response = await fetch("/login", {
          method: "POST",
          body: form,
        });

        if (response.ok) {
          const redirectForm = document.createElement("form");
          redirectForm.method = "GET";
          redirectForm.action = "/home";
          document.body.appendChild(redirectForm);
          redirectForm.submit();
        } else {
          await response.json();

          setIsLoadingGoogle(false);
        }
      } catch {
        setIsLoadingGoogle(false);
      }
    } else {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isSignUp ? "アカウントを作成" : "ログイン"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            高専ハッカソンマッチングプラットフォーム
          </p>
        </div>

        <form className="mt-8 space-y-6" method="post">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
              />
              {data?.errors?.email && (
                <p className="text-red-600 text-sm mt-1">{data.errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
              />
              {data?.errors?.password && (
                <p className="text-red-600 text-sm mt-1">
                  {data.errors.password}
                </p>
              )}
            </div>
          </div>

          {data?.error && (
            <div className="text-red-600 text-sm text-center">{data.error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {isSignUp ? "新規登録" : "ログイン"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              {isSignUp ? "すでにアカウントをお持ちの方" : "新規登録はこちら"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-100 dark:bg-gray-900 text-gray-500">
                または
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoadingGoogle}
              type="button"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingGoogle ? (
                <span>ログイン中...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Googleでログイン
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
