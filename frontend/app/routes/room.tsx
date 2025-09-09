import type { Route } from "./+types/room";
import { useLoaderData, Link } from "react-router";
import { RoomGrid } from "../components/RoomGrid";
import { requireUserId } from "../common/services/auth.server";
import { getGroupMembersList } from "~/common/services/group.server";
import { useRoomStore } from "~/common/store/useRoomStore";
import { useEffect } from "react";
import { getUser } from "~/common/services/user.server";
import type { User } from "~/common/types/User";

interface RoomUserInfo {
  user: User;
  x: number;
  y: number;
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const groupId = url.searchParams.get("groupId");

  if (!groupId) {
    throw new Response("Group ID is required", { status: 400 });
  }

  const groupMembers = await getGroupMembersList(groupId);
  const roomUsersInfo = await Promise.all(
    groupMembers.map(async (groupMember) => {
      const user = await getUser(groupMember.userId);
      return {
        user: user,
        x: groupMember.position.x,
        y: groupMember.position.y,
      } as RoomUserInfo;
    }),
  );

  return { userId, roomUsersInfo };
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
  const { userId, roomUsersInfo } = useLoaderData<typeof loader>();
  const { moveUserToRoom, setCurrentUser, addUser } = useRoomStore();

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

  return (
    <div className="min-h-screen p-8">
      <div className="mb-4">
        <Link
          to="/home"
          className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          戻る
        </Link>
      </div>
      <RoomGrid />
    </div>
  );
}
