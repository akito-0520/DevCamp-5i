import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "~/firebaseConfig";
import type { HackathonInvitation } from "../types/HackathonInvitation";

export async function getUserHackathonLists(userId: string) {
  const q = query(
    collection(db, "hackathon_list"),
    where("user_id", "==", userId),
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      hackathonId: data.hackathon_id,
      userId: data.user_id,
      isInviteAccept: data.is_invite_accept,
      isJoin: data.is_join,
      teamNumber: data.team_number,
      limitDay: data.limit_day ? new Date(data.limit_day) : undefined,
    } as HackathonInvitation;
  });
}
