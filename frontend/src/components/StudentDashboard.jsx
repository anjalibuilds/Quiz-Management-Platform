import { useEffect, useState } from "react";
import { API } from "../App";
import QuizDiscovery from "./QuizDiscovery";
function StudentDashboard({ token, onLogout }) {

  const headers = {
    Authorization: `Bearer ${token}`,
  };


  // -----------------------------
  // STATE
  // -----------------------------

  const [quizzes, setQuizzes] = useState([]);

  const [quiz, setQuiz] = useState(null);

  const [attempt, setAttempt] = useState(null);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState({});

  const [timeLeft, setTimeLeft] = useState(0);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [result, setResult] = useState(null);
const [review, setReview] = useState(null);
const [attemptHistory, setAttemptHistory] = useState([]);
const [historyDetail, setHistoryDetail] = useState(null);
const [statistics, setStatistics] = useState(null);
const [leaderboard, setLeaderboard] = useState(null);
const [leaderboardCategories, setLeaderboardCategories] = useState([]);
const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState("");
  

  // -----------------------------
  // LOAD AVAILABLE QUIZZES
  // -----------------------------

  useEffect(() => {
    loadQuizzes();
  }, []);


  const loadQuizzes = async () => {

    try {

      const response = await fetch(
        `${API}/api/quizzes/student`,
        {
          headers,
        }
      );


      // Token expired / invalid

      if (response.status === 401) {
        onLogout();
        return;
      }


      if (!response.ok) {

        setError(
          "Unable to load quizzes."
        );

        return;
      }


      const data =
        await response.json();

      setQuizzes(data);

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the server."
      );
    }
  };


  // -----------------------------
  // START QUIZ
  // -----------------------------

  const startQuiz = async (quizId) => {

    setLoading(true);
    setError("");


    try {

      // Start attempt

      const startResponse =
        await fetch(
          `${API}/api/quizzes/student/${quizId}/start`,
          {
            method: "POST",
            headers,
          }
        );


      const attemptData =
        await startResponse.json();


      if (!startResponse.ok) {

        setError(
          attemptData.message ||
          "Unable to start quiz."
        );

        return;
      }


      // Load quiz questions

      const quizResponse =
        await fetch(
          `${API}/api/quizzes/student/${quizId}`,
          {
            headers,
          }
        );


      if (!quizResponse.ok) {

        setError(
          "Unable to load quiz questions."
        );

        return;
      }


      const quizData =
        await quizResponse.json();


      // Store quiz information

      setQuiz(quizData);

      setAttempt(attemptData);

      setTimeLeft(
        attemptData.remaining_seconds
      );

      setCurrentQuestion(0);

      setAnswers({});

      setResult(null);

    } catch (error) {

      console.error(error);

      setError(
        "Something went wrong while starting the quiz."
      );

    } finally {

      setLoading(false);
    }
  };


  // -----------------------------
  // SELECT OPTION
  // -----------------------------

  const selectAnswer = (
    questionId,
    optionId
  ) => {

    setAnswers((previous) => ({

      ...previous,

      [questionId]: optionId,

    }));
  };


  // -----------------------------
  // SUBMIT QUIZ
  // -----------------------------

  const submitQuiz = async (
    autoSubmit = false
  ) => {

    if (
      !quiz ||
      !attempt ||
      submitting
    ) {
      return;
    }


    // Confirmation for manual submit

    if (!autoSubmit) {

      const confirmed =
        window.confirm(
          "Are you sure you want to submit the quiz?"
        );


      if (!confirmed) {
        return;
      }
    }


    setSubmitting(true);


    // Convert answers object
    // into backend format

    const submittedAnswers =
      Object.entries(answers).map(
        ([questionId, optionId]) => ({

          question_id:
            Number(questionId),

          selected_option_id:
            Number(optionId),

        })
      );


    try {

      const response =
        await fetch(
          `${API}/api/quizzes/${quiz.id}/submit`,
          {

            method: "POST",

            headers: {

              ...headers,

              "Content-Type":
                "application/json",

            },

            body: JSON.stringify({

              answers:
                submittedAnswers,

            }),

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.message ||
          "Unable to submit quiz."
        );

        return;
      }


      // Show result

      setResult(data);


      // Leave quiz screen

      setQuiz(null);

      setAttempt(null);

      setTimeLeft(0);

    } catch (error) {

      console.error(error);

      setError(
        "Something went wrong while submitting the quiz."
      );

    } finally {

      setSubmitting(false);
    }
  };
