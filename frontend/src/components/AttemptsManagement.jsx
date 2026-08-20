import { useEffect, useState } from "react";
import { API } from "../App";
function AttemptsManagement({ token }) {

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${token}`,
  };


  const loadAttempts = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `${API}/api/admin/attempts`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load attempts"
        );
      }

      setAttempts(data);

    } catch (error) {

      console.error(
        "Attempts error:",
        error
      );

      alert(error.message);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadAttempts();
  }, []);


  return (

    <section className="panel">

      <div className="panel-header">

        <div>

          <p className="eyebrow">
            RESULTS
          </p>

          <h2>
            Quiz Attempts
          </h2>

        </div>

        <span className="count-badge">
          {attempts.length} Attempts
        </span>

      </div>


      {loading ? (

        <div className="empty-panel">

          <h3>
            Loading attempts...
          </h3>

        </div>

      ) : attempts.length === 0 ? (

        <div className="empty-panel">

          <h3>
            No quiz attempts yet
          </h3>

          <p>
            Student quiz attempts will appear here
            once students complete quizzes.
          </p>

        </div>

      ) : (

        <div className="table-wrap">

          <table className="data-table">

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Student
                </th>

                <th>
                  Quiz
                </th>

                <th>
                  Score
                </th>

                <th>
                  Correct
                </th>

                <th>
                  Incorrect
                </th>

                <th>
                  Status
                </th>

                <th>
                  Completed
                </th>

              </tr>

            </thead>


            <tbody>

              {attempts.map((attempt) => (

                <tr key={attempt.id}>

                  <td>
                    #{attempt.id}
                  </td>


                  <td>

                    <strong>
                      {attempt.student_name}
                    </strong>

                    <br />

                    <small>
                      {attempt.student_email}
                    </small>

                  </td>


                  <td>
                    {attempt.quiz_title}
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

export default AttemptsManagement;