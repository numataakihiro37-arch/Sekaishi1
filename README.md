# 市民革命 演習所

世界史「市民革命」（フランス革命・アメリカ独立革命・南北戦争）の一問一答演習サイトです。
ビルド不要の静的サイトなので、GitHub Pagesでそのまま公開できます。

## 構成

```
quiz-site/
├── index.html        画面構造
├── css/
│   └── style.css      デザイン
├── js/
│   ├── questions.js   問題データ（ここを書き換えれば別範囲の問題にも流用可）
│   └── app.js          出題・採点ロジック
└── README.md
```

## GitHub Pagesで公開する手順

1. GitHubで新しいリポジトリを作成する（例：`civil-revolutions-quiz`）。
2. このフォルダの中身（`index.html` / `css/` / `js/`）をリポジトリのルートに置いてpushする。

   ```bash
   git init
   git add .
   git commit -m "市民革命 演習サイト 初回コミット"
   git branch -M main
   git remote add origin https://github.com/【ユーザー名】/civil-revolutions-quiz.git
   git push -u origin main
   ```

3. GitHubのリポジトリページで **Settings → Pages** を開く。
4. 「Build and deployment」の **Source** を `Deploy from a branch` に設定。
5. **Branch** を `main` / `/(root)` にして **Save**。
6. 数十秒〜数分後、`https://【ユーザー名】.github.io/civil-revolutions-quiz/` で公開される。

## 動作の仕組み

- 出題はランダムな順番（毎回シャッフル）。
- 解答を入力して「回答する」を押すと、正解／不正解がスタンプ表示される。
- 得点は画面上部に「賛成（正解）／反対（不正解）」の採決票として表示される。
- 全問終了後、「決議結果」画面で得点と間違えた問題の一覧が見られる。
- 「不正解のみ再挑戦」で、間違えた問題だけをもう一周できる。

## 問題を入れ替えたい場合

`js/questions.js` の `QUESTIONS` 配列を編集する。1問は以下の形式。

```js
{
  q: "問題文",
  answers: ["正答1", "正答1の別表記", "..."]
}
```

`answers` は配列なので、表記ゆれ（送り仮名・カタカナ表記の違いなど）はすべて並べて入れておくと、
それらのどれを入力しても正解と判定される。
