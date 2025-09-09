import { db } from "~/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  documentId,
} from "firebase/firestore";
import type { Group } from "../types/Group";
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
