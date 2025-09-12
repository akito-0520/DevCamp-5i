interface DeadlineConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hackathonName: string;
  isProcessing?: boolean;
}

export function DeadlineConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  hackathonName,
  isProcessing = false,
}: DeadlineConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          募集を締切りますか？
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          「{hackathonName}」の募集を締切ります。
          <br />
          締切後は新しい参加者が招待を承認できなくなります。
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "処理中..." : "締切る"}
          </button>
        </div>
      </div>
    </div>
  );
}
