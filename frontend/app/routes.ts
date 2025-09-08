import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("home", "routes/home.tsx"),
  route("room", "routes/room.tsx"),
  route("/", "routes/_index.tsx"),
] satisfies RouteConfig;
