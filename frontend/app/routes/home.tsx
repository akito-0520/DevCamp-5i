import { requireUserId } from "~/common/services/auth.server";
import { GroupList } from "~/components/GroupList";
import type { Route } from "../+types/root";
import {
  createGroup,
  getParticipatedGroup,
} from "~/common/services/group.server";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import { LogoutConfirmDialog } from "~/components/LogoutConfirmDialog";
import { CreateGroupDialog } from "~/components/CreateGroupDialog";
import { useState, useEffect } from "react";
import {
  addGroupList,
  getParticipatedGroupId,
} from "~/common/services/groupList.server";
import type { Group } from "~/common/types/Group";
import type { GroupMember } from "~/common/types/GroupMember";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const participatedGroupIdList = await getParticipatedGroupId(userId);

  const groupList = await getParticipatedGroup(participatedGroupIdList);
  return { groupList };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const name = formData.get("name");
  const introduction = formData.get("introduction");

  if (!name || !introduction) {
    throw new Response("Group name and introduction are required", {
      status: 400,
    });
  }

  try {
    const groupDataProps = {
      name: name as string,
      introduction: introduction as string,
      makerUserId: userId,
    } as Group;

    const groupId = await createGroup(groupDataProps);

    const addGroupListProps = {
      groupId: groupId,
      userId: userId,
      role: 0,
      position: {
        x: 0,
        y: 0,
      },
    } as GroupMember;
    await addGroupList(addGroupListProps);

    return { success: true };
  } catch (error) {
    throw new Response("Failed to create group: " + error, { status: 500 });
  }
}

export default function Home() {
  const groupList = useLoaderData<typeof loader>().groupList;
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const fetcher = useFetcher();

  const isCreatingGroup = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?.success) {
      setShowCreateGroupDialog(false);
      window.location.reload();
    }
  }, [fetcher.data]);

  const handleLogoutConfirm = () => {
    navigate("/logout");
  };

  const handleCreateGroup = (groupData: {
    name: string;
    introduction: string;
  }) => {
    fetcher.submit(
      {
        name: groupData.name,
        introduction: groupData.introduction,
      },
      { method: "post" },
    );
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-between p-4">
        <button
          onClick={() => setShowCreateGroupDialog(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規グループ作成
        </button>
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          ログアウト
        </button>
      </div>
      <div className="px-4">
        <GroupList groupList={groupList} />
      </div>
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
      />
      <CreateGroupDialog
        isOpen={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
        onConfirm={handleCreateGroup}
        isCreating={isCreatingGroup}
      />
    </div>
  );
}
