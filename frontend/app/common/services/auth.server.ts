import { redirect, createCookieSessionStorage } from "react-router";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

// In production, SESSION_SECRET must be set
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in production");
}

// Debug logs removed for production

const isProduction = process.env.NODE_ENV === "production";
const isSecureContext = process.env.USE_HTTPS === "true";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
      secrets: [process.env.SESSION_SECRET || "s3cr3t"],
      secure: isProduction && isSecureContext, // Only use secure in production with HTTPS
    },
  });

export async function getAuthSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const session = await getAuthSession(request);
  const userId = session.get("userId");
  console.log("[AUTH] requireUserId - session userId:", userId);

  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    console.log("[AUTH] No userId found, redirecting to login");
    throw redirect(`/login?${searchParams}`);
  }
  const cleanUserId = userId.replace(/^firebase-/, "");
  console.log("[AUTH] Returning clean userId:", cleanUserId);
  return cleanUserId;
}

export async function getUserId(request: Request) {
  const session = await getAuthSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId.replace(/^firebase-/, "");
}

export async function logout(request: Request) {
  const session = await getAuthSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await getSession();
  session.set("userId", userId);
  console.log("[AUTH] Creating session with userId:", userId);

  const cookie = await commitSession(session);
  console.log("[AUTH] Session cookie created");

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": cookie,
    },
  });
}
