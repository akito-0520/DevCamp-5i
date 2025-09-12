import { create } from "zustand";
import type { Room } from "~/common/types/Room";
import type { RoomStore } from "../types/RoomStore";

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  users: new Map(),
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
      // Check if target position is already occupied
      const targetRoom = state.rooms.find(
        (room) => room.x === x && room.y === y,
      );
      if (targetRoom?.userId && targetRoom.userId !== userId) {
        // Position is already occupied by another user, don't move
        return state;
      }

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
