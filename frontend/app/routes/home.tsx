import type { Route } from "./+types/home";
import { RoomGrid } from "../components/RoomGrid";
import { useRoomStore } from "../store/useRoomStore";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "高専ハッカソンマッチング" },
    {
      name: "description",
      content: "高専生のためのハッカソンチーム編成プラットフォーム",
    },
  ];
}

export default function Home() {
  const { addUser, setCurrentUser, moveUserToRoom } = useRoomStore();

  useEffect(() => {
    // テスト用のユーザーデータを追加
    const testUsers = [
      {
        id: "user1",
        name: "田中太郎",
        discordId: "123456789",
        skills: ["React", "TypeScript", "Node.js"],
        school: "東京高専",
        grade: 3,
        email: "tanaka@example.com",
        isSkillsPublic: true,
      },
      {
        id: "user2",
        name: "佐藤花子",
        discordId: "987654321",
        skills: ["Python", "機械学習", "TensorFlow"],
        school: "大阪高専",
        grade: 4,
        email: "sato@example.com",
        isSkillsPublic: true,
      },
      {
        id: "user3",
        name: "鈴木次郎",
        discordId: "456789123",
        skills: ["Unity", "C#", "Blender"],
        school: "名古屋高専",
        grade: 2,
        email: "suzuki@example.com",
        isSkillsPublic: false,
      },
    ];

    testUsers.forEach((user) => addUser(user));

    // 現在のユーザーを設定
    setCurrentUser("user1");

    // ユーザーを部屋に配置
    setTimeout(() => {
      moveUserToRoom("user1", 12);
      moveUserToRoom("user2", 13);
      moveUserToRoom("user3", 22);
    }, 100);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <RoomGrid />
    </div>
  );
}
