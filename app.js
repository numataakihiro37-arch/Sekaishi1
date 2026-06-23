/* ===================================================================
   市民革命 演習所 — アプリケーションロジック
=================================================================== */

(() => {
  "use strict";

  // ---- 状態管理 -------------------------------------------------

  let queue = [];          // 出題順の配列（QUESTIONSのインデックス）
  let currentIndex = 0;    // queue内の現在位置
  let correctCount = 0;
  let wrongCount = 0;
  let answered = false;    // 現在の問題に解答済みか
  let wrongIndices = [];   // 今回のセッションで間違えた QUESTIONS のインデックス
  let resultLog = [];      // 結果画面表示用 {qIndex, correct}

  // ---- DOM参照 ---------------------------------------------------

  const chamberEl = document.getElementById("chamber");
  const resultsEl = document.getElementById("results");

  const articleNumberEl = document.getElementById("article-number");
  const questionTextEl = document.getElementById("question-text");
  const answerFormEl = document.getElementById("answer-form");
  const answerInputEl = document.getElementById("answer-input");
  const submitBtn = document.getElementById("submit-btn");

  const verdictEl = document.getElementById("verdict");
  const stampEl = document.getElementById("stamp");
  const correctAnswerTextEl = document.getElementById("correct-answer-text");
  const nextBtn = document.getElementById("next-btn");

  const tallyCorrectEl = document.getElementById("tally-correct");
  const tallyWrongEl = document.getElementById("tally-wrong");
  const tallyProgressEl = document.getElementById("tally-progress");

  const resultsScoreEl = document.getElementById("results-score");
  const resultsListEl = document.getElementById("results-list");
  const retryAllBtn = document.getElementById("retry-all-btn");
  const retryWrongBtn = document.getElementById("retry-wrong-btn");

  // ---- ユーティリティ ---------------------------------------------

  function normalize(str) {
    return String(str)
      .trim()
      .replace(/[\s　]/g, "")        // 全角・半角スペースを除去
      .replace(/[（）()「」『』]/g, "") // 括弧類を除去
      .replace(/・/g, "");            // 中点を除去
  }

  function isCorrectAnswer(userInput, question) {
    const normalizedInput = normalize(userInput);
    if (!normalizedInput) return false;
    return question.answers.some(
      (ans) => normalize(ans) === normalizedInput
    );
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function toKanjiTally(count, type) {
    // 正の字（タリーマーク）の代わりに | を並べて議会の採決票数を表現
    return "｜".repeat(count);
  }

  // ---- 初期化 -----------------------------------------------------

  function startSession(indices) {
    queue = indices;
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    wrongIndices = [];
    resultLog = [];

    resultsEl.hidden = true;
    chamberEl.hidden = false;

    renderTally();
    renderQuestion();
  }

  function init() {
    const allIndices = QUESTIONS.map((_, i) => i);
    startSession(shuffle(allIndices));
  }

  // ---- 出題 -------------------------------------------------------

  function renderQuestion() {
    answered = false;
    answerInputEl.value = "";
    answerInputEl.disabled = false;
    submitBtn.disabled = false;

    verdictEl.classList.remove("is-visible");
    stampEl.classList.remove("animate", "is-correct", "is-wrong");
    stampEl.textContent = "";

    const qIndex = queue[currentIndex];
    const q = QUESTIONS[qIndex];

    articleNumberEl.textContent = `第${toFullWidthNumberLabel(currentIndex + 1)}条`;
    questionTextEl.textContent = `…${q.q}`;

    tallyProgressEl.textContent = `第 ${currentIndex + 1} 条 / 全 ${queue.length} 条`;

    answerInputEl.focus();
  }

  function toFullWidthNumberLabel(n) {
    // シンプルにアラビア数字のままでも良いが、条文らしさのため漢数字は使わず番号のみ
    return String(n);
  }

  // ---- 採点 -------------------------------------------------------

  function submitAnswer(e) {
    e.preventDefault();
    if (answered) return;

    const qIndex = queue[currentIndex];
    const q = QUESTIONS[qIndex];
    const userInput = answerInputEl.value;
    const correct = isCorrectAnswer(userInput, q);

    answered = true;
    answerInputEl.disabled = true;
    submitBtn.disabled = true;

    if (correct) {
      correctCount++;
    } else {
      wrongCount++;
      wrongIndices.push(qIndex);
    }
    resultLog.push({ qIndex, correct, userInput });

    showVerdict(correct, q);
    renderTally();
  }

  function showVerdict(correct, question) {
    verdictEl.classList.add("is-visible");
    stampEl.textContent = correct ? "正解" : "不正解";
    stampEl.classList.add(correct ? "is-correct" : "is-wrong");

    // animate クラスを次フレームで付与し直してアニメーションを確実に発火させる
    requestAnimationFrame(() => {
      stampEl.classList.add("animate");
    });

    if (correct) {
      correctAnswerTextEl.textContent = "";
    } else {
      correctAnswerTextEl.innerHTML = `<span class="label">正答：</span>${question.answers[0]}`;
    }

    nextBtn.textContent =
      currentIndex + 1 < queue.length ? "次の条文へ →" : "決議結果を見る →";
  }

  function renderTally() {
    tallyCorrectEl.innerHTML = `<span class="tally__marks--correct-color">${toKanjiTally(correctCount)}</span>`;
    tallyWrongEl.innerHTML = `<span class="tally__marks--wrong-color">${toKanjiTally(wrongCount)}</span>`;
  }

  // ---- 次へ進む / 結果表示 -----------------------------------------

  function goNext() {
    if (currentIndex + 1 < queue.length) {
      currentIndex++;
      renderQuestion();
    } else {
      showResults();
    }
  }

  function showResults() {
    chamberEl.hidden = true;
    resultsEl.hidden = false;

    const total = queue.length;
    resultsScoreEl.textContent = `${correctCount} / ${total} 問　正解`;

    resultsListEl.innerHTML = "";
    resultLog.forEach((entry) => {
      const q = QUESTIONS[entry.qIndex];
      const div = document.createElement("div");
      div.className = `result-item ${entry.correct ? "result-item--correct" : "result-item--wrong"}`;
      div.innerHTML = `
        <p class="result-item__q">…${q.q}</p>
        <p class="result-item__a">${entry.correct ? "✓ 正解" : `✗ ${entry.userInput || "（無回答）"} → 正答：${q.answers[0]}`}</p>
      `;
      resultsListEl.appendChild(div);
    });

    retryWrongBtn.disabled = wrongIndices.length === 0;
    retryWrongBtn.style.opacity = wrongIndices.length === 0 ? "0.4" : "1";
  }

  // ---- イベント登録 -----------------------------------------------

  answerFormEl.addEventListener("submit", submitAnswer);
  nextBtn.addEventListener("click", goNext);

  retryAllBtn.addEventListener("click", () => {
    startSession(shuffle(QUESTIONS.map((_, i) => i)));
  });

  retryWrongBtn.addEventListener("click", () => {
    if (wrongIndices.length === 0) return;
    startSession(shuffle(wrongIndices.slice()));
  });

  // Enterキーで「次へ」を即時実行できるようにする（解答済み状態のとき）
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && answered && !verdictEl.hidden && verdictEl.classList.contains("is-visible")) {
      // フォーム送信と重複しないよう、フォーカスが入力欄にない場合のみ
      if (document.activeElement !== answerInputEl) {
        goNext();
      }
    }
  });

  // ---- 起動 -------------------------------------------------------

  init();
})();
