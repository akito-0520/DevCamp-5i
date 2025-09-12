import type { Hackathon } from "~/common/types/Hackathon";
import { useFetcher } from "react-router";
import { useState } from "react";
import { DeadlineConfirmDialog } from "./DeadlineConfirmDialog";
import { HackathonDetailModal } from "./HackathonDetailModal";

interface HackathonListProps {
  hackathons: Hackathon[];
  onSelect?: (hackathon: Hackathon) => void;
  currentUserId?: string;
  userHackathonLists?: any[]; // Add invitation data
}

export function HackathonList({
  hackathons,
  onSelect,
  currentUserId,
  userHackathonLists = [],
}: HackathonListProps) {
  const fetcher = useFetcher();
  const [showDeadlineDialog, setShowDeadlineDialog] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailHackathon, setDetailHackathon] = useState<Hackathon | null>(
    null,
  );

  // Find invitation for a hackathon
  const getInvitation = (hackathonId: string) => {
    return userHackathonLists.find(
      (invitation) => invitation.hackathonId === hackathonId,
    );
  };

  // Check if hackathon should be in closed tab
  const isClosedHackathon = (hackathon: Hackathon) => {
    const now = new Date();
    const finishDate = new Date(hackathon.finishDate);
    const invitation = getInvitation(hackathon.hackathonId);
    const isOwner = currentUserId === hackathon.ownerId;

    if (isOwner) {
      // 主催者の場合
      if (now > finishDate) return true;
      // 終了済み
      if (hackathon.isDeadline && (!invitation || !invitation.isJoin))
        // 締切設定済みかつis_joinがfalse
        return true;
    } else {
      // 招待される側の場合
      // 終了済みでチームメンバー（is_join = true）
      if (now > finishDate && invitation && invitation.isJoin) return true;
    }

    return false;
  };

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
    const invitation = getInvitation(hackathon.hackathonId);

    // if (isOwner) {
    // 主催者の場合
    if (now > finishDate) {
      // 現在が終了日より後
      return (
        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
          終了
        </span>
      );
    } else if (now < startDate) {
      // 現在が開始日より前
      if (!hackathon.isDeadline) {
        // 締切前
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
            募集中
          </span>
        );
      } else {
        if (invitation.isJoin) {
          return (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
              開催待ち
            </span>
          );
        } else {
          return (
            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
              終了
            </span>
          );
        }
      }
    } else {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
          開催中
        </span>
      );
    }
  };

  // Filter hackathons based on active tab
  const filteredHackathons = hackathons.filter((hackathon) => {
    const isClosed = isClosedHackathon(hackathon);
    return activeTab === "active" ? !isClosed : isClosed;
  });

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
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "active"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            進行中
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "closed"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            締切・終了
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {filteredHackathons.length === 0 ? (
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              {activeTab === "active"
                ? "進行中のハッカソンはありません"
                : "締切・終了したハッカソンはありません"}
            </p>
          </div>
        ) : (
          filteredHackathons.map((hackathon) => {
            const invitation = getInvitation(hackathon.hackathonId);
            const now = new Date();
            const startDate = new Date(hackathon.startDate);
            const hasStarted = now >= startDate;

            if (currentUserId !== hackathon.ownerId) {
              // 招待される側
              if (
                (hackathon.isDeadline || hasStarted) &&
                (!invitation || !invitation.isJoin)
              ) {
                return null;
              }
            }

            return (
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
                  {hackathon.teamSize && (
                    <p>チーム人数: {hackathon.teamSize}人</p>
                  )}
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
                      <div
                        className="mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setSelectedHackathon(hackathon);
                            setShowDeadlineDialog(true);
                          }}
                          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                        >
                          締め切る
                        </button>
                      </div>
                    )}

                  {/* 受け入れボタン: 主催者ではなく、招待されていて、まだ受け入れていない、開催前の場合のみ表示 */}
                  {(() => {
                    const invitation = getInvitation(hackathon.hackathonId);
                    const isBeforeStart =
                      new Date() < new Date(hackathon.startDate);
                    const isNotOwner = currentUserId !== hackathon.ownerId;

                    return invitation &&
                      !invitation.isInviteAccept &&
                      isBeforeStart &&
                      isNotOwner ? (
                      <div
                        className="mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            const formData = new FormData();
                            formData.append("actionType", "acceptInvitation");
                            formData.append("invitationId", invitation.id);
                            fetcher.submit(formData, { method: "post" });
                          }}
                          disabled={fetcher.state === "submitting"}
                          className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50"
                        >
                          {fetcher.state === "submitting"
                            ? "受け入れ中..."
                            : "受け入れる"}
                        </button>
                      </div>
                    ) : null;
                  })()}

                  {/* 詳細ボタン: 常に表示 */}
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setDetailHackathon(hackathon);
                        setShowDetailModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    >
                      詳細を見る
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
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

      <HackathonDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDetailHackathon(null);
        }}
        hackathon={detailHackathon}
        currentUserId={currentUserId}
        isJoin={
          detailHackathon
            ? getInvitation(detailHackathon.hackathonId)?.isJoin || false
            : false
        }
      />
    </div>
  );
}
