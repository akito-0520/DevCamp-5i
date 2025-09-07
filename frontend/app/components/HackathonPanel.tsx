import React, { useState } from 'react';
import { useRoomStore } from '../store/useRoomStore';

interface HackathonPanelProps {
  onClose: () => void;
}

export function HackathonPanel({ onClose }: HackathonPanelProps) {
  const { rooms, users, createTeam, assignTeamToRooms } = useRoomStore();
  
  const [hackathonName, setHackathonName] = useState('');
  const [requirements, setRequirements] = useState({
    skills: '',
    minGrade: 1,
    maxGrade: 5,
    teamSize: 3,
  });
  
  const findAdjacentRooms = (startRoomId: number, count: number): number[] => {
    const visited = new Set<number>();
    const queue = [startRoomId];
    const result: number[] = [];
    
    while (queue.length > 0 && result.length < count) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      const currentRoom = rooms.find(r => r.id === currentId);
      if (!currentRoom) continue;
      
      if (currentRoom.userId && !result.includes(currentId)) {
        result.push(currentId);
      }
      
      // 隣接する部屋を探す
      const neighbors = rooms.filter(r => {
        const dx = Math.abs(r.x - currentRoom.x);
        const dy = Math.abs(r.y - currentRoom.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
      });
      
      neighbors.forEach(n => {
        if (!visited.has(n.id)) {
          queue.push(n.id);
        }
      });
    }
    
    return result;
  };
  
  const createTeams = () => {
    const requiredSkills = requirements.skills.split(',').map(s => s.trim()).filter(s => s);
    
    // 条件に合うユーザーを探す
    const eligibleUsers = Array.from(users.values()).filter(user => {
      if (user.grade && (user.grade < requirements.minGrade || user.grade > requirements.maxGrade)) {
        return false;
      }
      
      if (requiredSkills.length > 0 && !requiredSkills.some(skill => 
        user.skills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
      )) {
        return false;
      }
      
      return true;
    });
    
    // ユーザーが配置されている部屋を取得
    const occupiedRooms = rooms.filter(room => 
      room.userId && eligibleUsers.some(user => user.id === room.userId)
    );
    
    const usedRooms = new Set<number>();
    const teams: { roomIds: number[]; memberIds: string[] }[] = [];
    
    // 隣接する部屋でチームを作成
    occupiedRooms.forEach(room => {
      if (usedRooms.has(room.id)) return;
      
      const adjacentRooms = findAdjacentRooms(room.id, requirements.teamSize);
      if (adjacentRooms.length === requirements.teamSize) {
        const memberIds = adjacentRooms
          .map(roomId => rooms.find(r => r.id === roomId)?.userId)
          .filter((id): id is string => id !== undefined);
        
        teams.push({ roomIds: adjacentRooms, memberIds });
        adjacentRooms.forEach(roomId => usedRooms.add(roomId));
      }
    });
    
    // チームを作成して色を割り当て
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'indigo'];
    teams.forEach((team, index) => {
      const color = colors[index % colors.length];
      const teamId = createTeam({
        name: `${hackathonName} Team ${index + 1}`,
        hackathonId: `hackathon-${Date.now()}`,
        memberIds: team.memberIds,
        color,
      });
      assignTeamToRooms(teamId, team.roomIds);
    });
    
    alert(`${teams.length}チームが作成されました！`);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ハッカソンチーム編成
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ハッカソン名
            </label>
            <input
              type="text"
              value={hackathonName}
              onChange={(e) => setHackathonName(e.target.value)}
              placeholder="例: 高専プロコン2025"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              必要スキル（カンマ区切り）
            </label>
            <input
              type="text"
              value={requirements.skills}
              onChange={(e) => setRequirements({ ...requirements, skills: e.target.value })}
              placeholder="例: React, Python, 機械学習"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                最小学年
              </label>
              <select
                value={requirements.minGrade}
                onChange={(e) => setRequirements({ ...requirements, minGrade: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded"
              >
                {[1, 2, 3, 4, 5].map(g => (
                  <option key={g} value={g}>{g}年</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                最大学年
              </label>
              <select
                value={requirements.maxGrade}
                onChange={(e) => setRequirements({ ...requirements, maxGrade: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded"
              >
                {[1, 2, 3, 4, 5].map(g => (
                  <option key={g} value={g}>{g}年</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              チームサイズ
            </label>
            <select
              value={requirements.teamSize}
              onChange={(e) => setRequirements({ ...requirements, teamSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded"
            >
              {[2, 3, 4, 5].map(size => (
                <option key={size} value={size}>{size}人</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              キャンセル
            </button>
            <button
              onClick={createTeams}
              disabled={!hackathonName}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              チーム作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}