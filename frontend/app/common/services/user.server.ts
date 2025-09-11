import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "~/firebaseConfig";
import type { User } from "../types/User";

export async function getUser(userId: string) {
  const ref = doc(db, "user", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    userId: snap.id,
    firstName: data.first_name,
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

export async function createUser(user: User) {
  const docRef = doc(db, "user", user.userId);
  await setDoc(docRef, {
    first_name: user.firstName,
    last_name: user.lastName,
    nick_name: user.nickName,
    user_category: user.userCategory,
    discord_account: user.discordAccount,
    school_category: user.schoolCategory,
    school_name: user.schoolName,
    school_year: user.schoolYear,
    school_department: user.schoolDepartment,
  });
  return user.userId;
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const docRef = doc(db, "user", userId);

  const updateData: any = {};
  if (updates.firstName !== undefined)
    updateData.first_name = updates.firstName;
  if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
  if (updates.nickName !== undefined) updateData.nick_name = updates.nickName;
  if (updates.userCategory !== undefined)
    updateData.user_category = updates.userCategory;
  if (updates.discordAccount !== undefined)
    updateData.discord_account = updates.discordAccount;
  if (updates.schoolCategory !== undefined)
    updateData.school_category = updates.schoolCategory;
  if (updates.schoolName !== undefined)
    updateData.school_name = updates.schoolName;
  if (updates.schoolYear !== undefined)
    updateData.school_year = updates.schoolYear;
  if (updates.schoolDepartment !== undefined)
    updateData.school_department = updates.schoolDepartment;

  await updateDoc(docRef, updateData);
}
