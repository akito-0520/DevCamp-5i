import * as admin from "firebase-admin";
import {FieldPath} from "firebase-admin/firestore";

admin.initializeApp();
const db = admin.firestore();

// 位置情報(例: 1205)を座標(例: {x: 12, y: 5})に変換するヘルパー関数
const parsePosition = (position: {x: number, y: number} | undefined) => {
  if (position && 
    typeof position.x === "number" && 
    typeof position.y === "number") {
    return position;
  }
  return {x: 0, y: 0}; // デフォルトの座標
};

// 2つの座標間のマンハッタン距離を計算するヘルパー関数
const calculateDistance = (pos1: {x: number, y: number}, 
    pos2: {x: number, y: number}) => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

import {onRequest} from "firebase-functions/v2/https";

export const getSpecificData = onRequest({region: "asia-northeast1"}, 
    async (request, response) => {
  // 例: /myDynamicHttpFunction?hackathon_id=products&user_id=sample@sample.com
  const hackathonId = request.query.hackathon_id; // "products" が入る
  const userId = request.query.user_id;
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
      console.log("該当するハッカソンがありません");
      response.status(404).send("該当するハッカソンがありません");
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
          return {id: doc.id, ...doc.data() as HackathonTask};
        });
        console.log("ハッカソンリストからデータ配列化完了");
        // 招待を承認してくれた人数
        const acceptCount = snapshot.size;
        const groupId = completedTasks[0].group_id;

        console.log("ハッカソンからデータ取得開始");
        // 1. 'hackathon'コレクションから該当ドキュメントを検索
        const hackathonCollectionRef = db.collection("hackathon");
        const hackathonSnapshot = await hackathonCollectionRef
          .where(FieldPath.documentId(), "==", hackathonId)
          .get();

        console.log("ハッカソンからデータ取得終了");
        // 2. ドキュメントが存在しない場合のハンドリング
        if (hackathonSnapshot.empty) {
          // hackathon_listには存在するがhackathonには詳細情報がない、というケース
          console.log("該当するハッカソンの詳細情報が見つかりません。");
          response.status(404).send("該当するハッカソンの詳細情報が見つかりません。");
          return;
        }

        // 3. データを取得し、変数に代入 (1つだけヒットする想定)
        const hackathonData = hackathonSnapshot.docs[0].data();

        const teamSize = hackathonData.team_size;
        const teamSizeUpper = hackathonData.team_size_upper;
        const teamSizeLower = hackathonData.team_size_lower;
        const backendNumber = hackathonData.backend_number;
        const frontendNumber = hackathonData.frontend_number;

        const targetTeamSize = teamSizeUpper || teamSize;
        console.log("代入完了");

        if (acceptCount == 0 || 
            (teamSizeLower && teamSizeLower > acceptCount)) {
          // 参加人数が足りないとき
          console.log("参加人数が足りませんでした");
          response.status(200).send("参加人数が足りませんでした");
          return;
        }
        console.log("人数足りないわけではない");
        if (teamSize == acceptCount || 
            (teamSizeUpper && !teamSizeLower && teamSizeUpper >= acceptCount) || 
            (teamSizeLower && !teamSizeUpper && teamSizeLower <= acceptCount) || 
            (teamSizeLower && teamSizeUpper && teamSizeLower <= acceptCount && teamSizeUpper >= acceptCount)) {
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
            batch.update(docRef, {is_join: true});
          });

          // 3. バッチ処理を実行
          await batch.commit();


          console.log("参加人数が適切で本格募集しました");
          response.status(200).send("参加人数が適切で本格募集しました");
          return;
        }
        console.log("参加人数が多い");
        // 参加人数が多い場合
        if (acceptCount > targetTeamSize) {
          // 1. 基準となるユーザーの位置情報を取得
          console.log("グループリストからデータ取得開始");
          const currentUserGroupInfoSnap = await db.collection("group_list")
            .where("group_id", "==", groupId)
            .where("user_id", "==", userId)
            .limit(1).get();
          if (currentUserGroupInfoSnap.empty) {
            response.status(404).send("基準ユーザーの位置情報が見つかりません。");
            return;
          }
          console.log("グループリストからデータ取得終了");
          const currentUserPosition = 
          currentUserGroupInfoSnap.docs[0].data().position;

          const currentUserCoords = parsePosition(currentUserPosition);

          // 2. 全参加者の位置情報を並行取得し、距離を計算
          console.log("全参加者の位置情報を並行取得し、距離を計算");
          const participantsWithDistance = 
          await Promise.all(completedTasks.map(async (task) => {
            const groupInfoSnap = await db.collection("group_list")
              .where("group_id", "==", groupId)
              .where("user_id", "==", task.user_id)
              .limit(1).get();
            const position = groupInfoSnap.empty ? 
            undefined : groupInfoSnap.docs[0].data().position;

            const coords = parsePosition(position);
            const distance = calculateDistance(currentUserCoords, coords);

            return {...task, distance, role: task.role}; // roleはhackathon_listにあると仮定
          }));
          console.log("全参加者の位置情報を並行取得し、距離を計算終了");
          // 3. 距離でソート
          participantsWithDistance.sort((a, b) => a.distance - b.distance);
          console.log("距離でソート");

          // 4. 役割を考慮してメンバーを選定
          const selectedMembers: typeof participantsWithDistance = [];
          let backendCount = 0;
          let frontendCount = 0;
          console.log("fro文開始");
          for (const member of participantsWithDistance) {
            console.log("for繰り返し");
            if (selectedMembers.length >= targetTeamSize) break;

            if (member.role === "backend" && backendCount < backendNumber) {
              selectedMembers.push(member);
              backendCount++;
            } else if (member.role === "frontend" && 
                frontendCount < frontendNumber) {
              selectedMembers.push(member);
              frontendCount++;
            }
          }
          console.log("for文2個目");
          // 役割枠が埋まった後、まだチーム人数に満たない場合、残りの人を距離順に追加
          for (const member of participantsWithDistance) {
            console.log("for文2個目");
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
            finalBatch.update(docRef, {is_join: true});
          });
          await finalBatch.commit();

          console.log("参加人数超過のため、選定処理を実行しました。");
          response.status(200).send("参加人数超過のため、選定処理を実行しました。");
          return;
        }
  } catch (error) {
    console.error("ドキュメントの取得中にエラーが発生しました:", error);
    response.status(500).send("エラーが発生しました。");
  }
});
