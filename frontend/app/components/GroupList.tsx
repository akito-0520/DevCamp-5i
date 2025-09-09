import { Link } from "react-router";
import type { Group } from "~/common/types/Group";

interface GroupListProps {
  groupList: Group[];
  onEdit?: (group: Group) => void;
  currentUserId?: string;
}

export function GroupList({
  groupList,
  onEdit,
  currentUserId,
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
          groupList.map((group: Group) => (
            <div
              key={group.id}
              className="relative p-4 mb-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-400"
            >
              <Link to={`/room?groupId=${group.id}`} className="block">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {group.name}
                </h3>
                <p className="text-gray-600">{group.introduction}</p>
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
          ))
        )}
      </div>
    </div>
  );
}
