interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          ログアウトの確認
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          本当にログアウトしますか？
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}