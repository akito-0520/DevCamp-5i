import { redirect } from "react-router";
import type { Route } from "./+types/_index";

export async function loader({}: Route.LoaderArgs) {
  return redirect("/login");
}
