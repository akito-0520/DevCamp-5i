import { Link } from "react-router";
import type { Group } from "~/common/types/Group";

interface GroupListProps {
  groupList: Group[];
}

export function GroupList({ groupList }: GroupListProps) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          参加済みのハッカソン一覧
        </h1>
      </div>

      <div>
        {groupList.length === 0 ? (
          <p>参加済みのハッカソンは存在しません</p>
        ) : (
          groupList.map((group: Group) => (
            <Link
              to={`/room?groupId=${group.id}`}
              key={group.id}
              className="block p-4 mb-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-400"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {group.name}
              </h3>
              <p className="text-gray-600">{group.introduction}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