// -----------------------------
// LOAD ANSWER REVIEW
// -----------------------------

const loadReview = async () => {
  if (!result) {
    return;
  }

  try {
    setError("");

    const response = await fetch(
      `${API}/api/quizzes/${result.quiz_id}/attempt/${result.attempt_id}/review`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.message || "Unable to load answer review."
      );
      return;
    }

    setReview(data);

  } catch (error) {
    console.error(error);

    setError(
      "Something went wrong while loading answer review."
    );
  }
};

const loadAttemptHistory = async () => {

  try {

    setError("");

    const response = await fetch(
      `${API}/api/quizzes/student/attempts`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.message ||
        "Unable to load attempt history."
      );
      return;
    }

    setAttemptHistory(data);

  } catch (error) {

    console.error(error);

    setError(
      "Something went wrong while loading attempt history."
    );
  }
};
const openAttemptDetails = async (item) => {
  try {
    setError("");

    const response = await fetch(
      `${API}/api/quizzes/${item.quiz_id}/attempt/${item.attempt_id}/review`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load attempt details."
      );
    }

    setHistoryDetail({
      ...item,
      review: data,
    });

  } catch (error) {
    console.error("Attempt details error:", error);
    setError(
      error.message || "Unable to load attempt details."
    );
  }
};
  // -----------------------------
  // TIMER
  // -----------------------------

  useEffect(() => {

    if (
      !quiz ||
      !attempt ||
      timeLeft <= 0 ||
      submitting
    ) {
      return;
    }


    const timer =
      setInterval(() => {

        setTimeLeft((previous) => {

          if (previous <= 1) {

            clearInterval(timer);

            submitQuiz(true);

            return 0;
          }

          return previous - 1;

        });

      }, 1000);


    return () =>
      clearInterval(timer);

  }, [
    quiz,
    attempt,
    timeLeft,
    submitting,
  ]);


  // -----------------------------
  // FORMAT TIMER
  // -----------------------------

  const formatTime = (seconds) => {

    const minutes =
      Math.floor(seconds / 60);

    const remaining =
      seconds % 60;


    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remaining).padStart(
      2,
      "0"
    )}`;
  };


  // =====================================================
  // RESULT SCREEN
  // =====================================================

  if (result && !review) {

    return (

      <div className="student-page">


        {/* TOP BAR */}

        <header className="student-topbar">

          <div className="student-brand">

            <div className="brand-mark small">
              Q
            </div>

            <div>

              <strong>
                Quiz Platform
              </strong>

              <span>
                Student Dashboard
              </span>

            </div>

          </div>


          <button
            className="logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>

        </header>



        {/* RESULT */}

        <main className="student-content">

          <div className="result-card">


            <div
              className={`result-icon ${
                result.status === "PASSED"
                  ? "success"
                  : "failed"
              }`}
            >

              {result.status === "PASSED"
                ? "✓"
                : "!"}

            </div>


            <p className="eyebrow">
              QUIZ COMPLETED
            </p>


            <h1>
              Quiz Result
            </h1>


            <div className="result-score">

              {result.percentage}%

            </div>


            <h2
              className={
                result.status === "PASSED"
                  ? "result-passed"
                  : "result-failed"
              }
            >

              {result.status}

            </h2>



            {/* RESULT DETAILS */}

            <div className="result-grid">


              <ResultItem
                label="Score"
                value={`${result.score} / ${result.total_marks}`}
              />


              <ResultItem
                label="Correct"
                value={
                  result.correct_answers
                }
              />


              <ResultItem
                label="Incorrect"
                value={
                  result.incorrect_answers
                }
              />


              <ResultItem
                label="Unanswered"
                value={
                  result.unanswered
                }
              />


              <ResultItem
                label="Time Taken"
                value={`${result.time_taken}s`}
              />

            </div>



            <div className="result-actions">

  <button
    className="primary-btn"
    onClick={loadReview}
  >
    Review Answers
  </button>

  <button
    className="secondary-btn"
    onClick={() => {
      setResult(null);
      setReview(null);
      loadQuizzes();
    }}
  >
    Back to Quizzes
  </button>

</div>

          </div>

        </main>

      </div>

    );
  }

// =====================================================
// ANSWER REVIEW SCREEN
// =====================================================

if (review) {

  const reviewAnswers =
    review.answers ||
    review.questions ||
    [];

  return (
    <div className="student-page">

      <div className="student-content">

        <div className="page-heading">

          <span className="eyebrow">
            REVIEW
          </span>

          <h1>
            Answer Review
          </h1>

          <p>
            Review your answers and see which ones were correct.
          </p>

        </div>
<div className="review-list">

  {reviewAnswers.map((item, index) => {

    const options = item.options || [];

    const selectedOption = options.find(
      (option) =>
        option.id === item.selected_option_id
    );

    const correctOption = options.find(
      (option) =>
        option.id === item.correct_option_id
    );

    return (
      <div
        className="review-card"
        key={
          item.question_id ||
          item.id ||
          index
        }
      >

        <div className="review-question-header">

          <span>
            Question {index + 1}
          </span>

          <span
            className={
              item.is_correct
                ? "review-correct"
                : "review-incorrect"
            }
          >
            {item.is_correct
              ? "Correct"
              : "Incorrect"}
          </span>

        </div>


        <h3>
          {item.question ||
            item.question_text ||
            item.text}
        </h3>


        <div className="review-answer-section">

  <p>
    <strong>
      Your Answer:
    </strong>{" "}

    {selectedOption
      ? selectedOption.option_text
      : "Not answered"}
  </p>


  {!item.is_correct && (

    <p>
      <strong>
        Correct Answer:
      </strong>{" "}

      {correctOption
        ? correctOption.option_text
        : "Not available"}
    </p>

  )}


  {item.explanation && (

    <div className="review-explanation">

      <strong>
        Explanation:
      </strong>

      <p>
        {item.explanation}
      </p>

    </div>

  )}

</div>

      </div>
    );
  })}

</div>


        <div className="review-actions">

          <button
            className="secondary-btn"
            onClick={() => {
              setReview(null);
            }}
          >
            Back to Result
          </button>


          <button
            className="primary-btn"
            onClick={() => {
              setReview(null);
              setResult(null);
              setQuiz(null);
            }}
          >
            Back to Quizzes
          </button>

        </div>

      </div>

    </div>
  );
}
// =====================================================
// ATTEMPT HISTORY SCREEN
// =====================================================

if (attemptHistory.length > 0 && !historyDetail) {

  return (
    <div className="student-page">

      <header className="student-topbar">

        <div className="student-brand">

          <div className="brand-mark small">
            Q
          </div>

          <div>
            <strong>
              Quiz Platform
            </strong>

            <span>
              Student Dashboard
            </span>
          </div>

        </div>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>

      </header>


      <main className="student-content">

        <div className="student-heading">

          <div>

            <p className="eyebrow">
              HISTORY
            </p>

            <h1>
              Attempt History
            </h1>

            <p>
              View your previous quiz attempts.
            </p>

          </div>

        </div>


        <div className="history-list">

          {attemptHistory.map((item) => (

            <button
              key={item.attempt_id}
              className="history-card"
              onClick={() => openAttemptDetails(item)}
              type="button"
            >

              <div>

                <h2>
                  {item.quiz_title}
                </h2>

                <p>
                  {item.completed_at
                    ? new Date(
                        item.completed_at
                      ).toLocaleString()
                    : "Not completed"}
                </p>

              </div>


              <div className="history-score">

                <strong>
                  {item.percentage}%
                </strong>

                <span
                  className={
                    item.status === "PASSED"
                      ? "review-correct"
                      : "review-incorrect"
                  }
                >
                  {item.status}
                </span>

              </div>

            </button>

          ))}

        </div>


        <button
          className="secondary-btn"
          onClick={() => {
            setAttemptHistory([]);
            loadQuizzes();
          }}
        >
          Back to Quizzes
        </button>

      </main>

    </div>
  );
}
if (historyDetail) {

  const reviewAnswers =
    historyDetail.review?.answers ||
    historyDetail.review?.questions ||
    [];

  return (
    <div className="student-page">

      <header className="student-topbar">

        <div className="student-brand">

          <div className="brand-mark small">
            Q
          </div>

          <div>
            <strong>
              Quiz Platform
            </strong>

            <span>
              Student Dashboard
            </span>
          </div>

        </div>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>

      </header>


      <main className="student-content">

        <div className="student-heading">

          <div>

            <p className="eyebrow">
              ATTEMPT DETAILS
            </p>

            <h1>
              {historyDetail.quiz_title}
            </h1>

            <p>
              {historyDetail.completed_at
                ? new Date(
                    historyDetail.completed_at
                  ).toLocaleString()
                : "Not completed"}
            </p>

          </div>

        </div>


        <div className="result-grid">

          <ResultItem
            label="Score"
            value={`${historyDetail.percentage}%`}
          />

          <ResultItem
            label="Correct"
            value={
              historyDetail.review?.correct_answers ??
              historyDetail.correct_answers ??
              0
            }
          />

          <ResultItem
            label="Incorrect"
            value={
              historyDetail.review?.incorrect_answers ??
              historyDetail.incorrect_answers ??
              0
            }
          />

          <ResultItem
            label="Status"
            value={historyDetail.status}
          />

        </div>


        <div className="page-heading">

          <span className="eyebrow">
            ANSWERS
          </span>

          <h2>
            Answer Review
          </h2>

        </div>


        <div className="review-list">

          {reviewAnswers.length === 0 ? (

            <div className="empty-panel">

              <h3>
                No answer details available
              </h3>

            </div>

          ) : (

            reviewAnswers.map((item, index) => {

              const options =
                item.options || [];

              const selectedOption =
                options.find(
                  (option) =>
                    option.id ===
                    item.selected_option_id
                );

              const correctOption =
                options.find(
                  (option) =>
                    option.id ===
                    item.correct_option_id
                );

              return (

                <div
                  className="review-card"
                  key={
                    item.question_id ||
                    item.id ||
                    index
                  }
                >

                  <div className="review-question-header">

                    <span>
                      Question {index + 1}
                    </span>

                    <span
                      className={
                        item.is_correct
                          ? "review-correct"
                          : "review-incorrect"
                      }
                    >
                      {item.is_correct
                        ? "Correct"
                        : "Incorrect"}
                    </span>

                  </div>


                  <h3>
                    {item.question ||
                      item.question_text ||
                      item.text}
                  </h3>


                  <div className="review-answer-section">

                    <p>
                      <strong>
                        Your Answer:
                      </strong>{" "}

                      {selectedOption
                        ? selectedOption.option_text
                        : "Not answered"}
                    </p>


                    {!item.is_correct && (

                      <p>
                        <strong>
                          Correct Answer:
                        </strong>{" "}

                        {correctOption
                          ? correctOption.option_text
                          : "Not available"}
                      </p>

                    )}


                    {item.explanation && (

                      <div className="review-explanation">

                        <strong>
                          Explanation:
                        </strong>

                        <p>
                          {item.explanation}
                        </p>

                      </div>

                    )}

                  </div>

                </div>

              );

            })

          )}

        </div>


        <button
          className="secondary-btn"
          onClick={() => {
            setHistoryDetail(null);
            setError("");
          }}
        >
          ← Back to Attempt History
        </button>

      </main>

    </div>
  );
}
const loadStatistics = async () => {

  try {

    setError("");

    const response = await fetch(
      `${API}/api/quizzes/student/statistics`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.message ||
        "Unable to load statistics."
      );
      return;
    }

    setStatistics(data);

  } catch (error) {

    console.error(error);

    setError(
      "Something went wrong while loading statistics."
    );
  }
};
const loadLeaderboard = async () => {

  try {

    setError("");

    const response = await fetch(
      `${API}/api/leaderboard/overall`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.message ||
        "Unable to load leaderboard."
      );
      return;
    }

    setLeaderboard(data);

  } catch (error) {

    console.error(error);

    setError(
      "Something went wrong while loading leaderboard."
    );

  }
};


const loadCategoryLeaderboard = async (categoryId) => {

  try {

    setError("");

    const response = await fetch(
      `${API}/api/leaderboard/category/${categoryId}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.message ||
        "Unable to load category leaderboard."
      );
      return;
    }

    setLeaderboard(data);

  } catch (error) {

    console.error(error);

    setError(
      "Something went wrong while loading category leaderboard."
    );

  }
};
// =====================================================
// LEADERBOARD SCREEN
// =====================================================

