# 明治政変史 確認テスト

幕末〜大日本帝国憲法発布までの範囲を扱う確認テストアプリ(React + Vite)。

## ローカルで動かす

```bash
npm install
npm run dev
```

`http://localhost:5173` を開く。

## GitHubにアップロード

このフォルダで:

```bash
git init
git add .
git commit -m "init: 明治政変史確認テスト"
git branch -M main
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git push -u origin main
```

GitHub上に空のリポジトリを先に作成しておくこと(READMEなし推奨)。

## Vercelで公開

1. https://vercel.com にログイン(GitHubアカウントでOK)
2. 「Add New... → Project」から今push したリポジトリを選択
3. Framework Preset は自動で "Vite" が検出される。Build Command: `npm run build`、Output Directory: `dist`(自動検出されるはずなのでそのままでOK)
4. 「Deploy」を押すと数十秒でURLが発行される

以降はmainブランチにpushするたびに自動で再デプロイされる。

## 問題を追加・編集したいとき

`src/quizData.js` の `questions` 配列に追記するだけでよい。
形式は以下の2種類:

```js
{ section: "kenpou", type: "mc", q: "問題文", options: ["A","B","C","D"], answer: 1, explain: "解説" }
{ section: "kenpou", type: "text", q: "問題文", answer: ["正解1","正解2"], explain: "解説" }
```
