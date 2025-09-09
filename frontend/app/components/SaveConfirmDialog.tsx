interface SaveConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}

export function SaveConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isSaving,
}: SaveConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          位置情報の保存
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          現在のルーム配置を保存しますか？
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving}
            className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
