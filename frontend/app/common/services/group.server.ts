import { db } from "~/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  documentId,
  doc,
  getDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import type { Group } from "../types/Group";

export async function getParticipatedGroup(groupIdList: string[]) {
  if (groupIdList.length === 0) return [];

  const q = query(
    collection(db, "group"),
    where(documentId(), "in", groupIdList),
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.group_name,
      introduction: data.group_introduction,
      makerUserId: data.maker_user_id,
    } as Group;
  });
}

export async function getGroupById(groupId: string) {
  const ref = doc(db, "group", groupId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    id: snap.id,
    name: data.group_name,
    introduction: data.group_introduction,
    makerUserId: data.maker_user_id,
  } as Group;
}

export async function createGroup(group: Group) {
  const q = collection(db, "group");
  const docRef = await addDoc(q, {
    group_name: group.name,
    group_introduction: group.introduction,
    maker_user_id: group.makerUserId,
  });
  return docRef.id;
}

export async function updateGroup(groupId: string, group: Partial<Group>) {
  const ref = doc(db, "group", groupId);
  const updateData: any = {};

  if (group.name !== undefined) {
    updateData.group_name = group.name;
  }
  if (group.introduction !== undefined) {
    updateData.group_introduction = group.introduction;
  }

  await updateDoc(ref, updateData);
}
