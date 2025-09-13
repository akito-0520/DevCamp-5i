import { onRequest } from "firebase-functions/v2/https";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import express from "express";

// ===================================================
// Part 1: SSRサーバー関数 (Expressラッパーを使用)
// ===================================================

const remixServer = express();

// frontendのビルド成果物から "entry" をインポート

// ===================================================
// Part 1: SSRサーバー関数
// ===================================================
remixServer.all("*", async (request, response) => {
  // ★ 関数が呼び出された時に初めてサーバープログラムとAdmin SDKをインポート
  const { entry } = await import("../server/index.js");
  const admin = await import("firebase-admin");

  // ★ 関数が呼び出された時に初めて初期化
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }

  // Remixサーバーハンドラを呼び出す
  return entry.module.default(request, response);
});

// Expressアプリをエクスポート
export const ssrServer = onRequest(remixServer);

// 他のバックエンド関数がある場合は、こちらも忘れずに
// export * from "./other-functions";
// 他のバックエンド関数も忘れずにエクスポート
// export * from "./other-functions";

// 位置情報(例: 1205)を座標(例: {x: 12, y: 5})に変換するヘルパー関数
const parsePosition = (position: { x: number; y: number } | undefined) => {
  if (
    position &&
    typeof position.x === "number" &&
    typeof position.y === "number"
  ) {
    return position;
  }
  return { x: 0, y: 0 };
};

const calculateDistance = (
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
) => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

export const onHackathonDeadline = onDocumentUpdated(
  "hackathon/{hackathonId}",
  async (event) => {
    const admin = await import("firebase-admin");
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    const db = admin.firestore();
    console.log("本格募集開始");
    // 更新前後のデータを取得
    const dataBefore = event.data?.before.data();
    const dataAfter = event.data?.after.data();

    // is_deadlineがfalseからtrueに変わった時だけ処理を実行する
    if (dataBefore?.is_deadline === false && dataAfter?.is_deadline === true) {
      console.log(
        `Deadline reached for hackathon: ${event.params.hackathonId}`
      );

      // event.paramsからドキュメントID（hackathonId）を取得
      const hackathonId = event.params.hackathonId;
      // 更新後のデータからownerフィールド（userId）を取得
      const userId = dataAfter.owner;
      console.log("処理開始");

      try {
        const tasksCollectionRef = db.collection("hackathon_list");
        console.log("ハッカソンリストからデータ取得開始");
        const snapshot = await tasksCollectionRef
          .where("hackathon_id", "==", hackathonId)
          .where("is_invite_accept", "==", true)
          .get();

        console.log("ハッカソンリストからデータ取得終了");
        if (snapshot.empty) {
          console.log("Accepted members not found for this hackathon.");
          return;
        }
        interface HackathonTask {
          group_id: string;
          user_id: string;
          role: string;
          // 他にもフィールドがあればここに追加
        }

        // 取得したドキュメントから配列を作成
        const completedTasks = snapshot.docs.map((doc) => {
          return { id: doc.id, ...(doc.data() as HackathonTask) };
        });
        console.log("ハッカソンリストからデータ配列化完了");
        // 招待を承認してくれた人数
        const acceptCount = snapshot.size;
        const groupId = completedTasks[0].group_id;

        const hackathonData = dataAfter;

        const teamSize = hackathonData.team_size;
        const teamSizeUpper = hackathonData.team_size_upper;
        const teamSizeLower = hackathonData.team_size_lower;
        const backendNumber = hackathonData.backend_number;
        const frontendNumber = hackathonData.frontend_number;

        const targetTeamSize = teamSizeUpper || teamSize;
        console.log("代入完了");

        if (
          acceptCount == 0 ||
          (teamSizeLower && teamSizeLower > acceptCount)
        ) {
          // 参加人数が足りないとき
          console.log("参加人数が足りませんでした");
          return;
        }
        console.log("人数足りないわけではない");
        const within =
          (teamSize !== null && acceptCount === teamSize) ||
          (teamSizeUpper !== null &&
            teamSizeLower === null &&
            acceptCount <= teamSizeUpper) ||
          (teamSizeLower !== null &&
            teamSizeUpper === null &&
            acceptCount >= teamSizeLower) ||
          (teamSizeLower !== null &&
            teamSizeUpper !== null &&
            acceptCount >= teamSizeLower &&
            acceptCount <= teamSizeUpper);
        if (within) {
          // 参加人数が適切な場合
          // 1. バッチ処理を初期化
          console.log("人数は適切");
          const batch = db.batch();
          console.log("バッチ処理開始");
          // 2. completedTasks配列の各ドキュメントIDに対して更新処理を準備
          completedTasks.forEach((task) => {
            // 更新対象ドキュメントへの参照を作成
            const docRef = db.collection("hackathon_list").doc(task.id);
            // バッチに更新オペレーションを追加
            batch.update(docRef, { is_join: true });
          });

          // 3. バッチ処理を実行
          await batch.commit();

          console.log("参加人数が適切で本格募集しました");
          return;
        }
        console.log("参加人数が多い");
        // 参加人数が多い場合
        if (acceptCount > targetTeamSize) {
          // 1. 基準となるユーザーの位置情報を取得
          console.log("グループリストからデータ取得開始");
          const currentUserGroupInfoSnap = await db
            .collection("group_list")
            .where("group_id", "==", groupId)
            .where("user_id", "==", userId)
            .limit(1)
            .get();
          if (currentUserGroupInfoSnap.empty) {
            console.log("基準ユーザーの位置情報が見つかりません。");
            return;
          }
          console.log("グループリストからデータ取得終了");
          const currentUserPosition =
            currentUserGroupInfoSnap.docs[0].data().position;

          const currentUserCoords = parsePosition(currentUserPosition);

          // 2. 全参加者の位置情報を並行取得し、距離を計算
          console.log("全参加者の位置情報を並行取得し、距離を計算");
          const participantsWithDistance = await Promise.all(
            completedTasks.map(async (task) => {
              const groupInfoSnap = await db
                .collection("group_list")
                .where("group_id", "==", groupId)
                .where("user_id", "==", task.user_id)
                .limit(1)
                .get();
              const position = groupInfoSnap.empty
                ? undefined
                : groupInfoSnap.docs[0].data().position;

              const coords = parsePosition(position);
              const distance = calculateDistance(currentUserCoords, coords);

              return {
                ...task,
                distance,
                role: task.role,
              }; // roleはhackathon_listにあると仮定
            })
          );
          console.log("全参加者の位置情報を並行取得し、距離を計算終了");
          // 3. 距離でソート
          participantsWithDistance.sort((a, b) => a.distance - b.distance);
          console.log("距離でソート");

          // 4. 役割を考慮してメンバーを選定
          const selectedMembers: typeof participantsWithDistance = [];
          let backendCount = 0;
          let frontendCount = 0;
          for (const member of participantsWithDistance) {
            if (selectedMembers.length >= targetTeamSize) break;

            if (member.role === "backend" && backendCount < backendNumber) {
              selectedMembers.push(member);
              backendCount++;
            } else if (
              member.role === "frontend" &&
              frontendCount < frontendNumber
            ) {
              selectedMembers.push(member);
              frontendCount++;
            }
          }
          // 役割枠が埋まった後、まだチーム人数に満たない場合、残りの人を距離順に追加
          for (const member of participantsWithDistance) {
            if (selectedMembers.length >= targetTeamSize) break;
            if (!selectedMembers.find((m) => m.id === member.id)) {
              selectedMembers.push(member);
            }
          }

          // 5. 選定されたメンバーのis_joinをtrueに更新
          console.log("選定メンバー更新開始");
          const finalBatch = db.batch();
          selectedMembers.forEach((member) => {
            const docRef = db.collection("hackathon_list").doc(member.id);
            finalBatch.update(docRef, { is_join: true });
          });
          await finalBatch.commit();

          console.log("参加人数超過のため、選定処理を実行しました。");
          return;
        }
      } catch (error) {
        console.error("ドキュメントの取得中にエラーが発生しました:", error);
      }
    } else {
      console.log("No relevant change in is_deadline field.");
      return;
    }
  }
);

