import { addDoc, collection } from "firebase/firestore";
import { db } from "~/firebaseConfig";

type CreateHackathonProps = {
  ownerId: string;
  startDate: Date;
  finishDate: Date;
  isDeadline: boolean;
  isFinish: boolean;
  numberOfTeams?: number | undefined;
  numberOfTeamsUpper?: number | undefined;
  numberOfTeamsLower?: number | undefined;
  teamSize?: number | undefined;
  teamSizeUpper?: number | undefined;
  teamSizeLower?: number | undefined;
  URL?: string | undefined;
  name: string;
  backendNumber?: number | undefined;
  frontendNumber?: number | undefined;
};

export async function createHackathon(hackathon: CreateHackathonProps) {
  const q = collection(db, "hackathon");
  await addDoc(q, {
    owner: hackathon.ownerId,
    start_date: hackathon.startDate,
    finish_date: hackathon.finishDate,
    is_deadline: hackathon.isDeadline,
    is_finish: hackathon.isFinish,
    number_of_teams: hackathon.numberOfTeams,
    number_of_teams_upper: hackathon.numberOfTeamsUpper,
    number_of_teams_lower: hackathon.numberOfTeamsLower,
    team_size: hackathon.teamSize,
    team_size_upper: hackathon.teamSizeUpper,
    team_size_lower: hackathon.teamSizeLower,
    url: hackathon.URL,
    name: hackathon.name,
    backend_number: hackathon.backendNumber,
    frontend_number: hackathon.frontendNumber,
  });
}
