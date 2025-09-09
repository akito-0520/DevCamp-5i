import { create } from "zustand";
import type { Room } from "~/common/types/Room";
import type { Team } from "~/common/types/Team";
import type { RoomStore } from "../types/RoomStore";

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

  moveUserToRoom: (userId, x, y) => {
    set((state) => {
      const rooms = state.rooms.map((room) => {
        if (room.userId === userId) {
          return { ...room, userId: undefined, user: undefined };
        }
        if (room.x === x && room.y === y) {
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
      const rooms = state.rooms.map((room) => {
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
      users.set(user.userId, user);
      return { users };
    });
  },
}));
