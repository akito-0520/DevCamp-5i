import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "~/firebaseConfig";
import type { GroupMember } from "../types/GroupMember";

export async function getParticipatedGroupId(userId: string) {
  const q = query(collection(db, "group_list"), where("user_id", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return [];
  }

  const data = snapshot.docs.map((doc) => doc.data().group_id);

  return data;
}

export async function getGroupMembersList(groupId: string) {
  const q = query(
    collection(db, "group_list"),
    where("group_id", "==", groupId),
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      groupId: data.group_id,
      position: data.position,
      role: data.role,
      userId: data.user_id,
    } as GroupMember;
  });
}

export async function updateUserPosition(
  groupListId: string,
  position: { x: number; y: number },
) {
  const q = doc(db, "group_list", groupListId);
  await updateDoc(q, {
    position: position,
  });
}

export async function addGroupList(groupList: GroupMember) {
  const q = collection(db, "group_list");
  await addDoc(q, {
    group_id: groupList.groupId,
    user_id: groupList.userId,
    role: groupList.role,
    position: groupList.position,
  });
}
