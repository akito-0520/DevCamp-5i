import type { Route } from "./+types/logout";
import { logout } from "../common/services/auth.server";

export async function action({ request }: Route.ActionArgs) {
  return logout(request);
}

export async function loader({ request }: Route.LoaderArgs) {
  return logout(request);
}
