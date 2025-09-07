# 高専ハッカソンマッチングシステム

高専生向けのハッカソンチーム編成プラットフォームです。ルームベースのビジュアルインターフェースで、ハッカソンのチーム編成を自動化します。

## 機能

- 📍 ルームベースのビジュアルインターフェース
- 👥 ユーザープロファイル管理（Discord連携、スキル、学年、学校）
- 🎯 自動チーム編成（隣接する部屋でチーム形成）
- 🎨 チームの視覚的表示（色分け）
- 🔍 スキル・学年によるフィルタリング
- 🚀 リアルタイムな部屋移動

## 技術スタック

- React 19 + React Router 7
- TypeScript
- TailwindCSS 4
- Zustand（状態管理）
- React DnD（ドラッグ&ドロップ予定）

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
