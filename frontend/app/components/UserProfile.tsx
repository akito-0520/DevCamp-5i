import { useRoomStore } from "../common/store/useRoomStore";

interface UserProfileProps {
  userId: string;
  onClose: () => void;
}

export function UserProfile({ userId, onClose }: UserProfileProps) {
  const { users } = useRoomStore();
  const user = users.get(userId);

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ユーザープロフィール
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {user.discordAccount ? (
              <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">D</span>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">
                  {(user.nickName || user.firstName || "?")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">
                {user.nickName ||
                  `${user.firstName} ${user.lastName}`.trim() ||
                  "Unknown"}
              </h3>
              {user.nickName && (user.firstName || user.lastName) && (
                <p className="text-sm text-gray-500">
                  {`${user.firstName} ${user.lastName}`.trim()}
                </p>
              )}
              {user.discordAccount && (
                <a
                  className="text-blue-500 flex items-center gap-1 mt-1"
                  href={"https://discord.com/users/" + user.discordAccount}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.037c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                  </svg>
                  Discord: {user.discordAccount}
                </a>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discordアカウント
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {user.discordAccount || "未設定"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                学校
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {user.schoolName || "未設定"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                学年
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {user.schoolYear}年
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                学科
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {user.schoolDepartment || "未設定"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
