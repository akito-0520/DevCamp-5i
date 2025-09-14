import { useState, useEffect } from "react";
import type { Hackathon } from "~/common/types/Hackathon";
import { useFetcher } from "react-router";

interface HackathonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathon: Hackathon | null;
  currentUserId?: string;
  isJoin?: boolean;
  invitation?: {
    id: string;
    hackathonId: string;
    isJoin: boolean;
    isInviteAccept: boolean;
  };
}

interface TeamMember {
  userId: string;
  nickName?: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  schoolYear: number;
  schoolDepartment: string;
  discordAccount: string;
  teamNumber?: number;
}

export function HackathonDetailModal({
  isOpen,
  onClose,
  hackathon,
  currentUserId,
  isJoin = false,
  invitation,
}: HackathonDetailModalProps) {
  const fetcher = useFetcher();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && hackathon && isJoin) {
      setIsLoading(true);
      // Fetch team members data only if isJoin is true
      const formData = new FormData();
      formData.append("actionType", "getHackathonMembers");
      formData.append("hackathonId", hackathon.hackathonId);
      fetcher.submit(formData, { method: "post" });
    }
  }, [isOpen, hackathon, isJoin]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.members) {
      setTeamMembers(fetcher.data.members);
      setIsLoading(false);
    }
  }, [fetcher.state, fetcher.data]);

  if (!isOpen || !hackathon) return null;

  const formatDate = (date: Date): string => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString("ja-JP");
  };

  const getStatusBadge = () => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const finishDate = new Date(hackathon.finishDate);

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
        if (invitation?.isJoin) {
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

  // Group members by team number
  const groupedMembers = teamMembers.reduce(
    (acc, member) => {
      const teamNum = member.teamNumber || 0;
      if (!acc[teamNum]) {
        acc[teamNum] = [];
      }
      acc[teamNum].push(member);
      return acc;
    },
    {} as Record<number, TeamMember[]>,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {hackathon.name}
            </h2>
            {getStatusBadge()}
          </div>
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

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              基本情報
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">期間:</span>{" "}
                {formatDate(hackathon.startDate)} 〜{" "}
                {formatDate(hackathon.finishDate)}
              </p>
              {hackathon.url && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">URL:</span>{" "}
                  <a
                    href={hackathon.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline"
                  >
                    {hackathon.url}
                  </a>
                </p>
              )}
              {hackathon.teamSize && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">チーム人数:</span>{" "}
                  {hackathon.teamSize}人
                </p>
              )}
              {hackathon.teamSizeLower && hackathon.teamSizeUpper && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">チーム人数:</span>{" "}
                  {hackathon.teamSizeLower}〜{hackathon.teamSizeUpper}人
                </p>
              )}
              {(hackathon.frontendNumber || hackathon.backendNumber) && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">必要スキル:</span>
                  {hackathon.frontendNumber &&
                    ` フロントエンド${hackathon.frontendNumber}人`}
                  {hackathon.backendNumber &&
                    ` バックエンド${hackathon.backendNumber}人`}
                </p>
              )}
            </div>
          </div>

          {/* Team Members - Only show if isJoin is true */}
          {isJoin && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                参加メンバー
              </h3>
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">
                    メンバー情報を読み込み中...
                  </p>
                </div>
              ) : Object.keys(groupedMembers).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  メンバー情報がありません
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedMembers).map(
                    ([teamNumber, members]) => (
                      <div
                        key={teamNumber}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                      >
                        {teamNumber !== "0" && (
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                            チーム {teamNumber}
                          </h4>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {members.map((member) => (
                            <div
                              key={member.userId}
                              className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm"
                            >
                              <div className="space-y-1 text-sm">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {member.nickName ||
                                    `${member.firstName} ${member.lastName}`}
                                  {member.userId === hackathon.ownerId && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded">
                                      主催者
                                    </span>
                                  )}
                                  {member.userId === currentUserId && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                                      あなた
                                    </span>
                                  )}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {member.schoolName} {member.schoolYear}年
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {member.schoolDepartment}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Discord: {member.discordAccount}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
