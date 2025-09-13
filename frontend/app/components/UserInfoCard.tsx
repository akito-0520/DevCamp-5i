import { useState, useEffect } from "react";
import type { User } from "~/common/types/User";
import { useFetcher } from "react-router";

interface UserInfoCardProps {
  user: User | null;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    nickName: user?.nickName || "",
    userCategory: user?.userCategory || 0,
    discordAccount: user?.discordAccount || "",
    schoolCategory: user?.schoolCategory || 0,
    schoolName: user?.schoolName || "",
    schoolYear: user?.schoolYear || 1,
    schoolDepartment: user?.schoolDepartment || "",
  });
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && isEditing) {
      setIsEditing(false);
    }
  }, [fetcher.state, fetcher.data, isEditing]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        nickName: user.nickName || "",
        userCategory: user.userCategory || 0,
        discordAccount: user.discordAccount || "",
        schoolCategory: user.schoolCategory || 0,
        schoolName: user.schoolName || "",
        schoolYear: user.schoolYear || 1,
        schoolDepartment: user.schoolDepartment || "",
      });
    }
  }, [user]);
  if (!user) {
    return null;
  }

  const getCategoryLabel = (category: number) => {
    switch (category) {
      case 0:
        return "フロントエンド";
      case 1:
        return "バックエンド";
      case 2:
        return "フロントエンド・バックエンド";
      default:
        return "未設定";
    }
  };

  const getSchoolCategoryLabel = (category: number) => {
    switch (category) {
      case 0:
        return "高校";
      case 1:
        return "高専";
      case 2:
        return "大学";
      case 3:
        return "大学院";
      default:
        return "未設定";
    }
  };

  const handleSubmit = () => {
    if (!user) return;

    fetcher.submit(
      {
        ...formData,
        actionType: "updateUser",
      },
      { method: "post" },
    );
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      nickName: user?.nickName || "",
      userCategory: user?.userCategory || 0,
      discordAccount: user?.discordAccount || "",
      schoolCategory: user?.schoolCategory || 0,
      schoolName: user?.schoolName || "",
      schoolYear: user?.schoolYear || 1,
      schoolDepartment: user?.schoolDepartment || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          マイプロフィール
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
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

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                姓
              </label>
              <input
                type="text"
                value={formData.lastName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                名
              </label>
              <input
                type="text"
                value={formData.firstName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ニックネーム
            </label>
            <input
              type="text"
              value={formData.nickName || ""}
              onChange={(e) =>
                setFormData({ ...formData, nickName: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              スキル
            </label>
            <select
              value={formData.userCategory || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  userCategory: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
            >
              <option value={0}>フロントエンド</option>
              <option value={1}>バックエンド</option>
              <option value={2}>フロントエンド・バックエンド</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discord アカウント
            </label>
            <input
              type="text"
              value={formData.discordAccount || ""}
              onChange={(e) =>
                setFormData({ ...formData, discordAccount: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              学校区分
            </label>
            <select
              value={formData.schoolCategory || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  schoolCategory: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
            >
              <option value={0}>高校</option>
              <option value={1}>高専</option>
              <option value={2}>大学</option>
              <option value={3}>大学院</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              学校名
            </label>
            <input
              type="text"
              value={formData.schoolName || ""}
              onChange={(e) =>
                setFormData({ ...formData, schoolName: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              学年
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.schoolYear || 1}
              onChange={(e) =>
                setFormData({ ...formData, schoolYear: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              学科
            </label>
            <input
              type="text"
              value={formData.schoolDepartment || ""}
              onChange={(e) =>
                setFormData({ ...formData, schoolDepartment: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {isSubmitting ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
              {user.nickName
                ? user.nickName.charAt(0)
                : user.firstName.charAt(0)}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user.nickName || `${user.firstName} ${user.lastName}`}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                スキル:
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {getCategoryLabel(user.userCategory)}
              </span>
            </div>

            {user.discordAccount && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Discord:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {user.discordAccount}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                学校区分:
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {getSchoolCategoryLabel(user.schoolCategory)}
              </span>
            </div>

            {user.schoolName && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  学校名:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {user.schoolName}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                学年:
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {user.schoolYear}年
              </span>
            </div>

            {user.schoolDepartment && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  学科:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {user.schoolDepartment}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
