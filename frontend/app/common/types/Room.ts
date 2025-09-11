import type { User } from "./User";

export interface Room {
  id: number;
  x: number;
  y: number;
  userId?: string;
  user?: User;
}
