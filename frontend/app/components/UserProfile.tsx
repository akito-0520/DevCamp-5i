import { useState } from "react";
import { useRoomStore } from "../store/useRoomStore";

interface UserProfileProps {
  userId: string;
  onClose: () => void;
}

export function UserProfile({ userId, onClose }: UserProfileProps) {
  const { users, currentUserId, updateUser } = useRoomStore();
  const user = users.get(userId);
  const isCurrentUser = userId === currentUserId;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    skills: user?.skills.join(", ") || "",
    school: user?.school || "",
    grade: user?.grade || 1,
    isSkillsPublic: user?.isSkillsPublic ?? true,
  });

  if (!user) return null;

  const handleSave = () => {
    updateUser(userId, {
      name: editData.name,
      email: editData.email,
      skills: editData.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      school: editData.school,
      grade: editData.grade,
      isSkillsPublic: editData.isSkillsPublic,
    });
    setIsEditing(false);
  };

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
            {user.discordAvatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                alt={user.name}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="text-xl font-semibold bg-gray-100 dark:bg-gray-800 rounded px-2 py-1"
                />
              ) : (
                <h3 className="text-xl font-semibold">{user.name}</h3>
              )}
              <a
                href={`https://discord.com/users/${user.discordId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.037c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                </svg>
                Discord
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                メール
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                学校
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.school}
                  onChange={(e) =>
                    setEditData({ ...editData, school: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">
                  {user.school || "未設定"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                学年
              </label>
              {isEditing ? (
                <select
                  value={editData.grade}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      grade: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  {[1, 2, 3, 4, 5].map((g) => (
                    <option key={g} value={g}>
                      {g}年
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 dark:text-gray-100">
                  {user.grade}年
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  スキル
                </label>
                {isEditing && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.isSkillsPublic}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          isSkillsPublic: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">公開</span>
                  </label>
                )}
              </div>
              {isEditing ? (
                <textarea
                  value={editData.skills}
                  onChange={(e) =>
                    setEditData({ ...editData, skills: e.target.value })
                  }
                  placeholder="例: React, TypeScript, Python, Docker"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded"
                  rows={3}
                />
              ) : (
                <div>
                  {user.isSkillsPublic || isCurrentUser ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      非公開
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {isCurrentUser && (
            <div className="flex justify-end gap-2 mt-6">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    保存
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  編集
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
