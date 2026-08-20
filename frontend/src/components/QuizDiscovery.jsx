import { useMemo, useState } from "react";

function QuizDiscovery({ quizzes, onStartQuiz }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const categories = useMemo(() => {
    const map = new Map();

    quizzes.forEach((quiz) => {
      if (quiz.category_id !== undefined && quiz.category_id !== null) {
        map.set(
          String(quiz.category_id),
          quiz.category_name || `Category ${quiz.category_id}`
        );
      }
    });

    return Array.from(map.entries());
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    let result = quizzes.filter((item) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        item.title?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search);

      const matchesDifficulty =
        !selectedDifficulty ||
        item.difficulty === selectedDifficulty;

      const matchesCategory =
        !selectedCategory ||
        String(item.category_id) === String(selectedCategory);

      const duration = Number(item.duration || 0);

      const matchesDuration =
        !selectedDuration ||
        (selectedDuration === "short" && duration <= 15) ||
        (selectedDuration === "medium" &&
          duration > 15 &&
          duration <= 30) ||
        (selectedDuration === "long" && duration > 30);

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesCategory &&
        matchesDuration
      );
    });

    if (sortBy === "recent") {
      result.sort((a, b) => {
        const dateA = new Date(
          a.created_at || a.updated_at || 0
        ).getTime();

        const dateB = new Date(
          b.created_at || b.updated_at || 0
        ).getTime();

        return dateB - dateA;
      });
    }

    if (sortBy === "popular") {
      result.sort((a, b) => {
        const popularityA = Number(
          a.attempts_count ??
            a.total_attempts ??
            a.attempts ??
            0
        );

        const popularityB = Number(
          b.attempts_count ??
            b.total_attempts ??
            b.attempts ??
            0
        );

        return popularityB - popularityA;
      });
    }

    return result;
  }, [
    quizzes,
    searchTerm,
    selectedDifficulty,
    selectedCategory,
    selectedDuration,
    sortBy,
  ]);

  return (
    <>
      <div className="student-heading">
        <div>
          <p className="eyebrow">LEARNING</p>

          <h1>Available Quizzes</h1>

          <p>
            Choose a quiz and test your knowledge.
          </p>
        </div>
      </div>

      <div className="quiz-discovery-controls">

        <input
          type="text"
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <select
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value)
          }
        >
          <option value="">
            All Categories
          </option>

          {categories.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) =>
            setSelectedDifficulty(e.target.value)
          }
        >
          <option value="">
            All Difficulties
          </option>

          <option value="Easy">
            Easy
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="Hard">
            Hard
          </option>
        </select>

        <select
          value={selectedDuration}
          onChange={(e) =>
            setSelectedDuration(e.target.value)
          }
        >
          <option value="">
            All Durations
          </option>

          <option value="short">
            Up to 15 min
          </option>

          <option value="medium">
            16–30 min
          </option>

          <option value="long">
            30+ min
          </option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="">
            Sort By
          </option>

          <option value="recent">
            Recently Added
          </option>

          <option value="popular">
            Popularity
          </option>
        </select>

      </div>

      <div className="quiz-grid">

        {filteredQuizzes.map((item) => {
            const isRecentlyAdded =
  item.created_at &&
  Date.now() - new Date(item.created_at).getTime() <=
    7 * 24 * 60 * 60 * 1000;

const popularityCount = Number(
  item.attempts_count ??
  item.total_attempts ??
  item.attempts ??
  0
);

const isPopular = popularityCount >= 5;

          const attemptsReached =
            item.attempts_remaining <= 0;

          return (
            <article
              className="quiz-card"
              key={item.id}
            >

              <div className="quiz-card-top">
                {isRecentlyAdded && (
  <span className="quiz-tag recent-tag">
    Recently Added
  </span>
)}

{isPopular && (
  <span className="quiz-tag popular-tag">
    Popular
  </span>
)}

                <span className="difficulty-badge">
                  {item.difficulty}
                </span>

                <span className="duration-badge">
                  {item.duration} min
                </span>

              </div>

              <h2>
                {item.title}
              </h2>

              <p>
                {item.description}
              </p>

              <div className="quiz-meta">

                <span>
                  Passing score
                </span>

                <strong>
                  {item.passing_score}%
                </strong>

              </div>

              <div className="attempt-info">

                {attemptsReached ? (
                  <>
                    <span className="attempt-limit-text">
                      Maximum attempts reached
                    </span>

                    <span className="attempt-count">
                      {item.attempts_used} /{" "}
                      {item.max_attempts} attempts used
                    </span>
                  </>
                ) : (
                  <span className="attempt-count">
                    {item.attempts_remaining} attempt
                    {item.attempts_remaining !== 1
                      ? "s"
                      : ""}{" "}
                    remaining
                  </span>
                )}

              </div>

              {attemptsReached ? (

                <button
                  className="secondary-btn full-btn"
                  disabled
                >
                  Attempt Limit Reached
                </button>

              ) : (

                <div className="quiz-actions">

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setSelectedQuiz(item)
                    }
                  >
                    View Details
                  </button>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      onStartQuiz(item.id)
                    }
                  >
                    Start Quiz
                  </button>

                </div>

              )}

            </article>
          );
        })}

      </div>

      {!filteredQuizzes.length && (
        <div className="empty-panel">
          <div className="empty-icon">
            Q
          </div>

          <h2>
            No quizzes found
          </h2>

          <p>
            No quizzes match your search or filters.
          </p>
        </div>
      )}

      {selectedQuiz && (
        <div
          className="quiz-details-overlay"
          onClick={() =>
            setSelectedQuiz(null)
          }
        >

          <div
            className="quiz-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="quiz-details-header">

              <div>
                <p className="eyebrow">
                  QUIZ DETAILS
                </p>

                <h2>
                  {selectedQuiz.title}
                </h2>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedQuiz(null)
                }
              >
                ×
              </button>

            </div>

            <p className="quiz-details-description">
              {selectedQuiz.description ||
                "No description available."}
            </p>

            <div className="quiz-details-grid">

              <div>
                <span>Difficulty</span>
                <strong>
                  {selectedQuiz.difficulty ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span>Duration</span>
                <strong>
                  {selectedQuiz.duration
                    ? `${selectedQuiz.duration} min`
                    : "N/A"}
                </strong>
              </div>

              <div>
                <span>Passing Score</span>
                <strong>
                  {selectedQuiz.passing_score ??
                    "N/A"}%
                </strong>
              </div>

              <div>
                <span>Maximum Attempts</span>
                <strong>
                  {selectedQuiz.max_attempts ??
                    "N/A"}
                </strong>
              </div>

            </div>

            <div className="quiz-details-actions">

              <button
                className="secondary-btn"
                onClick={() =>
                  setSelectedQuiz(null)
                }
              >
                Close
              </button>

              <button
                className="primary-btn"
                onClick={() => {
                  setSelectedQuiz(null);
                  onStartQuiz(selectedQuiz.id);
                }}
              >
                Start Quiz
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}

export default QuizDiscovery;