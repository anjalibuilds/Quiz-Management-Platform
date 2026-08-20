import { useEffect, useState } from "react";
import { API } from "../App";

function StudentProfile({ token, studentId, onBack }) {
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      const [profileResponse, resultsResponse] =
        await Promise.all([
          fetch(`${API}/api/admin/users/${studentId}`, {
            headers,
          }),

          fetch(`${API}/api/admin/users/${studentId}/results`, {
            headers,
          }),
        ]);

      const profileData = await profileResponse.json();
      const resultsData = await resultsResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message ||
            "Failed to load student profile"
        );
      }

      if (!resultsResponse.ok) {
        throw new Error(
          resultsData.message ||
            "Failed to load student results"
        );
      }

      setStudent(profileData);
      setResults(resultsData);

    } catch (error) {
      console.error(
        "Student profile error:",
        error
      );

      alert(error.message);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadProfile();
    }
  }, [studentId]);

  if (loading) {
    return (
      <section className="panel profile-panel">
        <div className="profile-loading">
          Loading student profile...
        </div>
      </section>
    );
  }

  if (!student) {
    return (
      <section className="panel profile-panel">
        <div className="empty-panel">
          <h3>Student not found</h3>

          <button
            className="secondary-btn"
            onClick={onBack}
          >
            ← Back to Students
          </button>
        </div>
      </section>
    );
  }

  /* --------------------------------
     RESULTS DATA
  -------------------------------- */

  const attempts = results?.results || [];

  const statistics = results?.statistics || {};

  const totalQuestionsAnswered =
    attempts.reduce(
      (total, attempt) =>
        total +
        (attempt.correct_answers || 0) +
        (attempt.incorrect_answers || 0),
      0
    );

  return (
    <section className="panel profile-panel">

      {/* PROFILE HEADER */}

      <div className="profile-header">

        <div>
          <p className="eyebrow">
            STUDENT PROFILE
          </p>

          <h2>
            {student.name}
          </h2>

          <p className="profile-email">
            {student.email}
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={onBack}
        >
          ← Back to Students
        </button>

      </div>


      {/* BASIC INFORMATION */}

      <div className="profile-info">

        <div>
          <span>
            Registration Date
          </span>

          <strong>
            {student.created_at
              ? new Date(
                  student.created_at
                ).toLocaleDateString()
              : "-"}
          </strong>
        </div>


        <div>
          <span>
            Account Status
          </span>

          <strong>
            <span
              className={`status-pill ${
                student.status
                  ? "active"
                  : "inactive"
              }`}
            >
              {student.status
                ? "Active"
                : "Inactive"}
            </span>
          </strong>
        </div>

      </div>


      {/* PERFORMANCE SUMMARY */}

      <div className="profile-section-title">

        <div>
          <p className="eyebrow">
            PERFORMANCE
          </p>

          <h3>
            Quiz Summary
          </h3>
        </div>

      </div>


      <div className="profile-stats">

        {/* QUIZZES ATTEMPTED */}

        <div className="profile-stat">
          <span>
            Quizzes Attempted
          </span>

          <strong>
            {statistics.total_attempts || 0}
          </strong>
        </div>


        {/* AVERAGE SCORE */}

        <div className="profile-stat">
          <span>
            Average Score
          </span>

          <strong>
            {statistics.average_score || 0}%
          </strong>
        </div>


        {/* HIGHEST SCORE */}

        <div className="profile-stat">
          <span>
            Highest Score
          </span>

          <strong>
            {statistics.highest_score || 0}%
          </strong>
        </div>


        {/* PASSED */}

        <div className="profile-stat">
          <span>
            Passed
          </span>

          <strong>
            {statistics.passed || 0}
          </strong>
        </div>


        {/* FAILED */}

        <div className="profile-stat">
          <span>
            Failed
          </span>

          <strong>
            {statistics.failed || 0}
          </strong>
        </div>


        {/* QUESTIONS ANSWERED */}

        <div className="profile-stat">
          <span>
            Questions Answered
          </span>

          <strong>
            {totalQuestionsAnswered}
          </strong>
        </div>

      </div>


      {/* QUIZ HISTORY */}

      <div className="profile-section-title history-title">

        <div>
          <p className="eyebrow">
            HISTORY
          </p>

          <h3>
            Quiz History
          </h3>
        </div>

        <span className="count-badge">
          {attempts.length} Attempts
        </span>

      </div>


      {attempts.length === 0 ? (

        <div className="profile-empty">

          <h3>
            No quiz attempts yet
          </h3>

          <p>
            This student has not attempted
            any quizzes.
          </p>

        </div>

      ) : (

        <div className="table-wrap">

          <table className="data-table">

            <thead>

              <tr>
                <th>Quiz</th>
                <th>Score</th>
                <th>Correct</th>
                <th>Incorrect</th>
                <th>Status</th>
                <th>Date</th>
              </tr>

            </thead>


            <tbody>

              {attempts.map((attempt) => (

                <tr key={attempt.attempt_id}>

                  <td>
                    <strong>
                      {attempt.quiz_title}
                    </strong>
                  </td>

                  <td>
                    {attempt.percentage}%
                  </td>

                  <td>
                    {attempt.correct_answers ?? 0}
                  </td>

                  <td>
                    {attempt.incorrect_answers ?? 0}
                  </td>

                  <td>

                    <span
                      className={`status-pill ${
                        attempt.status === "PASSED"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {attempt.status}
                    </span>

                  </td>

                  <td>

                    {attempt.completed_at
                      ? new Date(
                          attempt.completed_at
                        ).toLocaleString()
                      : "Not completed"}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </section>
  );
}

export default StudentProfile;