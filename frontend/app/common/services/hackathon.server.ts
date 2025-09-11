import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "~/firebaseConfig";
import type { Hackathon } from "../types/Hackathon";

type CreateHackathonProps = {
  name: string;
  groupId: string;
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
  backendNumber?: number | undefined;
  frontendNumber?: number | undefined;
};

export async function createHackathon(hackathon: CreateHackathonProps) {
  const q = collection(db, "hackathon");

  const docData = {
    name: hackathon.name,
    group_id: hackathon.groupId,
    owner: hackathon.ownerId,
    start_date: hackathon.startDate.toISOString(),
    finish_date: hackathon.finishDate.toISOString(),
    is_deadline: hackathon.isDeadline,
    url: hackathon.URL ?? "",
    ...(hackathon.numberOfTeams !== undefined && {
      number_of_teams: hackathon.numberOfTeams,
    }),
    ...(hackathon.numberOfTeamsUpper !== undefined && {
      number_of_teams_upper: hackathon.numberOfTeamsUpper,
    }),
    ...(hackathon.numberOfTeamsLower !== undefined && {
      number_of_teams_lower: hackathon.numberOfTeamsLower,
    }),
    ...(hackathon.teamSize !== undefined && { team_size: hackathon.teamSize }),
    ...(hackathon.teamSizeUpper !== undefined && {
      team_size_upper: hackathon.teamSizeUpper,
    }),
    ...(hackathon.teamSizeLower !== undefined && {
      team_size_lower: hackathon.teamSizeLower,
    }),
    ...(hackathon.backendNumber !== undefined && {
      backend_number: hackathon.backendNumber,
    }),
    ...(hackathon.frontendNumber !== undefined && {
      frontend_number: hackathon.frontendNumber,
    }),
  };

  await addDoc(q, docData);
}

export async function getHackathons(groupId: string) {
  const q = query(
    collection(db, "hackathon"),
    where("group_id", "==", groupId),
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      hackathonId: doc.id,
      name: data.name,
      groupId: data.group_id,
      ownerId: data.owner,
      startDate: new Date(data.start_date),
      finishDate: new Date(data.finish_date),
      isDeadline: data.is_deadline,
      url: data.url ?? "",
      numberOfTeams: data.number_of_teams,
      numberOfTeamsUpper: data.number_of_teams_upper,
      numberOfTeamsLower: data.number_of_teams_lower,
      teamSize: data.team_size,
      teamSizeUpper: data.team_size_upper,
      teamSizeLower: data.team_size_lower,
      backendNumber: data.backend_number,
      frontendNumber: data.frontend_number,
    } as Hackathon;
  });
}
