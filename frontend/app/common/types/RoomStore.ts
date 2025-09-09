import type { Hackathon } from "./Hackathon";
import type { Room } from "./Room";
import type { Team } from "./Team";
import type { User } from "./User";

export interface RoomStore {
  rooms: Room[];
  users: Map<string, User>;
  teams: Map<string, Team>;
  hackathons: Map<string, Hackathon>;
  currentUserId: string | null;

  initializeRooms: (gridSize: number) => void;
  moveUserToRoom: (userId: string, x: number, y: number) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  createTeam: (teamData: Omit<Team, "id">) => string;
  assignTeamToRooms: (teamId: string, roomIds: number[]) => void;
  setCurrentUser: (userId: string) => void;
  addUser: (user: User) => void;
}
