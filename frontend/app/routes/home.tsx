import { requireUserId } from "~/common/services/auth.server";
import { GroupList } from "~/components/GroupList";
import type { Route } from "../+types/root";
import {
  createGroup,
  getParticipatedGroup,
  getAllGroups,
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
  findAvailablePosition,
} from "~/common/services/groupList.server";
import type { Group } from "~/common/types/Group";
import type { GroupMember } from "~/common/types/GroupMember";
import { getUser, getUsers, updateUser } from "~/common/services/user.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const participatedGroupIdList = await getParticipatedGroupId(userId);

  const groupList = await getParticipatedGroup(participatedGroupIdList);
  const allGroups = await getAllGroups();
  const currentUser = await getUser(userId);

  // Filter out groups that user has not joined
  const nonJoinedGroups = allGroups.filter(
    (group) => !participatedGroupIdList.includes(group.id),
  );

  // Get all unique creator user IDs
  const makeUserIds = [...new Set(allGroups.map((group) => group.makerUserId))];
  const makeUser = await getUsers(makeUserIds);

  return { groupList, nonJoinedGroups, userId, currentUser, makeUser };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "joinGroup") {
    const groupId = formData.get("groupId");
    if (!groupId) {
      throw new Response("Group ID is required", { status: 400 });
    }

    try {
      // Find available position
      const availablePosition = await findAvailablePosition(groupId as string);

      if (!availablePosition) {
        return { error: "グループは満員です（最大35名）。" };
      }

      const addGroupListProps = {
        groupId: groupId as string,
        userId: userId,
        role: 1, // Regular member role
        position: availablePosition,
      } as GroupMember;
      await addGroupList(addGroupListProps);
      return { success: true };
    } catch (error) {
      throw new Response("Failed to join group: " + error, { status: 500 });
    }
  } else if (actionType === "updateUser") {
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
  const { groupList, nonJoinedGroups, userId, currentUser, makeUser } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showEditGroupDialog, setShowEditGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      setErrorMessage(null);
      window.location.reload();
    }

    if (fetcher.data?.error) {
      setErrorMessage(fetcher.data.error);
      setTimeout(() => setErrorMessage(null), 5000);
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

  const handleJoinGroup = (groupId: string) => {
    fetcher.submit(
      {
        groupId,
        actionType: "joinGroup",
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
      {errorMessage && (
        <div className="mx-4 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}
      <div className="px-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-8">
          <GroupList
            groupList={groupList}
            onEdit={handleEditGroup}
            currentUserId={userId}
            makeUser={makeUser}
          />

          {nonJoinedGroups.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                未参加のグループ一覧
              </h2>
              <div>
                {nonJoinedGroups.map((group: Group) => {
                  const makeUserInfo = makeUser.get(group.makerUserId);
                  return (
                    <div
                      key={group.id}
                      className="relative p-4 mb-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-green-400"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {group.name}
                        </h3>
                        <p className="text-gray-600">{group.introduction}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          作成者:{" "}
                          {makeUserInfo?.nickName ||
                            makeUserInfo?.firstName ||
                            "Unknown"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={isSubmitting}
                        className="absolute top-4 right-4 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
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
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                        参加
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
