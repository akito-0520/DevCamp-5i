import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, createCookieSessionStorage, redirect, Link, useFetcher, useLoaderData, useNavigate } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, query, collection, where, documentId, getDocs, updateDoc, addDoc, setDoc } from "firebase/firestore";
import { create } from "zustand";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
if (process.env.NODE_ENV === "production" && false) ;
const isProduction = process.env.NODE_ENV === "production";
const isSecureContext = process.env.USE_HTTPS === "true";
const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    // 7 days
    path: "/",
    sameSite: "lax",
    secrets: ["G-VKJRT9NNEC"],
    secure: isProduction && isSecureContext
    // Only use secure in production with HTTPS
  }
});
async function getAuthSession(request) {
  return getSession(request.headers.get("Cookie"));
}
async function requireUserId(request, redirectTo = new URL(request.url).pathname) {
  const session = await getAuthSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  const cleanUserId = userId.replace(/^firebase-/, "");
  return cleanUserId;
}
async function getUserId(request) {
  const session = await getAuthSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId.replace(/^firebase-/, "");
}
async function logout(request) {
  const session = await getAuthSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  });
}
async function createUserSession(userId, redirectTo) {
  const session = await getSession();
  session.set("userId", userId);
  const cookie = await commitSession(session);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": cookie
    }
  });
}
function meta$1({}) {
  return [{
    title: "ログイン - 高専ハッカソンマッチング"
  }, {
    name: "description",
    content: "高専生のためのハッカソンチーム編成プラットフォームへのログイン"
  }];
}
async function loader$4({
  request
}) {
  const userId = await getUserId(request);
  if (userId) return redirect("/home");
  return {};
}
async function action$3({
  request
}) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "google") {
    const idToken = formData.get("idToken");
    if (typeof idToken === "string") {
      const {
        verifyIdToken,
        createUserIdFromFirebase
      } = await import("./assets/firebase.server-CuiEQo2a.js");
      const result = await verifyIdToken(idToken);
      if (result.success && result.user) {
        const {
          getUser: getUser2,
          createUser: createUser2
        } = await Promise.resolve().then(() => user_server);
        const userId = createUserIdFromFirebase(result.user.uid);
        const existingUser = await getUser2(userId);
        if (!existingUser) {
          await createUser2({
            userId,
            firstName: "",
            lastName: "",
            nickName: "",
            userCategory: 0,
            discordAccount: "",
            schoolCategory: 0,
            schoolName: "",
            schoolYear: 0,
            schoolDepartment: ""
          });
        }
        return createUserSession(userId, "/home");
      }
      return new Response(JSON.stringify({
        error: result.error || "Googleログインに失敗しました"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    return new Response(JSON.stringify({
      error: "IDトークンが提供されていません"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  return new Response(JSON.stringify({
    error: "無効なリクエストです"
  }), {
    status: 400,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
const login = UNSAFE_withComponentProps(function LoginRoute({
  actionData
}) {
  const data = actionData;
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkGoogleRedirect = async () => {
      const {
        checkRedirectResult
      } = await import("./assets/firebase-auth.client-lCjUZSnu.js");
      const result = await checkRedirectResult();
      if (result.success && result.user) {
        const form = new FormData();
        form.append("intent", "google");
        form.append("idToken", result.user.idToken);
        form.append("email", result.user.email || "");
        const response = await fetch("/login", {
          method: "POST",
          body: form
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
    const {
      signInWithGoogle
    } = await import("./assets/firebase-auth.client-lCjUZSnu.js");
    const result = await signInWithGoogle();
    if (result.success && result.user) {
      const form = new FormData();
      form.append("intent", "google");
      form.append("idToken", result.user.idToken);
      form.append("email", result.user.email || "");
      try {
        const response = await fetch("/login", {
          method: "POST",
          body: form
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
  return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-md w-full space-y-8",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h2", {
          className: "mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white",
          children: "ログイン"
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-center text-sm text-gray-600 dark:text-gray-400",
          children: "高専ハッカソンマッチングプラットフォーム"
        })]
      }), (data == null ? void 0 : data.error) && /* @__PURE__ */ jsx("div", {
        className: "text-red-600 text-sm text-center mt-4",
        children: data.error
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-8",
        children: /* @__PURE__ */ jsx("button", {
          onClick: handleGoogleLogin,
          disabled: isLoadingGoogle,
          type: "button",
          className: "w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed",
          children: isLoadingGoogle ? /* @__PURE__ */ jsx("span", {
            children: "ログイン中..."
          }) : /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsxs("svg", {
              className: "w-5 h-5 mr-2",
              viewBox: "0 0 24 24",
              children: [/* @__PURE__ */ jsx("path", {
                fill: "#4285F4",
                d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              }), /* @__PURE__ */ jsx("path", {
                fill: "#34A853",
                d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              }), /* @__PURE__ */ jsx("path", {
                fill: "#FBBC05",
                d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              }), /* @__PURE__ */ jsx("path", {
                fill: "#EA4335",
                d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              })]
            }), "Googleでログイン"]
          })
        })
      })]
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: login,
  loader: loader$4,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
async function action$2({
  request
}) {
  return logout(request);
}
async function loader$3({
  request
}) {
  return logout(request);
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
function GroupList({
  groupList,
  onEdit,
  currentUserId,
  makeUser
}) {
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center mb-6", children: /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: "参加済みのグループ一覧" }) }),
    /* @__PURE__ */ jsx("div", { children: groupList.length === 0 ? /* @__PURE__ */ jsx("p", { children: "参加済みのグループは存在しません" }) : groupList.map((group) => {
      const makeUserId = makeUser == null ? void 0 : makeUser.get(group.makerUserId);
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative p-4 mb-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-400",
          children: [
            /* @__PURE__ */ jsxs(Link, { to: `/room?groupId=${group.id}`, className: "block", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: group.name }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: group.introduction }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mt-2", children: [
                "作成者:",
                " ",
                (makeUserId == null ? void 0 : makeUserId.nickName) || (makeUserId == null ? void 0 : makeUserId.firstName) || "Unknown"
              ] })
            ] }),
            onEdit && currentUserId === group.makerUserId && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.preventDefault();
                  onEdit(group);
                },
                className: "absolute top-4 right-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200",
                title: "グループを編集",
                children: /* @__PURE__ */ jsx(
                  "svg",
                  {
                    className: "w-5 h-5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      }
                    )
                  }
                )
              }
            )
          ]
        },
        group.id
      );
    }) })
  ] });
}
const firebaseConfig = {
  apiKey: "AIzaSyAKQrBZQ8rfOHntdOnrWNzsZx4q93P3Ni4",
  authDomain: "devcamp-web-app.firebaseapp.com",
  projectId: "devcamp-web-app",
  storageBucket: "devcamp-web-app.firebasestorage.app",
  messagingSenderId: "349606418892",
  appId: "1:349606418892:web:5391de84066f89d9c5a569"
};
const app = initializeApp(firebaseConfig);
getAuth(app);
const db = getFirestore(app);
new GoogleAuthProvider();
async function getParticipatedGroup(groupIdList) {
  if (groupIdList.length === 0) return [];
  const q = query(
    collection(db, "group"),
    where(documentId(), "in", groupIdList)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc2) => {
    const data = doc2.data();
    return {
      id: doc2.id,
      name: data.group_name,
      introduction: data.group_introduction,
      makerUserId: data.maker_user_id
    };
  });
}
async function getGroupById(groupId) {
  const ref = doc(db, "group", groupId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    name: data.group_name,
    introduction: data.group_introduction,
    makerUserId: data.maker_user_id
  };
}
async function createGroup(group) {
  const q = collection(db, "group");
  const docRef = await addDoc(q, {
    group_name: group.name,
    group_introduction: group.introduction,
    maker_user_id: group.makerUserId
  });
  return docRef.id;
}
async function updateGroup(groupId, group) {
  const ref = doc(db, "group", groupId);
  const updateData = {};
  if (group.name !== void 0) {
    updateData.group_name = group.name;
  }
  if (group.introduction !== void 0) {
    updateData.group_introduction = group.introduction;
  }
  await updateDoc(ref, updateData);
}
async function getAllGroups() {
  const q = query(collection(db, "group"));
  const snap = await getDocs(q);
  return snap.docs.map((doc2) => {
    const data = doc2.data();
    return {
      id: doc2.id,
      name: data.group_name,
      introduction: data.group_introduction,
      makerUserId: data.maker_user_id
    };
  });
}
function LogoutConfirmDialog({
  isOpen,
  onClose,
  onConfirm
}) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "ログアウトの確認" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: "本当にログアウトしますか？" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200",
          children: "キャンセル"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onConfirm,
          className: "px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200",
          children: "ログアウト"
        }
      )
    ] })
  ] }) });
}
function CreateGroupDialog({
  isOpen,
  onClose,
  onConfirm,
  isCreating
}) {
  const [formData, setFormData] = useState({
    name: "",
    introduction: ""
  });
  if (!isOpen) return null;
  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("グループ名を入力してください");
      return;
    }
    if (!formData.introduction.trim()) {
      alert("グループの説明を入力してください");
      return;
    }
    onConfirm(formData);
  };
  const handleClose = () => {
    setFormData({ name: "", introduction: "" });
    onClose();
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "新しいグループを作成" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "グループ名" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.name,
            onChange: (e) => setFormData({ ...formData, name: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            placeholder: "例: 高専ハッカソン2025",
            disabled: isCreating
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "グループの説明" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: formData.introduction,
            onChange: (e) => setFormData({ ...formData, introduction: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            placeholder: "例: 2025年度の高専ハッカソンプロジェクトグループです",
            rows: 3,
            disabled: isCreating
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end mt-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleClose,
          disabled: isCreating,
          className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          children: "キャンセル"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleSubmit,
          disabled: isCreating || !formData.name.trim() || !formData.introduction.trim(),
          className: "px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          children: isCreating ? "作成中..." : "作成"
        }
      )
    ] })
  ] }) });
}
function EditGroupDialog({
  isOpen,
  onClose,
  onConfirm,
  group,
  isUpdating
}) {
  const [formData, setFormData] = useState({
    name: "",
    introduction: ""
  });
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        introduction: group.introduction
      });
    }
  }, [group]);
  if (!isOpen || !group) return null;
  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("グループ名を入力してください");
      return;
    }
    if (!formData.introduction.trim()) {
      alert("グループの説明を入力してください");
      return;
    }
    onConfirm(formData);
  };
  const handleClose = () => {
    setFormData({ name: "", introduction: "" });
    onClose();
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "グループを編集" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "グループ名" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.name,
            onChange: (e) => setFormData({ ...formData, name: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            placeholder: "例: 高専ハッカソン2025",
            disabled: isUpdating
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "グループの説明" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: formData.introduction,
            onChange: (e) => setFormData({ ...formData, introduction: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            placeholder: "例: 2025年度の高専ハッカソンプロジェクトグループです",
            rows: 3,
            disabled: isUpdating
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end mt-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleClose,
          disabled: isUpdating,
          className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          children: "キャンセル"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleSubmit,
          disabled: isUpdating || !formData.name.trim() || !formData.introduction.trim(),
          className: "px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          children: isUpdating ? "更新中..." : "更新"
        }
      )
    ] })
  ] }) });
}
function UserInfoCard({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: (user == null ? void 0 : user.firstName) || "",
    lastName: (user == null ? void 0 : user.lastName) || "",
    nickName: (user == null ? void 0 : user.nickName) || "",
    userCategory: (user == null ? void 0 : user.userCategory) || 0,
    discordAccount: (user == null ? void 0 : user.discordAccount) || "",
    schoolCategory: (user == null ? void 0 : user.schoolCategory) || 0,
    schoolName: (user == null ? void 0 : user.schoolName) || "",
    schoolYear: (user == null ? void 0 : user.schoolYear) || 1,
    schoolDepartment: (user == null ? void 0 : user.schoolDepartment) || ""
  });
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  useEffect(() => {
    var _a;
    if (fetcher.state === "idle" && ((_a = fetcher.data) == null ? void 0 : _a.success) && isEditing) {
      setIsEditing(false);
    }
  }, [fetcher.state, fetcher.data, isEditing]);
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        nickName: user.nickName || "",
        userCategory: user.userCategory || 0,
        discordAccount: user.discordAccount || "",
        schoolCategory: user.schoolCategory || 0,
        schoolName: user.schoolName || "",
        schoolYear: user.schoolYear || 1,
        schoolDepartment: user.schoolDepartment || ""
      });
    }
  }, [user]);
  if (!user) {
    return null;
  }
  const getCategoryLabel = (category) => {
    switch (category) {
      case 0:
        return "フロントエンド";
      case 1:
        return "バックエンド";
      case 2:
        return "フロントエンド・バックエンド";
      default:
        return "未設定";
    }
  };
  const getSchoolCategoryLabel = (category) => {
    switch (category) {
      case 0:
        return "高校";
      case 1:
        return "高専";
      case 2:
        return "大学";
      case 3:
        return "大学院";
      default:
        return "未設定";
    }
  };
  const handleSubmit = () => {
    if (!user) return;
    fetcher.submit(
      {
        ...formData,
        actionType: "updateUser"
      },
      { method: "post" }
    );
  };
  const handleCancel = () => {
    setFormData({
      firstName: (user == null ? void 0 : user.firstName) || "",
      lastName: (user == null ? void 0 : user.lastName) || "",
      nickName: (user == null ? void 0 : user.nickName) || "",
      userCategory: (user == null ? void 0 : user.userCategory) || 0,
      discordAccount: (user == null ? void 0 : user.discordAccount) || "",
      schoolCategory: (user == null ? void 0 : user.schoolCategory) || 0,
      schoolName: (user == null ? void 0 : user.schoolName) || "",
      schoolYear: (user == null ? void 0 : user.schoolYear) || 1,
      schoolDepartment: (user == null ? void 0 : user.schoolDepartment) || ""
    });
    setIsEditing(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-300 dark:border-gray-700", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-gray-100", children: "マイプロフィール" }),
      !isEditing && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsEditing(true),
          className: "p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors",
          children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: "w-5 h-5",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                }
              )
            }
          )
        }
      )
    ] }),
    isEditing ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "姓" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formData.lastName || "",
              onChange: (e) => setFormData({ ...formData, lastName: e.target.value }),
              className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "名" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formData.firstName || "",
              onChange: (e) => setFormData({ ...formData, firstName: e.target.value }),
              className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "ニックネーム" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.nickName || "",
            onChange: (e) => setFormData({ ...formData, nickName: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "スキル" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: formData.userCategory || 0,
            onChange: (e) => setFormData({
              ...formData,
              userCategory: Number(e.target.value)
            }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700",
            children: [
              /* @__PURE__ */ jsx("option", { value: 0, children: "フロントエンド" }),
              /* @__PURE__ */ jsx("option", { value: 1, children: "バックエンド" }),
              /* @__PURE__ */ jsx("option", { value: 2, children: "フロントエンド・バックエンド" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Discord アカウント" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.discordAccount || "",
            onChange: (e) => setFormData({ ...formData, discordAccount: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "学校区分" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: formData.schoolCategory || 0,
            onChange: (e) => setFormData({
              ...formData,
              schoolCategory: Number(e.target.value)
            }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700",
            children: [
              /* @__PURE__ */ jsx("option", { value: 0, children: "高校" }),
              /* @__PURE__ */ jsx("option", { value: 1, children: "高専" }),
              /* @__PURE__ */ jsx("option", { value: 2, children: "大学" }),
              /* @__PURE__ */ jsx("option", { value: 3, children: "大学院" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "学校名" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.schoolName || "",
            onChange: (e) => setFormData({ ...formData, schoolName: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "学年" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "1",
            max: "10",
            value: formData.schoolYear || 1,
            onChange: (e) => setFormData({ ...formData, schoolYear: Number(e.target.value) }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "学科" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.schoolDepartment || "",
            onChange: (e) => setFormData({ ...formData, schoolDepartment: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end pt-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleCancel,
            disabled: isSubmitting,
            className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50",
            children: "キャンセル"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSubmit,
            disabled: isSubmitting,
            className: "px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50",
            children: isSubmitting ? "保存中..." : "保存"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold", children: user.nickName ? user.nickName.charAt(0) : user.firstName.charAt(0) }),
        /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: user.nickName || `${user.firstName} ${user.lastName}` }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
            user.firstName,
            " ",
            user.lastName
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "スキル:" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: getCategoryLabel(user.userCategory) })
        ] }),
        user.discordAccount && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Discord:" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: user.discordAccount })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "学校区分:" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: getSchoolCategoryLabel(user.schoolCategory) })
        ] }),
        user.schoolName && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "学校名:" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: user.schoolName })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "学年:" }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: [
            user.schoolYear,
            "年"
          ] })
        ] }),
        user.schoolDepartment && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "学科:" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: user.schoolDepartment })
        ] })
      ] })
    ] })
  ] });
}
function UserRegistrationModal({
  user,
  isOpen
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nickName: "",
    userCategory: 0,
    discordAccount: "",
    schoolCategory: 0,
    schoolName: "",
    schoolYear: 1,
    schoolDepartment: ""
  });
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const [errors, setErrors] = useState([]);
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        nickName: user.nickName || "",
        userCategory: user.userCategory || 0,
        discordAccount: user.discordAccount || "",
        schoolCategory: user.schoolCategory || 0,
        schoolName: user.schoolName || "",
        schoolYear: user.schoolYear || 1,
        schoolDepartment: user.schoolDepartment || ""
      });
    }
  }, [user]);
  const validateForm = () => {
    var _a, _b, _c, _d, _e;
    const newErrors = [];
    if (!((_a = formData.firstName) == null ? void 0 : _a.trim())) newErrors.push("名前（名）は必須です");
    if (!((_b = formData.lastName) == null ? void 0 : _b.trim())) newErrors.push("名前（姓）は必須です");
    if (!((_c = formData.nickName) == null ? void 0 : _c.trim())) newErrors.push("ニックネームは必須です");
    if (!((_d = formData.schoolName) == null ? void 0 : _d.trim())) newErrors.push("学校名は必須です");
    if (!((_e = formData.schoolDepartment) == null ? void 0 : _e.trim())) newErrors.push("学科は必須です");
    setErrors(newErrors);
    return newErrors.length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;
    fetcher.submit(
      {
        ...formData,
        actionType: "updateUser"
      },
      { method: "post" }
    );
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "プロフィール登録" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-600 dark:text-gray-400", children: [
        "サービスを利用するために、以下の情報を登録してください。",
        /* @__PURE__ */ jsx("span", { className: "text-red-500 font-semibold", children: "*" }),
        " ",
        "は必須項目です。"
      ] })
    ] }),
    errors.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: /* @__PURE__ */ jsx("ul", { className: "list-disc list-inside text-red-600 dark:text-red-400 text-sm", children: errors.map((error, index) => /* @__PURE__ */ jsx("li", { children: error }, index)) }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: [
            "姓 ",
            /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formData.lastName || "",
              onChange: (e) => setFormData({ ...formData, lastName: e.target.value }),
              className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
              placeholder: "山田"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: [
            "名 ",
            /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formData.firstName || "",
              onChange: (e) => setFormData({ ...formData, firstName: e.target.value }),
              className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
              placeholder: "太郎"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: [
          "ニックネーム ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.nickName || "",
            onChange: (e) => setFormData({ ...formData, nickName: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            placeholder: "たろう"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "スキル" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: formData.userCategory || 0,
            onChange: (e) => setFormData({
              ...formData,
              userCategory: Number(e.target.value)
            }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: 0, children: "フロントエンド" }),
              /* @__PURE__ */ jsx("option", { value: 1, children: "バックエンド" }),
              /* @__PURE__ */ jsx("option", { value: 2, children: "フロントエンド・バックエンド" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Discord アカウント" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.discordAccount || "",
            onChange: (e) => setFormData({ ...formData, discordAccount: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            placeholder: "username#1234"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "学校区分" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: formData.schoolCategory || 0,
            onChange: (e) => setFormData({
              ...formData,
              schoolCategory: Number(e.target.value)
            }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: 0, children: "高校" }),
              /* @__PURE__ */ jsx("option", { value: 1, children: "高専" }),
              /* @__PURE__ */ jsx("option", { value: 2, children: "大学" }),
              /* @__PURE__ */ jsx("option", { value: 3, children: "大学院" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: [
          "学校名 ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.schoolName || "",
            onChange: (e) => setFormData({ ...formData, schoolName: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            placeholder: "○○高専"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "学年" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "1",
            max: "6",
            value: formData.schoolYear || 1,
            onChange: (e) => setFormData({ ...formData, schoolYear: Number(e.target.value) }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: [
          "学科 ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.schoolDepartment || "",
            onChange: (e) => setFormData({ ...formData, schoolDepartment: e.target.value }),
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            placeholder: "情報工学科"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-8", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleSubmit,
        disabled: isSubmitting,
        className: "px-6 py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium",
        children: isSubmitting ? "登録中..." : "登録する"
      }
    ) })
  ] }) });
}
async function getParticipatedGroupId(userId) {
  const q = query(collection(db, "group_list"), where("user_id", "==", userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return [];
  }
  const data = snapshot.docs.map((doc2) => doc2.data().group_id);
  return data;
}
async function getGroupMembersList(groupId) {
  const q = query(
    collection(db, "group_list"),
    where("group_id", "==", groupId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc2) => {
    const data = doc2.data();
    return {
      id: doc2.id,
      groupId: data.group_id,
      position: data.position,
      role: data.role,
      userId: data.user_id
    };
  });
}
async function updateUserPosition(groupListId, position, groupId, userId) {
  const q = query(
    collection(db, "group_list"),
    where("group_id", "==", groupId),
    where("position.x", "==", position.x),
    where("position.y", "==", position.y)
  );
  const snap = await getDocs(q);
  const isOccupied = snap.docs.some((doc2) => {
    const data = doc2.data();
    return data.user_id !== userId;
  });
  if (isOccupied) {
    throw new Error("Position is already occupied by another user");
  }
  const docRef = doc(db, "group_list", groupListId);
  await updateDoc(docRef, {
    position
  });
}
async function findAvailablePosition(groupId) {
  const GRID_SIZE2 = 6;
  const MAX_MEMBERS = GRID_SIZE2 * GRID_SIZE2 - 1;
  const members = await getGroupMembersList(groupId);
  if (members.length >= MAX_MEMBERS) {
    return null;
  }
  const occupiedPositions = new Set(
    members.map((member) => `${member.position.x},${member.position.y}`)
  );
  for (let y = 0; y < GRID_SIZE2; y++) {
    for (let x = 0; x < GRID_SIZE2; x++) {
      if (!occupiedPositions.has(`${x},${y}`)) {
        return { x, y };
      }
    }
  }
  return null;
}
async function addGroupList(groupList) {
  const q = collection(db, "group_list");
  await addDoc(q, {
    group_id: groupList.groupId,
    user_id: groupList.userId,
    role: groupList.role,
    position: groupList.position
  });
}
async function getUser(userId) {
  const ref = doc(db, "user", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    userId: snap.id,
    firstName: data.first_name,
    lastName: data.last_name,
    nickName: data.nick_name,
    userCategory: data.user_category,
    discordAccount: data.discord_account,
    schoolCategory: data.school_category,
    schoolName: data.school_name,
    schoolYear: data.school_year,
    schoolDepartment: data.school_department
  };
}
async function createUser(user) {
  const docRef = doc(db, "user", user.userId);
  await setDoc(docRef, {
    first_name: user.firstName,
    last_name: user.lastName,
    nick_name: user.nickName,
    user_category: user.userCategory,
    discord_account: user.discordAccount,
    school_category: user.schoolCategory,
    school_name: user.schoolName,
    school_year: user.schoolYear,
    school_department: user.schoolDepartment
  });
  return user.userId;
}
async function updateUser(userId, updates) {
  const docRef = doc(db, "user", userId);
  const updateData = {};
  if (updates.firstName !== void 0)
    updateData.first_name = updates.firstName;
  if (updates.lastName !== void 0) updateData.last_name = updates.lastName;
  if (updates.nickName !== void 0) updateData.nick_name = updates.nickName;
  if (updates.userCategory !== void 0)
    updateData.user_category = updates.userCategory;
  if (updates.discordAccount !== void 0)
    updateData.discord_account = updates.discordAccount;
  if (updates.schoolCategory !== void 0)
    updateData.school_category = updates.schoolCategory;
  if (updates.schoolName !== void 0)
    updateData.school_name = updates.schoolName;
  if (updates.schoolYear !== void 0)
    updateData.school_year = updates.schoolYear;
  if (updates.schoolDepartment !== void 0)
    updateData.school_department = updates.schoolDepartment;
  await updateDoc(docRef, updateData);
}
async function getUsers(userIds) {
  if (userIds.length === 0) return /* @__PURE__ */ new Map();
  const users = /* @__PURE__ */ new Map();
  const batches = [];
  for (let i = 0; i < userIds.length; i += 10) {
    batches.push(userIds.slice(i, i + 10));
  }
  for (const batch of batches) {
    const q = query(collection(db, "user"), where(documentId(), "in", batch));
    const snap = await getDocs(q);
    snap.docs.forEach((doc2) => {
      const data = doc2.data();
      users.set(doc2.id, {
        userId: doc2.id,
        firstName: data.first_name,
        lastName: data.last_name,
        nickName: data.nick_name,
        userCategory: data.user_category,
        discordAccount: data.discord_account,
        schoolCategory: data.school_category,
        schoolName: data.school_name,
        schoolYear: data.school_year,
        schoolDepartment: data.school_department
      });
    });
  }
  return users;
}
const user_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createUser,
  getUser,
  getUsers,
  updateUser
}, Symbol.toStringTag, { value: "Module" }));
async function loader$2({
  request
}) {
  const userId = await requireUserId(request);
  const participatedGroupIdList = await getParticipatedGroupId(userId);
  const groupList = await getParticipatedGroup(participatedGroupIdList);
  const allGroups = await getAllGroups();
  const currentUser = await getUser(userId);
  const nonJoinedGroups = allGroups.filter((group) => !participatedGroupIdList.includes(group.id));
  const makeUserIds = [...new Set(allGroups.map((group) => group.makerUserId))];
  const makeUser = await getUsers(makeUserIds);
  return {
    groupList,
    nonJoinedGroups,
    userId,
    currentUser,
    makeUser
  };
}
async function action$1({
  request
}) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  if (actionType === "joinGroup") {
    const groupId = formData.get("groupId");
    if (!groupId) {
      throw new Response("Group ID is required", {
        status: 400
      });
    }
    try {
      const availablePosition = await findAvailablePosition(groupId);
      if (!availablePosition) {
        return {
          error: "グループは満員です（最大35名）。"
        };
      }
      const addGroupListProps = {
        groupId,
        userId,
        role: 1,
        // Regular member role
        position: availablePosition
      };
      await addGroupList(addGroupListProps);
      return {
        success: true
      };
    } catch (error) {
      throw new Response("Failed to join group: " + error, {
        status: 500
      });
    }
  } else if (actionType === "updateUser") {
    const updates = {};
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const nickName = formData.get("nickName");
    const userCategory = formData.get("userCategory");
    const discordAccount = formData.get("discordAccount");
    const schoolCategory = formData.get("schoolCategory");
    const schoolName = formData.get("schoolName");
    const schoolYear = formData.get("schoolYear");
    const schoolDepartment = formData.get("schoolDepartment");
    if (firstName !== null) updates.firstName = firstName;
    if (lastName !== null) updates.lastName = lastName;
    if (nickName !== null) updates.nickName = nickName;
    if (userCategory !== null) updates.userCategory = Number(userCategory);
    if (discordAccount !== null) updates.discordAccount = discordAccount;
    if (schoolCategory !== null) updates.schoolCategory = Number(schoolCategory);
    if (schoolName !== null) updates.schoolName = schoolName;
    if (schoolYear !== null) updates.schoolYear = Number(schoolYear);
    if (schoolDepartment !== null) updates.schoolDepartment = schoolDepartment;
    try {
      await updateUser(userId, updates);
      return {
        success: true
      };
    } catch (error) {
      throw new Response("Failed to update user: " + error, {
        status: 500
      });
    }
  } else if (actionType === "update") {
    const groupId = formData.get("groupId");
    const name = formData.get("name");
    const introduction = formData.get("introduction");
    if (!groupId || !name || !introduction) {
      throw new Response("Group ID, name and introduction are required", {
        status: 400
      });
    }
    try {
      await updateGroup(groupId, {
        name,
        introduction
      });
      return {
        success: true
      };
    } catch (error) {
      throw new Response("Failed to update group: " + error, {
        status: 500
      });
    }
  } else {
    const name = formData.get("name");
    const introduction = formData.get("introduction");
    if (!name || !introduction) {
      throw new Response("Group name and introduction are required", {
        status: 400
      });
    }
    try {
      const groupDataProps = {
        name,
        introduction,
        makerUserId: userId
      };
      const groupId = await createGroup(groupDataProps);
      const addGroupListProps = {
        groupId,
        userId,
        role: 0,
        position: {
          x: 0,
          y: 0
        }
      };
      await addGroupList(addGroupListProps);
      return {
        success: true
      };
    } catch (error) {
      throw new Response("Failed to create group: " + error, {
        status: 500
      });
    }
  }
}
const home = UNSAFE_withComponentProps(function Home() {
  var _a, _b, _c, _d, _e;
  const {
    groupList,
    nonJoinedGroups,
    userId,
    currentUser,
    makeUser
  } = useLoaderData();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showEditGroupDialog, setShowEditGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const isUserInfoIncomplete = !currentUser || !((_a = currentUser.firstName) == null ? void 0 : _a.trim()) || !((_b = currentUser.lastName) == null ? void 0 : _b.trim()) || !((_c = currentUser.nickName) == null ? void 0 : _c.trim()) || !((_d = currentUser.schoolName) == null ? void 0 : _d.trim()) || !((_e = currentUser.schoolDepartment) == null ? void 0 : _e.trim());
  useEffect(() => {
    var _a2, _b2;
    if ((_a2 = fetcher.data) == null ? void 0 : _a2.success) {
      setShowCreateGroupDialog(false);
      setShowEditGroupDialog(false);
      setEditingGroup(null);
      setErrorMessage(null);
      window.location.reload();
    }
    if ((_b2 = fetcher.data) == null ? void 0 : _b2.error) {
      setErrorMessage(fetcher.data.error);
      setTimeout(() => setErrorMessage(null), 5e3);
    }
  }, [fetcher.data]);
  const handleLogoutConfirm = () => {
    navigate("/logout");
  };
  const handleCreateGroup = (groupData) => {
    fetcher.submit({
      name: groupData.name,
      introduction: groupData.introduction,
      actionType: "create"
    }, {
      method: "post"
    });
  };
  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setShowEditGroupDialog(true);
  };
  const handleUpdateGroup = (groupData) => {
    if (!editingGroup) return;
    fetcher.submit({
      groupId: editingGroup.id,
      name: groupData.name,
      introduction: groupData.introduction,
      actionType: "update"
    }, {
      method: "post"
    });
  };
  const handleJoinGroup = (groupId) => {
    fetcher.submit({
      groupId,
      actionType: "joinGroup"
    }, {
      method: "post"
    });
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex justify-between p-4",
      children: [/* @__PURE__ */ jsxs("button", {
        onClick: () => setShowCreateGroupDialog(true),
        className: "px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2",
        children: [/* @__PURE__ */ jsx("svg", {
          className: "w-5 h-5",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 4v16m8-8H4"
          })
        }), "新規グループ作成"]
      }), /* @__PURE__ */ jsxs("button", {
        onClick: () => setShowLogoutDialog(true),
        className: "px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2",
        children: [/* @__PURE__ */ jsx("svg", {
          className: "w-5 h-5",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          })
        }), "ログアウト"]
      })]
    }), errorMessage && /* @__PURE__ */ jsx("div", {
      className: "mx-4 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg",
      children: errorMessage
    }), /* @__PURE__ */ jsxs("div", {
      className: "px-4 grid grid-cols-1 lg:grid-cols-3 gap-4",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "lg:col-span-2 space-y-8",
        children: [/* @__PURE__ */ jsx(GroupList, {
          groupList,
          onEdit: handleEditGroup,
          currentUserId: userId,
          makeUser
        }), nonJoinedGroups.length > 0 && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6",
            children: "未参加のグループ一覧"
          }), /* @__PURE__ */ jsx("div", {
            children: nonJoinedGroups.map((group) => {
              const makeUserInfo = makeUser.get(group.makerUserId);
              return /* @__PURE__ */ jsxs("div", {
                className: "relative p-4 mb-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-green-400",
                children: [/* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("h3", {
                    className: "text-lg font-semibold text-gray-900 mb-2",
                    children: group.name
                  }), /* @__PURE__ */ jsx("p", {
                    className: "text-gray-600",
                    children: group.introduction
                  }), /* @__PURE__ */ jsxs("p", {
                    className: "text-sm text-gray-500 mt-2",
                    children: ["作成者:", " ", (makeUserInfo == null ? void 0 : makeUserInfo.nickName) || (makeUserInfo == null ? void 0 : makeUserInfo.firstName) || "Unknown"]
                  })]
                }), /* @__PURE__ */ jsxs("button", {
                  onClick: () => handleJoinGroup(group.id),
                  disabled: isSubmitting,
                  className: "absolute top-4 right-4 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center gap-2",
                  children: [/* @__PURE__ */ jsx("svg", {
                    className: "w-5 h-5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsx("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    })
                  }), "参加"]
                })]
              }, group.id);
            })
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "lg:col-span-1",
        children: /* @__PURE__ */ jsx(UserInfoCard, {
          user: currentUser
        })
      })]
    }), /* @__PURE__ */ jsx(LogoutConfirmDialog, {
      isOpen: showLogoutDialog,
      onClose: () => setShowLogoutDialog(false),
      onConfirm: handleLogoutConfirm
    }), /* @__PURE__ */ jsx(CreateGroupDialog, {
      isOpen: showCreateGroupDialog,
      onClose: () => setShowCreateGroupDialog(false),
      onConfirm: handleCreateGroup,
      isCreating: isSubmitting
    }), /* @__PURE__ */ jsx(EditGroupDialog, {
      isOpen: showEditGroupDialog,
      onClose: () => {
        setShowEditGroupDialog(false);
        setEditingGroup(null);
      },
      onConfirm: handleUpdateGroup,
      group: editingGroup,
      isUpdating: isSubmitting
    }), /* @__PURE__ */ jsx(UserRegistrationModal, {
      user: currentUser,
      isOpen: isUserInfoIncomplete
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: home,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
function Room({ room: room2, isCurrentUser, onClick }) {
  const { user } = room2;
  return /* @__PURE__ */ jsx(
    "div",
    {
      onClick,
      className: `
        relative w-20 h-20 border-2 rounded-lg cursor-pointer
        transition-all duration-200 hover:scale-105
        ${isCurrentUser ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"}
        ${!user ? "hover:bg-gray-50 dark:hover:bg-gray-800" : ""}
      `,
      children: user ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full p-2", children: [
        user.discordAccount ? /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-purple-500 mb-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white text-xs font-semibold", children: "D" }) }) : /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-600 mb-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white text-xs font-semibold", children: (user.nickName || user.firstName || "?").charAt(0).toUpperCase() }) }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-center truncate w-full font-medium", children: user.nickName || `${user.firstName} ${user.lastName}`.trim() || "Unknown" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx("span", { className: "text-gray-400 dark:text-gray-600 text-xs", children: "空き" }) })
    }
  );
}
const useRoomStore = create((set) => ({
  rooms: [],
  users: /* @__PURE__ */ new Map(),
  hackathons: /* @__PURE__ */ new Map(),
  currentUserId: null,
  initializeRooms: (gridSize) => {
    const rooms = [];
    let id = 0;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        rooms.push({ id: id++, x, y });
      }
    }
    set({ rooms });
  },
  moveUserToRoom: (userId, x, y) => {
    set((state) => {
      const targetRoom = state.rooms.find(
        (room2) => room2.x === x && room2.y === y
      );
      if ((targetRoom == null ? void 0 : targetRoom.userId) && targetRoom.userId !== userId) {
        return state;
      }
      const rooms = state.rooms.map((room2) => {
        if (room2.userId === userId) {
          return { ...room2, userId: void 0, user: void 0 };
        }
        if (room2.x === x && room2.y === y) {
          const user = state.users.get(userId);
          return { ...room2, userId, user };
        }
        return room2;
      });
      return { rooms };
    });
  },
  updateUser: (userId, userData) => {
    set((state) => {
      const users = new Map(state.users);
      const currentUser = users.get(userId);
      if (currentUser) {
        users.set(userId, { ...currentUser, ...userData });
      }
      return { users };
    });
  },
  setCurrentUser: (userId) => {
    set({ currentUserId: userId });
  },
  addUser: (user) => {
    set((state) => {
      const users = new Map(state.users);
      users.set(user.userId, user);
      return { users };
    });
  }
}));
function UserProfile({ userId, onClose }) {
  const { users } = useRoomStore();
  const user = users.get(userId);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  if (!user) return null;
  const handleDiscordClick = async (e) => {
    e.preventDefault();
    if (user.discordAccount) {
      try {
        await navigator.clipboard.writeText(user.discordAccount);
        setCopiedDiscord(true);
        setTimeout(() => {
          setCopiedDiscord(false);
          window.open(
            `https://discord.com/users/${user.discordAccount}`,
            "_blank"
          );
        }, 500);
      } catch {
      }
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "ユーザープロフィール" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
          children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: "w-6 h-6",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M6 18L18 6M6 6l12 12"
                }
              )
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        user.discordAccount ? /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white text-2xl font-semibold", children: "D" }) }) : /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white text-2xl font-semibold", children: (user.nickName || user.firstName || "?").charAt(0).toUpperCase() }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold", children: user.nickName || `${user.firstName} ${user.lastName}`.trim() || "Unknown" }),
          user.nickName && (user.firstName || user.lastName) && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: `${user.firstName} ${user.lastName}`.trim() }),
          user.discordAccount && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleDiscordClick,
              className: "text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1 cursor-pointer transition-colors",
              title: "クリックしてDiscord IDをコピー",
              children: [
                /* @__PURE__ */ jsx(
                  "svg",
                  {
                    className: "w-5 h-5",
                    viewBox: "0 0 24 24",
                    fill: "currentColor",
                    children: /* @__PURE__ */ jsx("path", { d: "M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.037c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" })
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  "Discord: ",
                  user.discordAccount,
                  copiedDiscord && /* @__PURE__ */ jsx("span", { className: "text-green-500 text-xs ml-1", children: "コピーしました！" })
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "学校" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-900 dark:text-gray-100", children: user.schoolName || "未設定" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "学年" }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-900 dark:text-gray-100", children: [
            user.schoolYear,
            "年"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "学科" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-900 dark:text-gray-100", children: user.schoolDepartment || "未設定" })
        ] })
      ] })
    ] })
  ] }) });
}
function HackathonPanel({
  onClose,
  currentUser,
  groupId
}) {
  const fetcher = useFetcher();
  const [hackathonData, setHackathonData] = useState({
    name: "",
    groupId,
    ownerId: currentUser.userId,
    startDate: /* @__PURE__ */ new Date(),
    finishDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
    isDeadline: false,
    teamSize: 3
  });
  const [showRecruitmentInfo, setShowRecruitmentInfo] = useState(true);
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);
  const isSubmitting = fetcher.state === "submitting";
  useEffect(() => {
    var _a;
    if (fetcher.state === "idle" && ((_a = fetcher.data) == null ? void 0 : _a.success)) {
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose]);
  const handleCreateRecruitment = () => {
    if (!hackathonData.name) return;
    const finalData = { ...hackathonData };
    if (!useAdvancedMode) {
      finalData.teamSizeLower = void 0;
      finalData.teamSizeUpper = void 0;
    } else {
      finalData.teamSize = void 0;
    }
    const formData = new FormData();
    formData.append("actionType", "createHackathon");
    formData.append("hackathonData", JSON.stringify(finalData));
    fetcher.submit(formData, { method: "post" });
  };
  const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };
  const getTodayString = () => {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "ハッカソンメンバーを募集" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
          children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: "w-6 h-6",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M6 18L18 6M6 6l12 12"
                }
              )
            }
          )
        }
      )
    ] }),
    showRecruitmentInfo && /* @__PURE__ */ jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2", children: "募集者情報" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-blue-800 dark:text-blue-200 space-y-1", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "名前:" }),
            " ",
            currentUser.nickName || `${currentUser.firstName} ${currentUser.lastName}`
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "学校:" }),
            " ",
            currentUser.schoolName
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "学年:" }),
            " ",
            currentUser.schoolYear,
            "年"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "学科:" }),
            " ",
            currentUser.schoolDepartment
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Discord:" }),
            " ",
            currentUser.discordAccount
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowRecruitmentInfo(false),
          className: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200",
          children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: "w-5 h-5",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M6 18L18 6M6 6l12 12"
                }
              )
            }
          )
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "ハッカソン名 *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: hackathonData.name,
            onChange: (e) => setHackathonData({ ...hackathonData, name: e.target.value }),
            placeholder: "例: 高専プロコン2025",
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "開始日" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: formatDate(hackathonData.startDate),
              min: getTodayString(),
              onChange: (e) => setHackathonData({
                ...hackathonData,
                startDate: new Date(e.target.value)
              }),
              className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "終了日" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: formatDate(hackathonData.finishDate),
              min: formatDate(hackathonData.startDate) || getTodayString(),
              onChange: (e) => setHackathonData({
                ...hackathonData,
                finishDate: new Date(e.target.value)
              }),
              className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "ハッカソンURL（任意）" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "url",
            value: hackathonData.URL,
            onChange: (e) => setHackathonData({ ...hackathonData, URL: e.target.value }),
            placeholder: "https://example.com/hackathon",
            className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t pt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "チーム構成" }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: useAdvancedMode,
                onChange: (e) => {
                  setUseAdvancedMode(e.target.checked);
                  if (e.target.checked) {
                    if (hackathonData.teamSize) {
                      setHackathonData({
                        ...hackathonData,
                        teamSizeLower: Math.max(
                          1,
                          hackathonData.teamSize - 1
                        ),
                        teamSizeUpper: hackathonData.teamSize + 2
                      });
                    }
                  }
                },
                className: "rounded text-purple-600"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "最小・最大を個別に設定" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "チーム人数" }),
            useAdvancedMode ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-600 dark:text-gray-400", children: "最小人数" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "1",
                    value: hackathonData.teamSizeLower,
                    onChange: (e) => setHackathonData({
                      ...hackathonData,
                      teamSizeLower: parseInt(e.target.value)
                    }),
                    className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-600 dark:text-gray-400", children: "最大人数" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "1",
                    value: hackathonData.teamSizeUpper,
                    onChange: (e) => setHackathonData({
                      ...hackathonData,
                      teamSizeUpper: parseInt(e.target.value)
                    }),
                    className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "最小・最大を指定" })
            ] }) : /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "1",
                  value: hackathonData.teamSize,
                  onChange: (e) => setHackathonData({
                    ...hackathonData,
                    teamSize: parseInt(e.target.value)
                  }),
                  placeholder: "推奨人数",
                  className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "人数を指定" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "必要な開発者数（任意）" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-600 dark:text-gray-400", children: "フロントエンド開発者" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "0",
                    value: hackathonData.frontendNumber || "",
                    onChange: (e) => setHackathonData({
                      ...hackathonData,
                      frontendNumber: e.target.value ? parseInt(e.target.value) : void 0
                    }),
                    className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-600 dark:text-gray-400", children: "バックエンド開発者" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "0",
                    value: hackathonData.backendNumber || "",
                    onChange: (e) => setHackathonData({
                      ...hackathonData,
                      backendNumber: e.target.value ? parseInt(e.target.value) : void 0
                    }),
                    className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                  }
                )
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-green-900 dark:text-green-100 mb-2", children: "募集概要" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-green-800 dark:text-green-200 space-y-1", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "• 期間: ",
            formatDate(hackathonData.startDate),
            " 〜",
            " ",
            formatDate(hackathonData.finishDate)
          ] }),
          useAdvancedMode ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("p", { children: [
            "• チーム人数: ",
            hackathonData.teamSizeLower,
            "〜",
            hackathonData.teamSizeUpper,
            "人"
          ] }) }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("p", { children: [
            "• チーム人数: ",
            hackathonData.teamSize,
            "人"
          ] }) }),
          (hackathonData.frontendNumber || hackathonData.backendNumber) && /* @__PURE__ */ jsxs("p", { children: [
            "• 必要スキル: フロントエンド",
            hackathonData.frontendNumber,
            "人、バックエンド",
            hackathonData.backendNumber,
            "人"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            className: "px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded",
            children: "キャンセル"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleCreateRecruitment,
            disabled: !hackathonData.name || isSubmitting,
            className: "px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed",
            children: isSubmitting ? "作成中..." : "募集を開始"
          }
        )
      ] })
    ] })
  ] }) });
}
function DeadlineConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  hackathonName,
  isProcessing = false
}) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "募集を締切りますか？" }),
    /* @__PURE__ */ jsxs("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: [
      "「",
      hackathonName,
      "」の募集を締切ります。",
      /* @__PURE__ */ jsx("br", {}),
      "締切後は新しい参加者が招待を承認できなくなります。"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          disabled: isProcessing,
          className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          children: "キャンセル"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onConfirm,
          disabled: isProcessing,
          className: "px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          children: isProcessing ? "処理中..." : "締切る"
        }
      )
    ] })
  ] }) });
}
function HackathonList({
  hackathons,
  onSelect,
  currentUserId,
  userHackathonLists = []
}) {
  const fetcher = useFetcher();
  const [showDeadlineDialog, setShowDeadlineDialog] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(
    null
  );
  const getInvitation = (hackathonId) => {
    return userHackathonLists.find(
      (invitation) => invitation.hackathonId === hackathonId
    );
  };
  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString("ja-JP");
  };
  const getStatusBadge = (hackathon) => {
    const now = /* @__PURE__ */ new Date();
    const startDate = new Date(hackathon.startDate);
    const finishDate = new Date(hackathon.finishDate);
    if (now > finishDate) {
      return /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded", children: "終了" });
    } else if (now < startDate) {
      if (hackathon.isDeadline) {
        return /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded", children: "開催待ち" });
      } else {
        return /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded", children: "募集中" });
      }
    } else if (now >= startDate && now <= finishDate) {
      return /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs bg-green-100 text-green-700 rounded", children: "開催中" });
    } else {
      return /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded", children: "終了" });
    }
  };
  if (hackathons.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-4 shadow", children: /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 text-sm", children: "ハッカソンはありません" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg shadow", children: [
    /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "ハッカソン" }) }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto", children: hackathons.map((hackathon) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer",
        onClick: () => onSelect == null ? void 0 : onSelect(hackathon),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-900 dark:text-gray-100", children: hackathon.name }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: getStatusBadge(hackathon) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400 space-y-1", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              "期間: ",
              formatDate(hackathon.startDate),
              " 〜",
              " ",
              formatDate(hackathon.finishDate)
            ] }),
            hackathon.teamSize && /* @__PURE__ */ jsxs("p", { children: [
              "チーム人数: ",
              hackathon.teamSize,
              "人"
            ] }),
            hackathon.teamSizeLower && hackathon.teamSizeUpper && /* @__PURE__ */ jsxs("p", { children: [
              "チーム人数: ",
              hackathon.teamSizeLower,
              "〜",
              hackathon.teamSizeUpper,
              "人"
            ] }),
            (hackathon.frontendNumber || hackathon.backendNumber) && /* @__PURE__ */ jsxs("p", { children: [
              "必要スキル:",
              hackathon.frontendNumber && ` フロントエンド${hackathon.frontendNumber}人`,
              hackathon.backendNumber && ` バックエンド${hackathon.backendNumber}人`
            ] }),
            currentUserId === hackathon.ownerId && /* @__PURE__ */ new Date() < new Date(hackathon.startDate) && !hackathon.isDeadline && /* @__PURE__ */ jsx("div", { className: "mt-2", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setSelectedHackathon(hackathon);
                  setShowDeadlineDialog(true);
                },
                className: "px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors",
                children: "締切"
              }
            ) }),
            (() => {
              const invitation = getInvitation(hackathon.hackathonId);
              const isBeforeStart = /* @__PURE__ */ new Date() < new Date(hackathon.startDate);
              const isNotOwner = currentUserId !== hackathon.ownerId;
              return invitation && !invitation.isInviteAccept && isBeforeStart && isNotOwner ? /* @__PURE__ */ jsx("div", { className: "mt-2", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    const formData = new FormData();
                    formData.append("actionType", "acceptInvitation");
                    formData.append("invitationId", invitation.id);
                    fetcher.submit(formData, { method: "post" });
                  },
                  disabled: fetcher.state === "submitting",
                  className: "px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50",
                  children: fetcher.state === "submitting" ? "受け入れ中..." : "受け入れる"
                }
              ) }) : null;
            })()
          ] })
        ]
      },
      hackathon.hackathonId
    )) }),
    /* @__PURE__ */ jsx(
      DeadlineConfirmDialog,
      {
        isOpen: showDeadlineDialog,
        onClose: () => {
          setShowDeadlineDialog(false);
          setSelectedHackathon(null);
        },
        onConfirm: () => {
          if (selectedHackathon) {
            const formData = new FormData();
            formData.append("actionType", "updateDeadline");
            formData.append("hackathonId", selectedHackathon.hackathonId);
            fetcher.submit(formData, { method: "post" });
            setShowDeadlineDialog(false);
            setSelectedHackathon(null);
          }
        },
        hackathonName: (selectedHackathon == null ? void 0 : selectedHackathon.name) || "",
        isProcessing: fetcher.state === "submitting"
      }
    )
  ] });
}
const GRID_SIZE = 6;
function RoomGrid({
  groupName,
  groupId,
  hackathons = [],
  userHackathonLists = []
}) {
  const { rooms, currentUserId, initializeRooms, moveUserToRoom, users } = useRoomStore();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showHackathonPanel, setShowHackathonPanel] = useState(false);
  useEffect(() => {
    initializeRooms(GRID_SIZE);
  }, []);
  const handleRoomClick = (roomId) => {
    const room2 = rooms.find((r) => r.id === roomId);
    if (room2 == null ? void 0 : room2.user) {
      if (room2.user.userId === currentUserId) {
        setSelectedUserId(currentUserId);
      } else {
        setSelectedUserId(room2.user.userId);
      }
    } else if (currentUserId && room2) {
      moveUserToRoom(currentUserId, room2.x, room2.y);
    }
  };
  const roomGrid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const room2 = rooms.find((r) => r.x === x && r.y === y);
      if (room2) {
        row.push(
          /* @__PURE__ */ jsx(
            Room,
            {
              room: room2,
              isCurrentUser: room2.userId === currentUserId,
              onClick: () => handleRoomClick(room2.id)
            },
            room2.id
          )
        );
      }
    }
    roomGrid.push(
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: row }, y)
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx("div", { children: groupName && /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: groupName }) }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowHackathonPanel(true),
          className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors",
          children: "ハッカソンメンバーを募集"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-blue-500 rounded" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "あなた" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 ml-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-gray-400 rounded" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "他のユーザー" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 ml-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-gray-300 rounded" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "空き部屋" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-block p-8 bg-gray-50 dark:bg-gray-800 rounded-xl", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: roomGrid }) }),
      /* @__PURE__ */ jsx("div", { className: "w-96", children: /* @__PURE__ */ jsx(
        HackathonList,
        {
          hackathons,
          currentUserId: currentUserId ?? void 0,
          userHackathonLists
        }
      ) })
    ] }),
    selectedUserId && /* @__PURE__ */ jsx(
      UserProfile,
      {
        userId: selectedUserId,
        onClose: () => setSelectedUserId(null)
      }
    ),
    showHackathonPanel && currentUserId && users.get(currentUserId) && /* @__PURE__ */ jsx(
      HackathonPanel,
      {
        onClose: () => setShowHackathonPanel(false),
        currentUser: users.get(currentUserId),
        groupId
      }
    )
  ] });
}
function SaveConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isSaving
}) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "位置情報の保存" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: "現在のルーム配置を保存しますか？" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          disabled: isSaving,
          className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          children: "キャンセル"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onConfirm,
          disabled: isSaving,
          className: "px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          children: isSaving ? "保存中..." : "保存"
        }
      )
    ] })
  ] }) });
}
async function createHackathon(hackathon) {
  const q = collection(db, "hackathon");
  const docData = {
    name: hackathon.name,
    group_id: hackathon.groupId,
    owner: hackathon.ownerId,
    start_date: hackathon.startDate.toISOString(),
    finish_date: hackathon.finishDate.toISOString(),
    is_deadline: hackathon.isDeadline,
    url: hackathon.URL ?? "",
    ...hackathon.numberOfTeams !== void 0 && {
      number_of_teams: hackathon.numberOfTeams
    },
    ...hackathon.numberOfTeamsUpper !== void 0 && {
      number_of_teams_upper: hackathon.numberOfTeamsUpper
    },
    ...hackathon.numberOfTeamsLower !== void 0 && {
      number_of_teams_lower: hackathon.numberOfTeamsLower
    },
    ...hackathon.teamSize !== void 0 && { team_size: hackathon.teamSize },
    ...hackathon.teamSizeUpper !== void 0 && {
      team_size_upper: hackathon.teamSizeUpper
    },
    ...hackathon.teamSizeLower !== void 0 && {
      team_size_lower: hackathon.teamSizeLower
    },
    ...hackathon.backendNumber !== void 0 && {
      backend_number: hackathon.backendNumber
    },
    ...hackathon.frontendNumber !== void 0 && {
      frontend_number: hackathon.frontendNumber
    }
  };
  await addDoc(q, docData);
}
async function getHackathons(groupId) {
  const q = query(
    collection(db, "hackathon"),
    where("group_id", "==", groupId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc2) => {
    const data = doc2.data();
    return {
      hackathonId: doc2.id,
      name: data.name,
      groupId: data.group_id,
      ownerId: data.owner,
      startDate: new Date(data.start_date),
      finishDate: new Date(data.finish_date),
      isDeadline: data.is_deadline,
      url: data.url ?? "",
      numberOfTeams: data.number_of_teams,
      numberOfTeamsUpper: data.number_of_teams_upper,
      numberOfTeamsLower: data.number_of_teams_lower,
      teamSize: data.team_size,
      teamSizeUpper: data.team_size_upper,
      teamSizeLower: data.team_size_lower,
      backendNumber: data.backend_number,
      frontendNumber: data.frontend_number
    };
  });
}
async function updateHackathonDeadline(hackathonId, isDeadline) {
  const hackathonRef = doc(db, "hackathon", hackathonId);
  await updateDoc(hackathonRef, {
    is_deadline: isDeadline
  });
}
async function getUserHackathonLists(userId) {
  const q = query(
    collection(db, "hackathon_list"),
    where("user_id", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc2) => {
    const data = doc2.data();
    return {
      id: doc2.id,
      // ドキュメントIDを追加
      hackathonId: data.hackathon_id,
      userId: data.user_id,
      isInviteAccept: data.is_invite_accept,
      isJoin: data.is_join,
      teamNumber: data.team_number,
      limitDay: data.limit_day ? new Date(data.limit_day) : void 0
    };
  });
}
async function acceptHackathonInvitation(invitationId) {
  const invitationRef = doc(db, "hackathon_list", invitationId);
  await updateDoc(invitationRef, {
    is_invite_accept: true
  });
}
async function loader$1({
  request
}) {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const groupId = url.searchParams.get("groupId");
  if (!groupId) {
    throw new Response("Group ID is required", {
      status: 400
    });
  }
  const [groupMembers, group] = await Promise.all([getGroupMembersList(groupId), getGroupById(groupId)]);
  if (!group) {
    throw new Response("Group not found", {
      status: 404
    });
  }
  const roomUsersInfo = await Promise.all(groupMembers.map(async (groupMember) => {
    const user = await getUser(groupMember.userId);
    return {
      user,
      x: groupMember.position.x,
      y: groupMember.position.y
    };
  }));
  const userHackathonLists = await getUserHackathonLists(userId);
  const groupHackathons = await getHackathons(groupId);
  const thisGroupHackathonLists = groupHackathons.filter((groupHackathon) => {
    return userHackathonLists.some((invitation) => invitation.hackathonId === groupHackathon.hackathonId);
  });
  return {
    userId,
    roomUsersInfo,
    groupMembers,
    group,
    thisGroupHackathonLists,
    userHackathonLists
    // Pass the invitation data
  };
}
async function action({
  request
}) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  if (actionType === "acceptInvitation") {
    const invitationId = formData.get("invitationId");
    if (!invitationId) {
      throw new Response("Missing invitation ID", {
        status: 400
      });
    }
    try {
      await acceptHackathonInvitation(invitationId);
      return {
        success: true
      };
    } catch (error) {
      throw new Response(`Failed to accept invitation: ${error instanceof Error ? error.message : String(error)}`, {
        status: 500
      });
    }
  } else if (actionType === "updateDeadline") {
    const hackathonId = formData.get("hackathonId");
    if (!hackathonId) {
      throw new Response("Missing hackathon ID", {
        status: 400
      });
    }
    try {
      await updateHackathonDeadline(hackathonId, true);
      return {
        success: true
      };
    } catch (error) {
      throw new Response(`Failed to update deadline: ${error instanceof Error ? error.message : String(error)}`, {
        status: 500
      });
    }
  } else if (actionType === "createHackathon") {
    const hackathonDataString = formData.get("hackathonData");
    if (!hackathonDataString) {
      throw new Response("Missing hackathon data", {
        status: 400
      });
    }
    try {
      const hackathonData = JSON.parse(hackathonDataString);
      if (hackathonData.startDate) {
        hackathonData.startDate = new Date(hackathonData.startDate);
      }
      if (hackathonData.finishDate) {
        hackathonData.finishDate = new Date(hackathonData.finishDate);
      }
      await createHackathon(hackathonData);
      return {
        success: true
      };
    } catch (error) {
      throw new Response(`Failed to create hackathon: ${error instanceof Error ? error.message : String(error)}`, {
        status: 500
      });
    }
  } else if (actionType === "saveConfirm") {
    const saveDataString = formData.get("saveData");
    if (!saveDataString) {
      throw new Response("Missing hackathon data", {
        status: 400
      });
    }
    try {
      const saveData = JSON.parse(saveDataString);
      const groupListId = saveData.groupListId;
      const x = saveData.x;
      const y = saveData.y;
      const groupId = saveData.groupId;
      if (!x || !y || !groupId) {
        throw new Response("Missing required fields", {
          status: 400
        });
      }
      const userId = await requireUserId(request);
      const position = {
        x: Number(x),
        y: Number(y)
      };
      await updateUserPosition(String(groupListId), position, String(groupId), userId);
      return {
        success: true
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("occupied")) {
        return {
          error: "Position is already occupied by another user"
        };
      }
      throw new Response("Failed to update position:" + error, {
        status: 500
      });
    }
  }
}
function meta({}) {
  return [{
    title: "高専ハッカソンマッチング"
  }, {
    name: "description",
    content: "高専生のためのハッカソンチーム編成プラットフォーム"
  }];
}
const room = UNSAFE_withComponentProps(function Group() {
  const {
    userId,
    roomUsersInfo,
    groupMembers,
    group,
    thisGroupHackathonLists,
    userHackathonLists
  } = useLoaderData();
  const {
    moveUserToRoom,
    setCurrentUser,
    addUser,
    rooms
  } = useRoomStore();
  const fetcher = useFetcher();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const isSaving = fetcher.state === "submitting";
  useEffect(() => {
    setCurrentUser(userId);
    roomUsersInfo.forEach((roomUserInfo) => {
      if (roomUserInfo.user) {
        const user = roomUserInfo.user;
        const x = roomUserInfo.x;
        const y = roomUserInfo.y;
        addUser(user);
        moveUserToRoom(user.userId, x, y);
      }
    });
  }, [userId, setCurrentUser, addUser]);
  const handleRefresh = () => {
    window.location.reload();
  };
  const handleSaveClick = () => {
    setShowSaveDialog(true);
  };
  useEffect(() => {
    var _a, _b;
    if (((_a = fetcher.data) == null ? void 0 : _a.success) && showSaveDialog) {
      setShowSaveDialog(false);
      setErrorMessage(null);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    if ((_b = fetcher.data) == null ? void 0 : _b.error) {
      if (fetcher.data.error.includes("occupied")) {
        setErrorMessage("その位置は既に他のユーザーが使用しています。別の位置を選択してください。");
        setShowSaveDialog(false);
        setTimeout(() => {
          window.location.reload();
        }, 2e3);
      } else {
        setErrorMessage("保存中にエラーが発生しました。");
        setShowSaveDialog(false);
      }
    }
  }, [fetcher.data, showSaveDialog]);
  const handleSaveConfirm = () => {
    const userPosition = rooms.find((room2) => {
      return room2.userId === userId;
    });
    const groupList = groupMembers.find((groupMember) => {
      return groupMember.userId === userId;
    });
    if (!userPosition) {
      alert("ユーザーの位置が見つかりません");
      setShowSaveDialog(false);
      return;
    }
    if (!groupList) {
      alert("ユーザーの位置情報が見つかりません");
      setShowSaveDialog(false);
      return;
    }
    const groupId = new URL(window.location.href).searchParams.get("groupId");
    if (!groupId) {
      alert("グループIDが見つかりません");
      setShowSaveDialog(false);
      return;
    }
    const formData = new FormData();
    formData.append("actionType", "saveConfirm");
    formData.append("saveData", JSON.stringify({
      groupListId: groupList.id,
      x: userPosition.x.toString(),
      y: userPosition.y.toString(),
      groupId
    }));
    fetcher.submit(formData, {
      method: "post"
    });
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen p-8",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-4 flex justify-between items-center",
      children: [/* @__PURE__ */ jsxs(Link, {
        to: "/home",
        className: "inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200",
        children: [/* @__PURE__ */ jsx("svg", {
          className: "w-5 h-5 mr-2",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M10 19l-7-7m0 0l7-7m-7 7h18"
          })
        }), "戻る"]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex gap-2",
        children: [/* @__PURE__ */ jsxs("button", {
          onClick: handleRefresh,
          className: "inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          children: [/* @__PURE__ */ jsx("svg", {
            className: "w-5 h-5 mr-2",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            })
          }), "更新"]
        }), /* @__PURE__ */ jsxs("button", {
          onClick: handleSaveClick,
          disabled: isSaving,
          className: "inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          children: [/* @__PURE__ */ jsx("svg", {
            className: "w-5 h-5 mr-2",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            })
          }), isSaving ? "保存中..." : "保存"]
        })]
      })]
    }), errorMessage && /* @__PURE__ */ jsx("div", {
      className: "mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg",
      children: errorMessage
    }), /* @__PURE__ */ jsx(RoomGrid, {
      groupName: group.name,
      hackathons: thisGroupHackathonLists,
      groupId: group.id,
      userHackathonLists
    }), /* @__PURE__ */ jsx(SaveConfirmDialog, {
      isOpen: showSaveDialog,
      onClose: () => setShowSaveDialog(false),
      onConfirm: handleSaveConfirm,
      isSaving
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: room,
  loader: loader$1,
  meta
}, Symbol.toStringTag, { value: "Module" }));
async function loader({}) {
  return redirect("/login");
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-D8i__mlZ.js", "imports": ["/assets/chunk-PVWAREVJ-BZsiqsWm.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-DT4b58DJ.js", "imports": ["/assets/chunk-PVWAREVJ-BZsiqsWm.js"], "css": ["/assets/root-CLD3Afe0.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/login-OYchCyIS.js", "imports": ["/assets/chunk-PVWAREVJ-BZsiqsWm.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/logout": { "id": "routes/logout", "parentId": "root", "path": "logout", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/logout-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": "home", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-DSQeVHBp.js", "imports": ["/assets/chunk-PVWAREVJ-BZsiqsWm.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/room": { "id": "routes/room", "parentId": "root", "path": "room", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/room-Hv9CPOnI.js", "imports": ["/assets/chunk-PVWAREVJ-BZsiqsWm.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": "/", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/_index-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-eee6c878.js", "version": "eee6c878", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: "home",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/room": {
    id: "routes/room",
    parentId: "root",
    path: "room",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: "/",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
