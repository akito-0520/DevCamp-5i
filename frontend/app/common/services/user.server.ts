import { doc, getDoc } from "firebase/firestore";
import { db } from "~/firebaseConfig";
import type { User } from "../types/User";

export async function getUser(userId: string) {
  const ref = doc(db, "user", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    id: snap.id,
    userId: data.user_id,
    firstname: data.first_name,
    lastName: data.last_name,
    nickName: data.nick_name,
    userCategory: data.user_category,
    discordAccount: data.discord_account,
    schoolCategory: data.school_category,
    schoolName: data.school_name,
    schoolYear: data.school_year,
    schoolDepartment: data.school_department,
  } as User;
}