export const onNewOrder = onDocumentCreated(
  "hackathon/{orderId}",
  async (event) => {
    const admin = await import("firebase-admin");
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    const db = admin.firestore();
    // 1. 新しく作成されたドキュメントのデータを取得します。
    console.log("hackathon_list作成開始");
    const eventData = event.data;
    if (!eventData) {
      console.log("ドキュメントデータが存在しません。");
      return;
    }
    const data = eventData.data();
    const groupId = data.group_id; // ドキュメントに"userName"フィールドがあると仮定
    const hackathonId = event.params.orderId;
    const ownerId = data.owner;

    try {
      console.log("グループリスト取得開始");
      const tasksCollectionRef = db.collection("group_list");
      const snapshot = await tasksCollectionRef
        .where("group_id", "==", groupId)
        .get();

      console.log("グループリストからデータ取得終了");
      if (snapshot.empty) {
        console.log("Accepted members not found for this hackathon.");
        return;
      }

      console.log("グループリストからデータ配列化完了");

      // 3. バッチ処理を初期化
      const batch = db.batch();

      // 4. 取得した各メンバーをhackathon_listに追加する準備
      snapshot.docs.forEach((memberDoc) => {
        const memberData = memberDoc.data();

        //memberData.user_idがownerだったら、is_invite_acceptをtrueにして登録する
        const newHackathonListDocRef = db.collection("hackathon_list").doc();

        const newEntry = {
          hackathon_id: hackathonId,
          group_id: groupId,
          user_id: memberData.user_id,
          is_invite_accept: false,
          is_join: false,
        };

        // もしメンバーがオーナーであれば、is_invite_acceptをtrueに上書き
        if (memberData.user_id === ownerId) {
          newEntry.is_invite_accept = true;
          console.log(
            `Owner (${ownerId}) is being added with invite accepted.`
          );
        }

        batch.set(newHackathonListDocRef, newEntry);
      });

      // 5. バッチ処理をまとめて実行
      await batch.commit();
    } catch (error) {
      console.error("ドキュメントの取得中にエラーが発生しました:", error);
    }
    // hackathonlist

    return; // 処理を終了
  }
);
