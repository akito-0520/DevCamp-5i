import type { Route } from "./+types/home";
import { RoomGrid } from "../components/RoomGrid";
import { requireUserId } from "../common/services/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  return { userId };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "高専ハッカソンマッチング" },
    {
      name: "description",
      content: "高専生のためのハッカソンチーム編成プラットフォーム",
    },
  ];
}

export default function Group() {
  return (
    <div className="min-h-screen p-8">
      <RoomGrid />
    </div>
  );
}
