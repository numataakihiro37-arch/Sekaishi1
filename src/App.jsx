import { useMemo, useState } from "react";
import { questions, sections } from "./quizData.js";

const STAGES = { COVER: "cover", QUIZ: "quiz", RESULT: "result" };

function normalize(str) {
  return str
    .trim()
    .replace(/\s+/g, "")
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .toLowerCase();
}

function sectionMeta(id) {
  return sections.find((s) => s.id === id);
}

export default function App() {
  const [stage, setStage] = useState(STAGES.COVER);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null); // mc: option index, text: string
  const [textValue, setTextValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState([]); // {correct, given}

  const current = questions[qIndex];
  const total = questions.length;
  const meta = sectionMeta(current?.section);

  const score = useMemo(
    () => answers.filter((a) => a.correct).length,
    [answers]
  );

  function startQuiz() {
    setStage(STAGES.QUIZ);
    setQIndex(0);
    setAnswers([]);
    setSelected(null);
    setTextValue("");
    setRevealed(false);
  }

  function chooseOption(idx) {
    if (revealed) return;
    setSelected(idx);
    const correct = idx === current.answer;
    setAnswers((prev) => [
      ...prev,
      { correct, given: current.options[idx], right: current.options[current.answer] },
    ]);
    setRevealed(true);
  }

  function submitText() {
    if (revealed || textValue.trim() === "") return;
    const given = normalize(textValue);
    const correct = current.answer.some((a) => normalize(a) === given);
    setAnswers((prev) => [
      ...prev,
      { correct, given: textValue.trim(), right: current.answer[0] },
    ]);
    setRevealed(true);
  }

  function next() {
    if (qIndex + 1 >= total) {
      setStage(STAGES.RESULT);
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setTextValue("");
    setRevealed(false);
  }

  const sectionScores = sections.map((s) => {
    const idxs = questions
      .map((q, i) => (q.section === s.id ? i : -1))
      .filter((i) => i >= 0);
    const got = idxs.filter((i) => answers[i]?.correct).length;
    return { ...s, got, of: idxs.length };
  });

  return (
    <div className="page">
      <div className="doc-header">
        <span className="no">確認テスト・No. 05</span>
        <span className="brand">日本史 近代史ノート</span>
      </div>

      <div className="shell">
        {stage === STAGES.COVER && <Cover onStart={startQuiz} />}

        {stage === STAGES.QUIZ && current && (
          <QuizCard
            q={current}
            meta={meta}
            index={qIndex}
            total={total}
            selected={selected}
            revealed={revealed}
            textValue={textValue}
            setTextValue={setTextValue}
            chooseOption={chooseOption}
            submitText={submitText}
            onNext={next}
            lastAnswer={answers[answers.length - 1]}
          />
        )}

        {stage === STAGES.RESULT && (
          <Result
            score={score}
            total={total}
            sectionScores={sectionScores}
            answers={answers}
            onRetry={startQuiz}
          />
        )}
      </div>

      <p className="foot-note">明治維新〜大日本帝国憲法発布 / 全{total}問</p>
    </div>
  );
}

function Cover({ onStart }) {
  return (
    <div className="cover">
      <p className="cover-eyebrow">教科書 P48〜53 準拠</p>
      <h1>明治政変史
        <br />
        確認テスト
      </h1>
      <p className="sub">幕末の動乱から大日本帝国憲法発布まで、全{questions.length}問</p>

      <div className="toc">
        {sections.map((s) => (
          <div className="toc-row" key={s.id}>
            <span className="label">{s.label}</span>
            <span className="title">{s.title}</span>
            <span className="range">{s.range}</span>
          </div>
        ))}
      </div>

      <button className="start-btn" onClick={onStart}>
        テストを始める →
      </button>
      <p className="meta-line">一問ずつ回答し、その場で正誤と解説が表示されます。</p>
    </div>
  );
}

function QuizCard({
  q,
  meta,
  index,
  total,
  selected,
  revealed,
  textValue,
  setTextValue,
  chooseOption,
  submitText,
  onNext,
  lastAnswer,
}) {
  return (
    <div>
      <div className="progress-rail">
        {Array.from({ length: total }).map((_, i) => (
          <div className="progress-seg" key={i}>
            <span
              style={{
                transform: i <= index ? "scaleX(1)" : "scaleX(0)",
              }}
            />
          </div>
        ))}
      </div>

      <div className="section-tag">
        <span>
          {meta.label}・{meta.title}
        </span>
        <span className="count">
          問 {index + 1} / {total}
        </span>
      </div>

      <div className="q-card">
        <p className="q-text">{q.q}</p>

        {q.type === "mc" && (
          <div className="options">
            {q.options.map((opt, i) => {
              let cls = "opt-btn";
              if (revealed && i === q.answer) cls += " correct";
              else if (revealed && i === selected) cls += " wrong";
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={revealed}
                  onClick={() => chooseOption(i)}
                >
                  <span className="tag">{"ABCD"[i]}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {q.type === "text" && (
          <div className="text-input-row">
            <input
              type="text"
              placeholder="答えを入力"
              value={textValue}
              disabled={revealed}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitText()}
            />
            <button
              className="submit-btn"
              disabled={revealed || textValue.trim() === ""}
              onClick={submitText}
            >
              回答する
            </button>
          </div>
        )}

        {revealed && (
          <>
            <div className="feedback">
              <div className={"stamp" + (lastAnswer.correct ? "" : " miss")}>
                {lastAnswer.correct ? "正解" : "不正解"}
              </div>
              <p className="explain">
                {!lastAnswer.correct && (
                  <>
                    正解: <strong>{lastAnswer.right}</strong>
                    <br />
                  </>
                )}
                {q.explain}
              </p>
            </div>
            <div className="next-row">
              <button className="next-btn" onClick={onNext}>
                {index + 1 >= total ? "結果を見る →" : "次の問題 →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Result({ score, total, sectionScores, answers, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const msg =
    pct >= 90
      ? "見事、免許皆伝。"
      : pct >= 70
      ? "よく身についています。"
      : pct >= 50
      ? "もう一息、復習を。"
      : "基本から見直しましょう。";

  const wrong = questions
    .map((q, i) => ({ q, a: answers[i], i }))
    .filter((x) => x.a && !x.a.correct);

  return (
    <div className="result-card">
      <div className="big-stamp">
        <span className="score">{score}</span>
        <span className="of">／ {total}問</span>
      </div>
      <p className="result-msg">{msg}</p>
      <p className="result-sub">正答率 {pct}%</p>

      <div className="section-scores">
        {sectionScores.map((s) => (
          <div className="sec-score-row" key={s.id}>
            <span className="name">
              {s.label}・{s.title}
            </span>
            <span className="bar">
              <span style={{ width: `${(s.got / s.of) * 100}%` }} />
            </span>
            <span className="val">
              {s.got}/{s.of}
            </span>
          </div>
        ))}
      </div>

      {wrong.length > 0 && (
        <div className="review-list">
          {wrong.map(({ q, a, i }) => (
            <div className="review-item" key={i}>
              <div className="q">
                {i + 1}. {q.q}
              </div>
              <div className="your">あなたの回答: {a.given}</div>
              <div className="right">正解: {a.right}</div>
            </div>
          ))}
        </div>
      )}

      <button className="retry-btn" onClick={onRetry}>
        もう一度挑戦する
      </button>
    </div>
  );
}
