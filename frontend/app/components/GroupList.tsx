import { Link } from "react-router";
import type { Group } from "~/common/types/Group";
import type { User } from "~/common/types/User";

interface GroupListProps {
  groupList: Group[];
  onEdit?: (group: Group) => void;
  currentUserId?: string;
  makeUser?: Map<string, User>;
}

export function GroupList({
  groupList,
  onEdit,
  currentUserId,
  makeUser,
}: GroupListProps) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          参加済みのグループ一覧
        </h1>
      </div>

      <div>
        {groupList.length === 0 ? (
          <p>参加済みのグループは存在しません</p>
        ) : (
          groupList.map((group: Group) => {
            const makeUserId = makeUser?.get(group.makerUserId);
            return (
              <div
                key={group.id}
                className="relative p-6 mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-1"
              >
                <Link to={`/room?groupId=${group.id}`} className="block">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {group.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {group.introduction}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    作成者:{" "}
                    {makeUserId?.nickName || makeUserId?.firstName || "Unknown"}
                  </p>
                </Link>
                {onEdit && currentUserId === group.makerUserId && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(group);
                    }}
                    className="absolute top-4 right-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="グループを編集"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
