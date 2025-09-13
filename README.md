# DevCamp-5i

DevCamp の 5i グループ向けハッカソンチームマッチングシステム

## 概要

このプロジェクトは、DevCamp 参加者がグループを作成・参加し、ハッカソンのチームマッチングを効率的に行うための Web アプリケーションです。ドラッグ&ドロップによる直感的なチーム編成機能を提供します。

## 主な機能

- **ユーザー管理**

  - Firebase Authentication によるユーザー認証
  - ユーザープロフィール（名前、ニックネーム、学校情報、Discord アカウント等）の管理

- **グループ管理**

  - グループの作成・編集
  - グループへの参加（最大 35 名まで）
  - グループ内でのハッカソン開催

- **ハッカソン機能**

  - ハッカソンイベントの作成・管理
  - チーム編成（ドラッグ&ドロップ対応）
  - チーム人数の上限・下限設定
  - フロントエンド/バックエンド人数の指定

- **チームマッチング**
  - ルームグリッド上でのビジュアルなチーム編成
  - メンバーのドラッグ&ドロップによる配置変更
  - リアルタイムでの変更保存

## 技術スタック

### フロントエンド

- **React 19.1.0** - UI ライブラリ
- **React Router 7.7.1** - ルーティング
- **TypeScript 5.8.3** - 型安全性
- **Tailwind CSS 4.1.4** - スタイリング
- **@dnd-kit** - ドラッグ&ドロップ機能
- **Zustand 5.0.8** - 状態管理

### バックエンド

- **Firebase Functions** - サーバーレス関数
- **Firebase Firestore** - NoSQL データベース
- **Firebase Authentication** - 認証

### 開発ツール

- **Vite** - ビルドツール
- **ESLint** - コードリンター
- **Prettier** - コードフォーマッター

## プロジェクト構成

```
DevCamp-5i/
├── frontend/                # フロントエンドアプリケーション
│   ├── app/
│   │   ├── common/         # 共通コンポーネント・サービス
│   │   │   ├── services/   # APIサービス
│   │   │   ├── store/      # 状態管理
│   │   │   └── types/      # 型定義
│   │   ├── components/     # UIコンポーネント
│   │   └── routes/         # ページコンポーネント
│   └── package.json
├── functions/              # Firebase Functions
│   ├── src/
│   └── package.json
└── firebase.json          # Firebase設定
```

## セットアップ

### 前提条件

- Node.js v22 以降
- npm v11 以降
- Firebase プロジェクト

### インストール手順

1. リポジトリのクローン

```bash
git clone https://github.com/akito-0520/DevCamp-5i.git
cd DevCamp-5i
```

2. フロントエンドの依存関係インストール

```bash
cd frontend
npm install
```

3. Firebase Functions の依存関係インストール

```bash
cd ../functions
npm install
```

4. 環境変数の設定
   フロントエンドの Firebase 設定を`frontend/app/firebaseConfig.ts`に追加
   プロジェクト配下の`.env`ファイルに Firebase の環境変数を追加

### 開発サーバーの起動

フロントエンド:

```bash
cd frontend
npm run dev
```

Firebase エミュレータ:

```bash
cd functions
npm run serve
```

## スクリプト

### フロントエンド

- `npm run dev` - 開発サーバー起動（lint & format 実行後）
- `npm run build` - プロダクションビルド
- `npm run lint` - ESLint 実行
- `npm run format` - Prettier 実行
- `npm run typecheck` - TypeScript 型チェック

### Functions

- `npm run serve` - エミュレータ起動
- `npm run deploy` - Functions デプロイ
- `npm run build` - TypeScript ビルド

## 主要なデータモデル

- **User**: ユーザー情報（名前、学校、Discord 等）
- **Group**: グループ情報（名前、紹介文、作成者）
- **GroupMember**: グループメンバーシップ（位置情報含む）
- **Hackathon**: ハッカソンイベント情報
- **Room**: チーム編成用のルーム配置情報
