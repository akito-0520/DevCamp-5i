import type { Route } from "./+types/room";
import { useLoaderData, Link, useFetcher } from "react-router";
import { RoomGrid } from "../components/RoomGrid";
import { requireUserId } from "../common/services/auth.server";
import {
  getGroupMembersList,
  getGroupById,
  updateUserPosition,
} from "~/common/services/group.server";
import { useRoomStore } from "~/common/store/useRoomStore";
import { useEffect, useState } from "react";
import { getUser } from "~/common/services/user.server";
import type { User } from "~/common/types/User";
import { SaveConfirmDialog } from "~/components/SaveConfirmDialog";

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

  const [groupMembers, group] = await Promise.all([
    getGroupMembersList(groupId),
    getGroupById(groupId),
  ]);

  if (!group) {
    throw new Response("Group not found", { status: 404 });
  }

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

  return { userId, roomUsersInfo, groupMembers, group };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const groupListId = formData.get("groupListId");
  const x = formData.get("x");
  const y = formData.get("y");
  const groupId = formData.get("groupId");

  if (!x || !y || !groupId) {
    throw new Response("Missing required fields", { status: 400 });
  }

  try {
    const position = {
      x: Number(x),
      y: Number(y),
    };

    await updateUserPosition(String(groupListId), position);

    return { success: true };
  } catch (error) {
    throw new Response("Failed to update position:" + error, { status: 500 });
  }
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
  const { userId, roomUsersInfo, groupMembers, group } =
    useLoaderData<typeof loader>();
  const { moveUserToRoom, setCurrentUser, addUser, rooms } = useRoomStore();
  const fetcher = useFetcher();
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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
    // 保存完了時の処理
    if (fetcher.data?.success && showSaveDialog) {
      setShowSaveDialog(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [fetcher.data, showSaveDialog]);

  const handleSaveConfirm = () => {
    const userPosition = rooms.find((room) => {
      return room.userId === userId;
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

    fetcher.submit(
      {
        groupListId: groupList.id,
        x: userPosition.x.toString(),
        y: userPosition.y.toString(),
        groupId: groupId,
      },
      { method: "post" },
    );
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mb-4 flex justify-between items-center">
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
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            更新
          </button>
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            {isSaving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
      <RoomGrid groupName={group.name} />
      <SaveConfirmDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onConfirm={handleSaveConfirm}
        isSaving={isSaving}
      />
    </div>
  );
}
