import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  discordId: string;
  discordAvatar?: string;
  skills: string[];
  school?: string;
  grade?: number;
  email: string;
  isSkillsPublic: boolean;
}

export interface Room {
  id: number;
  x: number;
  y: number;
  userId?: string;
  user?: User;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  hackathonId: string;
  memberIds: string[];
  color: string;
}

export interface Hackathon {
  id: string;
  name: string;
  requirements?: {
    skills?: string[];
    minGrade?: number;
    maxGrade?: number;
    schoolTypes?: string[];
  };
}

interface RoomStore {
  rooms: Room[];
  users: Map<string, User>;
  teams: Map<string, Team>;
  hackathons: Map<string, Hackathon>;
  currentUserId: string | null;
  
  initializeRooms: (gridSize: number) => void;
  moveUserToRoom: (userId: string, roomId: number) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  createTeam: (teamData: Omit<Team, 'id'>) => string;
  assignTeamToRooms: (teamId: string, roomIds: number[]) => void;
  setCurrentUser: (userId: string) => void;
  addUser: (user: User) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  users: new Map(),
  teams: new Map(),
  hackathons: new Map(),
  currentUserId: null,
  
  initializeRooms: (gridSize) => {
    const rooms: Room[] = [];
    let id = 0;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        rooms.push({ id: id++, x, y });
      }
    }
    set({ rooms });
  },
  
  moveUserToRoom: (userId, roomId) => {
    set((state) => {
      const rooms = state.rooms.map(room => {
        if (room.userId === userId) {
          return { ...room, userId: undefined, user: undefined };
        }
        if (room.id === roomId) {
          const user = state.users.get(userId);
          return { ...room, userId, user };
        }
        return room;
      });
      return { rooms };
    });
  },
  
  updateUser: (userId, userData) => {
    set((state) => {
      const users = new Map(state.users);
      const currentUser = users.get(userId);
      if (currentUser) {
        users.set(userId, { ...currentUser, ...userData });
      }
      return { users };
    });
  },
  
  createTeam: (teamData) => {
    const teamId = `team-${Date.now()}`;
    const team: Team = { ...teamData, id: teamId };
    set((state) => {
      const teams = new Map(state.teams);
      teams.set(teamId, team);
      return { teams };
    });
    return teamId;
  },
  
  assignTeamToRooms: (teamId, roomIds) => {
    set((state) => {
      const rooms = state.rooms.map(room => {
        if (roomIds.includes(room.id)) {
          return { ...room, teamId };
        }
        return room;
      });
      return { rooms };
    });
  },
  
  setCurrentUser: (userId) => {
    set({ currentUserId: userId });
  },
  
  addUser: (user) => {
    set((state) => {
      const users = new Map(state.users);
      users.set(user.id, user);
      return { users };
    });
  },
}));