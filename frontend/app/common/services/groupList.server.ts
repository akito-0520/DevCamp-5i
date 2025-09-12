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
  groupId: string,
  userId: string,
) {
  // Check if the position is already occupied by another user
  const q = query(
    collection(db, "group_list"),
    where("group_id", "==", groupId),
    where("position.x", "==", position.x),
    where("position.y", "==", position.y),
  );

  const snap = await getDocs(q);

  // Check if position is occupied by another user
  const isOccupied = snap.docs.some((doc) => {
    const data = doc.data();
    return data.user_id !== userId; // Position is occupied by different user
  });

  if (isOccupied) {
    throw new Error("Position is already occupied by another user");
  }

  // Update the position if not occupied
  const docRef = doc(db, "group_list", groupListId);
  await updateDoc(docRef, {
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
