import type { Room as RoomType } from "~/common/types/Room";
interface RoomProps {
  room: RoomType;
  isCurrentUser: boolean;
  onClick: () => void;
}

export function Room({ room, isCurrentUser, onClick }: RoomProps) {
  const { user } = room;

  return (
    <div
      onClick={onClick}
      className={`
        relative w-24 h-24 border-2 rounded-xl cursor-pointer shadow-sm
        transition-all duration-300 hover:scale-110 hover:shadow-lg
        ${isCurrentUser ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 ring-2 ring-blue-500 ring-offset-2" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"}
        ${!user ? "hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400" : ""}
      `}
    >
      {user ? (
        <div className="flex flex-col items-center justify-center h-full p-2">
          {user.discordAccount ? (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 mb-2 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold">D</span>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 mb-2 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold">
                {(user.nickName || user.firstName || "?")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-center truncate w-full font-semibold text-gray-700 dark:text-gray-200">
            {user.nickName ||
              `${user.firstName} ${user.lastName}`.trim() ||
              "Unknown"}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">
            空き
          </span>
        </div>
      )}
    </div>
  );
}