if (leaderboard) {

  return (
    <div className="student-page">

      <header className="student-topbar">

        <div className="student-brand">

          <div className="brand-mark small">
            Q
          </div>

          <div>
            <strong>
              Quiz Platform
            </strong>

            <span>
              Student Dashboard
            </span>
          </div>

        </div>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>

      </header>


      <main className="student-content">

        <div className="student-heading">

          <div>

            <p className="eyebrow">
              RANKINGS
            </p>

            <h1>
              Leaderboard
            </h1>

            <p>
              See how you rank against other students.
            </p>

          </div>

        </div>


        <div className="leaderboard-card">

          <div className="leaderboard-header">
            <span>Rank</span>
            <span>Student</span>
            <span>Attempts</span>
            <span>Average Score</span>
            <span>Highest Score</span>
          </div>
          <div className="leaderboard-filter">

  <select
    value={selectedCategory}
    onChange={(e) => {
      const categoryId = e.target.value;

      setSelectedCategory(categoryId);

      if (categoryId) {
        loadCategoryLeaderboard(categoryId);
      } else {
        loadLeaderboard();
      }
    }}
  >
    <option value="">
      Overall Leaderboard
    </option>

    {leaderboardCategories.map((category) => (
      <option
        key={category.id}
        value={category.id}
      >
        {category.name}
      </option>
    ))}

  </select>

</div>
          {leaderboard.length > 0 ? (

            leaderboard.map((student) => (

              <div
                className="leaderboard-row"
                key={student.user_id}
              >

                <strong>
                  #{student.rank}
                </strong>

                <span>
                  {student.name}
                </span>

                <span>
                  {student.attempts}
                </span>

                <span>
                  {student.average_score}%
                </span>

                <span>
                  {student.highest_score}%
                </span>

              </div>

            ))

          ) : (

            <div className="empty-panel">

              <h2>
                No leaderboard data
              </h2>

              <p>
                Complete a quiz to appear on the leaderboard.
              </p>

            </div>

          )}

        </div>


        <button
          className="secondary-btn"
          onClick={() => {
            setLeaderboard(null);
            loadQuizzes();
          }}
        >
          Back to Quizzes
        </button>

      </main>

    </div>
  );
}
const loadLeaderboardCategories = async () => {

  try {

    const response = await fetch(
      `${API}/api/leaderboard/categories`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (response.ok) {
      setLeaderboardCategories(data);
    }

  } catch (error) {

    console.error(error);

  }
};
// =====================================================
// STATISTICS SCREEN
// =====================================================

if (statistics) {

  return (
    <div className="student-page">

      <header className="student-topbar">

        <div className="student-brand">

          <div className="brand-mark small">
            Q
          </div>

          <div>
            <strong>
              Quiz Platform
            </strong>

            <span>
              Student Dashboard
            </span>
          </div>

        </div>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>

      </header>


      <main className="student-content">

        <div className="student-heading">

          <div>

            <p className="eyebrow">
              PERFORMANCE
            </p>

            <h1>
              My Statistics
            </h1>

            <p>
              Track your quiz performance.
            </p>

          </div>

        </div>


        <div className="stats-grid">

          <div className="stat-card">
            <span>Total Attempts</span>
            <strong>{statistics.total_attempts}</strong>
          </div>


          <div className="stat-card">
            <span>Average Score</span>
            <strong>
              {statistics.average_score}%
            </strong>
          </div>


          <div className="stat-card">
            <span>Highest Score</span>
            <strong>
              {statistics.highest_score}%
            </strong>
          </div>


          <div className="stat-card">
            <span>Passed</span>
            <strong>
              {statistics.passed_attempts}
            </strong>
          </div>


          <div className="stat-card">
            <span>Failed</span>
            <strong>
              {statistics.failed_attempts}
            </strong>
          </div>

        </div>
        <div className="performance-chart">

  <h2>
    Performance
  </h2>

  {statistics.performance.map((item) => (

    <div
      className="performance-row"
      key={item.attempt}
    >

      <div className="performance-label">

        <span>
          Attempt {item.attempt}
        </span>

        <strong>
          {item.percentage}%
        </strong>

      </div>

      <div className="performance-bar">

        <div
          className="performance-fill"
          style={{
            width: `${item.percentage}%`
          }}
        />

      </div>

      <small>
        {item.quiz_title}
      </small>

    </div>

  ))}

</div>


        <button
          className="secondary-btn"
          onClick={() => {
            setStatistics(null);
            loadQuizzes();
          }}
        >
          Back to Quizzes
        </button>

      </main>

    </div>
  );
}

  // =====================================================
  // AVAILABLE QUIZZES SCREEN
  // =====================================================

  if (!quiz){
    return (
  <div className="student-page">

    <header className="student-topbar">

      <div className="student-brand">

        <div className="brand-mark small">
          Q
        </div>

        <div>
          <strong>
            Quiz Platform
          </strong>

          <span>
            Student Dashboard
          </span>
        </div>

      </div>

      <button
        className="logout-btn"
        onClick={onLogout}
      >
        Logout
      </button>

    </header>

    <main className="student-content">

  <div className="student-dashboard-actions">

    <button
      className="secondary-btn"
      onClick={loadAttemptHistory}
    >
      Attempt History
    </button>

    <button
      className="secondary-btn"
      onClick={loadStatistics}
    >
      My Statistics
    </button>

    <button
      className="secondary-btn"
      onClick={() => {
        loadLeaderboard();
        loadLeaderboardCategories();
      }}
    >
      Leaderboard
    </button>

  </div>

  <QuizDiscovery
    quizzes={quizzes}
    onStartQuiz={startQuiz}
  />

  {error && (
    <div className="error-box">
      {error}
    </div>
  )}

</main>

  </div>
);
  }



  // =====================================================
  // QUIZ SCREEN
  // =====================================================

  const question =
    quiz.questions[currentQuestion];


  return (

    <div className="student-page">


      {/* TOP BAR */}

      <header className="student-topbar">


        <div className="student-brand">

          <div className="brand-mark small">
            Q
          </div>

          <div>

            <strong>
              {quiz.title}
            </strong>

            <span>

              Question{" "}
              {currentQuestion + 1}
              {" "}of{" "}
              {quiz.questions.length}

            </span>

          </div>

        </div>



        {/* TIMER */}

        <div
          className={`timer ${
            timeLeft <= 60
              ? "danger"
              : ""
          }`}
        >

          {formatTime(timeLeft)}

        </div>

      </header>



      {/* QUIZ */}

      <main className="quiz-player">


        {/* QUESTION NUMBERS */}

        <div className="question-progress">

          {quiz.questions.map(
            (q, index) => (

              <button
                key={q.id}
                className={`question-number ${
                  answers[q.id]
                    ? "answered"
                    : ""
                } ${
                  index === currentQuestion
                    ? "current"
                    : ""
                }`}
                onClick={() =>
                  setCurrentQuestion(
                    index
                  )
                }
              >

                {index + 1}

              </button>

            )
          )}

        </div>



        {/* QUESTION CARD */}

        <section className="question-card">


          <div className="question-card-header">

            <span>

              Question{" "}
              {currentQuestion + 1}

            </span>

            <span>

              {question.marks} mark

            </span>

          </div>



          <h1>

            {question.question_text}

          </h1>



          {/* OPTIONS */}

          <div className="options-list">

            {question.options.map(
              (option, index) => (

                <button
                  key={option.id}
                  className={`option-btn ${
                    answers[
                      question.id
                    ] === option.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    selectAnswer(
                      question.id,
                      option.id
                    )
                  }
                >

                  <span className="option-letter">

                    {String.fromCharCode(
                      65 + index
                    )}

                  </span>

                  <span>

                    {option.option_text}

                  </span>

                </button>

              )
            )}

          </div>



          {/* NAVIGATION */}

          <div className="quiz-navigation">


            <button
              className="secondary-btn"
              disabled={
                currentQuestion === 0
              }
              onClick={() =>
                setCurrentQuestion(
                  (previous) =>
                    previous - 1
                )
              }
            >

              Previous

            </button>



            {currentQuestion ===
            quiz.questions.length - 1 ? (

              <button
                className="primary-btn"
                disabled={submitting}
                onClick={() =>
                  submitQuiz(false)
                }
              >

                {submitting
                  ? "Submitting..."
                  : "Submit Quiz"}

              </button>

            ) : (

              <button
                className="primary-btn"
                onClick={() =>
                  setCurrentQuestion(
                    (previous) =>
                      previous + 1
                  )
                }
              >

                Next

              </button>

            )}

          </div>

        </section>

      </main>

    </div>

  );
}



// =====================================================
// RESULT ITEM
// =====================================================

function ResultItem({
  label,
  value,
}) {

  return (

    <div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );
}


export default StudentDashboard;