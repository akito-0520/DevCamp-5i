export type GroupMember = {
  id: string;
  groupId: string;
  userId: string;
  role: number;
  position: {
    x: number;
    y: number;
  };
};
