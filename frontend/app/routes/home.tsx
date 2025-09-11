import { requireUserId } from "~/common/services/auth.server";
import { GroupList } from "~/components/GroupList";
import type { Route } from "../+types/root";
import {
  createGroup,
  getParticipatedGroup,
  updateGroup,
} from "~/common/services/group.server";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import { LogoutConfirmDialog } from "~/components/LogoutConfirmDialog";
import { CreateGroupDialog } from "~/components/CreateGroupDialog";
import { EditGroupDialog } from "~/components/EditGroupDialog";
import { UserInfoCard } from "~/components/UserInfoCard";
import { UserRegistrationModal } from "~/components/UserRegistrationModal";
import { useState, useEffect } from "react";
import {
  addGroupList,
  getParticipatedGroupId,
} from "~/common/services/groupList.server";
import type { Group } from "~/common/types/Group";
import type { GroupMember } from "~/common/types/GroupMember";
import { getUser, updateUser } from "~/common/services/user.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const participatedGroupIdList = await getParticipatedGroupId(userId);

  const groupList = await getParticipatedGroup(participatedGroupIdList);
  const currentUser = await getUser(userId);
  return { groupList, userId, currentUser };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "updateUser") {
    const updates: any = {};

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
    if (schoolCategory !== null)
      updates.schoolCategory = Number(schoolCategory);
    if (schoolName !== null) updates.schoolName = schoolName;
    if (schoolYear !== null) updates.schoolYear = Number(schoolYear);
    if (schoolDepartment !== null) updates.schoolDepartment = schoolDepartment;

    try {
      await updateUser(userId, updates);
      return { success: true };
    } catch (error) {
      throw new Response("Failed to update user: " + error, { status: 500 });
    }
  } else if (actionType === "update") {
    const groupId = formData.get("groupId");
    const name = formData.get("name");
    const introduction = formData.get("introduction");

    if (!groupId || !name || !introduction) {
      throw new Response("Group ID, name and introduction are required", {
        status: 400,
      });
    }

    try {
      await updateGroup(groupId as string, {
        name: name as string,
        introduction: introduction as string,
      });

      return { success: true };
    } catch (error) {
      throw new Response("Failed to update group: " + error, { status: 500 });
    }
  } else {
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
}

export default function Home() {
  const { groupList, userId, currentUser } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showEditGroupDialog, setShowEditGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const fetcher = useFetcher();

  const isSubmitting = fetcher.state === "submitting";

  // Check if user info is incomplete
  const isUserInfoIncomplete =
    !currentUser ||
    !currentUser.firstName?.trim() ||
    !currentUser.lastName?.trim() ||
    !currentUser.nickName?.trim() ||
    !currentUser.schoolName?.trim() ||
    !currentUser.schoolDepartment?.trim();

  useEffect(() => {
    if (fetcher.data?.success) {
      setShowCreateGroupDialog(false);
      setShowEditGroupDialog(false);
      setEditingGroup(null);
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
        actionType: "create",
      },
      { method: "post" },
    );
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowEditGroupDialog(true);
  };

  const handleUpdateGroup = (groupData: {
    name: string;
    introduction: string;
  }) => {
    if (!editingGroup) return;

    fetcher.submit(
      {
        groupId: editingGroup.id,
        name: groupData.name,
        introduction: groupData.introduction,
        actionType: "update",
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
      <div className="px-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GroupList
            groupList={groupList}
            onEdit={handleEditGroup}
            currentUserId={userId}
          />
        </div>
        <div className="lg:col-span-1">
          <UserInfoCard user={currentUser} />
        </div>
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
        isCreating={isSubmitting}
      />
      <EditGroupDialog
        isOpen={showEditGroupDialog}
        onClose={() => {
          setShowEditGroupDialog(false);
          setEditingGroup(null);
        }}
        onConfirm={handleUpdateGroup}
        group={editingGroup}
        isUpdating={isSubmitting}
      />
      <UserRegistrationModal user={currentUser} isOpen={isUserInfoIncomplete} />
    </div>
  );
}
