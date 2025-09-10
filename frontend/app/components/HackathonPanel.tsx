import { useState, useEffect } from "react";
import type { User } from "../common/types/User";
import type { Hackathon } from "~/common/types/Hackathon";
import { useFetcher } from "react-router";

interface HackathonPanelProps {
  onClose: () => void;
  currentUser: User;
}

export function HackathonPanel({ onClose, currentUser }: HackathonPanelProps) {
  const fetcher = useFetcher();
  const [hackathonData, setHackathonData] = useState<Partial<Hackathon>>({
    ownerId: currentUser.userId,
    startDate: new Date(),
    finishDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isDeadline: false,
    isFinish: false,
    name: "",
  });
  const [showRecruitmentInfo, setShowRecruitmentInfo] = useState(true);
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);

  const isSubmitting = fetcher.state === "submitting";

  // 作成成功後に閉じる
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose]);

  const handleCreateRecruitment = () => {
    if (!hackathonData.name) return;

    // モードに応じて適切な値を設定
    const finalData = { ...hackathonData };
    if (!useAdvancedMode) {
      // 推奨値モードの場合、最小・最大をundefinedに
      finalData.teamSizeLower = undefined;
      finalData.teamSizeUpper = undefined;
    } else {
      // 詳細モードの場合、推奨値をundefinedに
      finalData.teamSize = undefined;
    }

    // FormDataを使用してサーバーに送信
    const formData = new FormData();
    formData.append("actionType", "createHackathon");
    formData.append("hackathonData", JSON.stringify(finalData));

    fetcher.submit(formData, { method: "post" });
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const getTodayString = (): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ハッカソンメンバーを募集
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

        {showRecruitmentInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  主催者情報
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p>
                    <span className="font-medium">名前:</span>{" "}
                    {currentUser.nickName ||
                      `${currentUser.firstname} ${currentUser.lastName}`}
                  </p>
                  <p>
                    <span className="font-medium">学校:</span>{" "}
                    {currentUser.schoolName}
                  </p>
                  <p>
                    <span className="font-medium">学年:</span>{" "}
                    {currentUser.schoolYear}年
                  </p>
                  <p>
                    <span className="font-medium">学科:</span>{" "}
                    {currentUser.schoolDepartment}
                  </p>
                  <p>
                    <span className="font-medium">Discord:</span>{" "}
                    {currentUser.discordAccount}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRecruitmentInfo(false)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ハッカソン名 *
            </label>
            <input
              type="text"
              value={hackathonData.name}
              onChange={(e) =>
                setHackathonData({ ...hackathonData, name: e.target.value })
              }
              placeholder="例: 高専プロコン2025"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={formatDate(hackathonData.startDate)}
                min={getTodayString()}
                onChange={(e) =>
                  setHackathonData({
                    ...hackathonData,
                    startDate: new Date(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={formatDate(hackathonData.finishDate)}
                min={formatDate(hackathonData.startDate) || getTodayString()}
                onChange={(e) =>
                  setHackathonData({
                    ...hackathonData,
                    finishDate: new Date(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ハッカソンURL（任意）
            </label>
            <input
              type="url"
              value={hackathonData.URL}
              onChange={(e) =>
                setHackathonData({ ...hackathonData, URL: e.target.value })
              }
              placeholder="https://example.com/hackathon"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                チーム構成
              </h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useAdvancedMode}
                  onChange={(e) => {
                    setUseAdvancedMode(e.target.checked);
                    if (e.target.checked) {
                      // 詳細モードに切り替え時、最小・最大に推奨値を基に初期値を設定
                      if (hackathonData.teamSize) {
                        setHackathonData({
                          ...hackathonData,
                          teamSizeLower: Math.max(
                            1,
                            hackathonData.teamSize - 1,
                          ),
                          teamSizeUpper: hackathonData.teamSize + 2,
                        });
                      }
                    }
                  }}
                  className="rounded text-purple-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  最小・最大を個別に設定
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  チーム人数
                </label>
                {useAdvancedMode ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">
                        最小人数
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={hackathonData.teamSizeLower}
                        onChange={(e) =>
                          setHackathonData({
                            ...hackathonData,
                            teamSizeLower: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">
                        最大人数
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={hackathonData.teamSizeUpper}
                        onChange={(e) =>
                          setHackathonData({
                            ...hackathonData,
                            teamSizeUpper: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      最小・最大を指定
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={hackathonData.teamSize}
                      onChange={(e) =>
                        setHackathonData({
                          ...hackathonData,
                          teamSize: parseInt(e.target.value),
                        })
                      }
                      placeholder="推奨人数"
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      人数を指定
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  必要な開発者数（任意）
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      フロントエンド開発者
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={hackathonData.frontendNumber}
                      onChange={(e) =>
                        setHackathonData({
                          ...hackathonData,
                          frontendNumber: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      バックエンド開発者
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={hackathonData.backendNumber}
                      onChange={(e) =>
                        setHackathonData({
                          ...hackathonData,
                          backendNumber: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
              募集概要
            </h4>
            <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <p>
                • 期間: {formatDate(hackathonData.startDate)} 〜{" "}
                {formatDate(hackathonData.finishDate)}
              </p>
              {useAdvancedMode ? (
                <>
                  <p>
                    • チーム人数: {hackathonData.teamSizeLower}〜
                    {hackathonData.teamSizeUpper}人
                  </p>
                </>
              ) : (
                <>
                  <p>• チーム人数: {hackathonData.teamSize}人</p>
                </>
              )}
              {(hackathonData.frontendNumber ||
                hackathonData.backendNumber) && (
                <p>
                  • 必要スキル: フロントエンド{hackathonData.frontendNumber}
                  人、バックエンド{hackathonData.backendNumber}人
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreateRecruitment}
              disabled={!hackathonData.name || isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "作成中..." : "募集を開始"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
