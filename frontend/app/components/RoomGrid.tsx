import { useEffect, useState } from "react";
import { Room } from "./Room";
import { useRoomStore } from "../common/store/useRoomStore";
import { UserProfile } from "./UserProfile";
import { HackathonPanel } from "./HackathonPanel";
import { HackathonList } from "./HackathonList";
import type { Hackathon } from "~/common/types/Hackathon";

const GRID_SIZE = 6;

interface RoomGridProps {
  groupName?: string;
  groupId: string;
  hackathons?: Hackathon[];
  userHackathonLists?: any[]; // Add invitation data
}

export function RoomGrid({
  groupName,
  groupId,
  hackathons = [],
  userHackathonLists = [],
}: RoomGridProps) {
  const { rooms, currentUserId, initializeRooms, moveUserToRoom, users } =
    useRoomStore();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showHackathonPanel, setShowHackathonPanel] = useState(false);

  useEffect(() => {
    initializeRooms(GRID_SIZE);
  }, []);

  const handleRoomClick = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);

    if (room?.user) {
      if (room.user.userId === currentUserId) {
        setSelectedUserId(currentUserId);
      } else {
        setSelectedUserId(room.user.userId);
      }
    } else if (currentUserId && room) {
      moveUserToRoom(currentUserId, room.x, room.y);
    }
  };

  const roomGrid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const room = rooms.find((r) => r.x === x && r.y === y);
      if (room) {
        row.push(
          <Room
            key={room.id}
            room={room}
            isCurrentUser={room.userId === currentUserId}
            onClick={() => handleRoomClick(room.id)}
          />,
        );
      }
    }
    roomGrid.push(
      <div key={y} className="flex gap-3">
        {row}
      </div>,
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          {groupName && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {groupName}
            </h1>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHackathonPanel(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            ハッカソンメンバーを募集
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            あなた
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            他のユーザー
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            空き部屋
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="inline-block p-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3">{roomGrid}</div>
        </div>

        <div className="w-96">
          {currentUserId ? (
            <HackathonList
              hackathons={hackathons}
              currentUserId={currentUserId}
              userHackathonLists={userHackathonLists}
            />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                読み込み中...
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedUserId && (
        <UserProfile
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {showHackathonPanel && currentUserId && users.get(currentUserId) && (
        <HackathonPanel
          onClose={() => setShowHackathonPanel(false)}
          currentUser={users.get(currentUserId)!}
          groupId={groupId}
        />
      )}
    </div>
  );
}
