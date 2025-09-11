import type { Hackathon } from "./Hackathon";
import type { Room } from "./Room";
import type { User } from "./User";

export interface RoomStore {
  rooms: Room[];
  users: Map<string, User>;
  hackathons: Map<string, Hackathon>;
  currentUserId: string | null;

  initializeRooms: (gridSize: number) => void;
  moveUserToRoom: (userId: string, x: number, y: number) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  setCurrentUser: (userId: string) => void;
  addUser: (user: User) => void;
}
