export type GroupMember = {
  groupId: string;
  userId: string;
  role: number;
  position: {
    x: number;
    y: number;
  };
};
