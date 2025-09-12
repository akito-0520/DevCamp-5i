import type { Hackathon } from "~/common/types/Hackathon";
import { useFetcher } from "react-router";
import { useState } from "react";
import { DeadlineConfirmDialog } from "./DeadlineConfirmDialog";

interface HackathonListProps {
  hackathons: Hackathon[];
  onSelect?: (hackathon: Hackathon) => void;
  currentUserId?: string;
}

export function HackathonList({
  hackathons,
  onSelect,
  currentUserId,
}: HackathonListProps) {
  const fetcher = useFetcher();
  const [showDeadlineDialog, setShowDeadlineDialog] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(
    null,
  );
  const formatDate = (date: Date): string => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString("ja-JP");
  };

  const getStatusBadge = (hackathon: Hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const finishDate = new Date(hackathon.finishDate);

    if (now > finishDate) {
      return (
        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
          終了
        </span>
      );
    } else if (now < startDate) {
      // 締切済みの場合は「開催待ち」、そうでない場合は「募集中」
      if (hackathon.isDeadline) {
        return (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
            開催待ち
          </span>
        );
      } else {
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
            募集中
          </span>
        );
      }
    } else if (now >= startDate && now <= finishDate) {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
          開催中
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
          終了
        </span>
      );
    }
  };

  if (hackathons.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          ハッカソンはありません
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          ハッカソン
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {hackathons.map((hackathon) => (
          <div
            key={hackathon.hackathonId}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => onSelect?.(hackathon)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {hackathon.name}
              </h4>
              <div className="flex items-center gap-2">
                {getStatusBadge(hackathon)}
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                期間: {formatDate(hackathon.startDate)} 〜{" "}
                {formatDate(hackathon.finishDate)}
              </p>
              {hackathon.teamSize && <p>チーム人数: {hackathon.teamSize}人</p>}
              {hackathon.teamSizeLower && hackathon.teamSizeUpper && (
                <p>
                  チーム人数: {hackathon.teamSizeLower}〜
                  {hackathon.teamSizeUpper}人
                </p>
              )}
              {(hackathon.frontendNumber || hackathon.backendNumber) && (
                <p>
                  必要スキル:
                  {hackathon.frontendNumber &&
                    ` フロントエンド${hackathon.frontendNumber}人`}
                  {hackathon.backendNumber &&
                    ` バックエンド${hackathon.backendNumber}人`}
                </p>
              )}
              {/* 締切ボタン: 自分が作成者で、開催前で、まだ締切になっていない場合のみ表示 */}
              {currentUserId === hackathon.ownerId &&
                new Date() < new Date(hackathon.startDate) &&
                !hackathon.isDeadline && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedHackathon(hackathon);
                        setShowDeadlineDialog(true);
                      }}
                      className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    >
                      締切
                    </button>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

      <DeadlineConfirmDialog
        isOpen={showDeadlineDialog}
        onClose={() => {
          setShowDeadlineDialog(false);
          setSelectedHackathon(null);
        }}
        onConfirm={() => {
          if (selectedHackathon) {
            const formData = new FormData();
            formData.append("actionType", "updateDeadline");
            formData.append("hackathonId", selectedHackathon.hackathonId);
            fetcher.submit(formData, { method: "post" });
            setShowDeadlineDialog(false);
            setSelectedHackathon(null);
          }
        }}
        hackathonName={selectedHackathon?.name || ""}
        isProcessing={fetcher.state === "submitting"}
      />
    </div>
  );
}
