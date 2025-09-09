export type HackathonInvitation = {
  hackathonId: string;
  userId: string;
  isInviteAccept: boolean;
  isJoin: boolean;
  teamNumber: number;
  limitDay: Date;
  groupId: string;
};
