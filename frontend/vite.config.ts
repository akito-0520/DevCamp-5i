import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: { allowedHosts: ["2182b4c4897b.ngrok-free.app"] },
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    define: {
      "process.env.SESSION_SECRET": JSON.stringify(env.SESSION_SECRET),
      "process.env.FIREBASE_API_KEY": JSON.stringify(env.FIREBASE_API_KEY),
      "process.env.FIREBASE_AUTH_DOMAIN": JSON.stringify(
        env.FIREBASE_AUTH_DOMAIN
      ),
      "process.env.FIREBASE_PROJECT_ID": JSON.stringify(
        env.FIREBASE_PROJECT_ID
      ),
      "process.env.FIREBASE_STORAGE_BUCKET": JSON.stringify(
        env.FIREBASE_STORAGE_BUCKET
      ),
      "process.env.FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
        env.FIREBASE_MESSAGING_SENDER_ID
      ),
      "process.env.FIREBASE_APP_ID": JSON.stringify(env.FIREBASE_APP_ID),
      "process.env.FIREBASE_CLIENT_EMAIL": JSON.stringify(
        env.FIREBASE_CLIENT_EMAIL
      ),
      "process.env.FIREBASE_PRIVATE_KEY": JSON.stringify(
        env.FIREBASE_PRIVATE_KEY
      ),
    },
  };
});
