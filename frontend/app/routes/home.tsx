import { requireUserId } from "~/common/services/auth.server";
import { GroupList } from "~/components/GroupList";
import type { Route } from "../+types/root";
import {
  getParticipatedGroup,
  getParticipatedGroupId,
} from "~/common/services/group.server";
import { useLoaderData, useNavigate } from "react-router";
import { LogoutConfirmDialog } from "~/components/LogoutConfirmDialog";
import { useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const participatedGroupIdList = await getParticipatedGroupId(userId);

  const groupList = await getParticipatedGroup(participatedGroupIdList);
  return { groupList };
}

export default function Home() {
  const groupList = useLoaderData<typeof loader>().groupList;
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutConfirm = () => {
    navigate("/logout");
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-end p-4">
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
    </div>
  );
}
