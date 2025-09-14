export type Hackathon = {
  hackathonId: string;
  name: string;
  groupId: string;
  ownerId: string;
  startDate: Date;
  finishDate: Date;
  isDeadline: boolean;
  numberOfTeams?: number;
  numberOfTeamsUpper?: number;
  numberOfTeamsLower?: number;
  teamSize?: number;
  teamSizeUpper?: number;
  teamSizeLower?: number;
  url?: string;
  backendNumber?: number;
  frontendNumber?: number;
};
