import { useState } from "react";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (groupData: { name: string; introduction: string }) => void;
  isCreating: boolean;
}

export function CreateGroupDialog({
  isOpen,
  onClose,
  onConfirm,
  isCreating,
}: CreateGroupDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    introduction: "",
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("グループ名を入力してください");
      return;
    }
    if (!formData.introduction.trim()) {
      alert("グループの説明を入力してください");
      return;
    }
    onConfirm(formData);
  };

  const handleClose = () => {
    setFormData({ name: "", introduction: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          新しいグループを作成
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              グループ名
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="例: 高専ハッカソン2025"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              グループの説明
            </label>
            <textarea
              value={formData.introduction}
              onChange={(e) =>
                setFormData({ ...formData, introduction: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="例: 2025年度の高専ハッカソンプロジェクトグループです"
              rows={3}
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isCreating ||
              !formData.name.trim() ||
              !formData.introduction.trim()
            }
            className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "作成中..." : "作成"}
          </button>
        </div>
      </div>
    </div>
  );
}
