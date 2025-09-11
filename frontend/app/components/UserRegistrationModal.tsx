import { useState, useEffect } from "react";
import type { User } from "~/common/types/User";
import { useFetcher } from "react-router";

interface UserRegistrationModalProps {
  user: User | null;
  isOpen: boolean;
}

export function UserRegistrationModal({
  user,
  isOpen,
}: UserRegistrationModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: "",
    lastName: "",
    nickName: "",
    userCategory: 0,
    discordAccount: "",
    schoolCategory: 0,
    schoolName: "",
    schoolYear: 1,
    schoolDepartment: "",
  });
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const [errors, setErrors] = useState<string[]>([]);

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

  const validateForm = () => {
    const newErrors: string[] = [];
    if (!formData.firstName?.trim()) newErrors.push("名前（名）は必須です");
    if (!formData.lastName?.trim()) newErrors.push("名前（姓）は必須です");
    if (!formData.nickName?.trim()) newErrors.push("ニックネームは必須です");
    if (!formData.schoolName?.trim()) newErrors.push("学校名は必須です");
    if (!formData.schoolDepartment?.trim()) newErrors.push("学科は必須です");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    fetcher.submit(
      {
        ...formData,
        actionType: "updateUser",
      },
      { method: "post" },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            プロフィール登録
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            サービスを利用するために、以下の情報を登録してください。
            <span className="text-red-500 font-semibold">*</span>{" "}
            は必須項目です。
          </p>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <ul className="list-disc list-inside text-red-600 dark:text-red-400 text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                姓 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="山田"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="太郎"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ニックネーム <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nickName || ""}
              onChange={(e) =>
                setFormData({ ...formData, nickName: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="たろう"
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
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="username#1234"
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
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value={0}>高校</option>
              <option value={1}>高専</option>
              <option value={2}>大学</option>
              <option value={3}>大学院</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              学校名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.schoolName || ""}
              onChange={(e) =>
                setFormData({ ...formData, schoolName: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="○○高専"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              学年
            </label>
            <input
              type="number"
              min="1"
              max="6"
              value={formData.schoolYear || 1}
              onChange={(e) =>
                setFormData({ ...formData, schoolYear: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              学科 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.schoolDepartment || ""}
              onChange={(e) =>
                setFormData({ ...formData, schoolDepartment: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="情報工学科"
            />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? "登録中..." : "登録する"}
          </button>
        </div>
      </div>
    </div>
  );
}
