export type Hackathon = {
  hackathonId: string;
  ownerId: string;
  startDate: Date;
  finishDate: Date;
  isDeadline: boolean;
  isFinish: boolean;
  numberOfTeams?: number;
  numberOfTeamsUpper?: number;
  numberOfTeamsLower?: number;
  teamSize?: number;
  teamSizeUpper?: number;
  teamSizeLower?: number;
  URL?: string;
  name: string;
  backendNumber?: number;
  frontendNumber?: number;
};
