import type { Room as RoomType } from '../store/useRoomStore';

interface RoomProps {
  room: RoomType;
  isCurrentUser: boolean;
  onClick: () => void;
  teamColor?: string;
}

export function Room({ room, isCurrentUser, onClick, teamColor }: RoomProps) {
  const { user } = room;
  
  return (
    <div
      onClick={onClick}
      className={`
        relative w-20 h-20 border-2 rounded-lg cursor-pointer
        transition-all duration-200 hover:scale-105
        ${isCurrentUser ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'}
        ${teamColor ? `ring-4 ring-${teamColor}-400 ring-opacity-50` : ''}
        ${!user ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
      `}
    >
      {user ? (
        <div className="flex flex-col items-center justify-center h-full p-2">
          {user.discordAvatar ? (
            <img
              src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
              alt={user.name}
              className="w-10 h-10 rounded-full mb-1"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-600 mb-1 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-center truncate w-full font-medium">
            {user.name}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400 dark:text-gray-600 text-xs">空き</span>
        </div>
      )}
      
      {room.teamId && (
        <div 
          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-${teamColor}-500 flex items-center justify-center`}
          title={`Team ${room.teamId}`}
        >
          <span className="text-white text-xs font-bold">T</span>
        </div>
      )}
    </div>
  );
}