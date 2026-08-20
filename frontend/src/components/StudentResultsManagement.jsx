import { useEffect, useState } from "react";
import { API } from "../App";

function StudentResultsManagement({ token, users }) {

  const [selectedUser, setSelectedUser] = useState("");
  const [student, setStudent] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadStudentResults = async (userId) => {

    if (!userId) {
      setStudent(null);
      setStatistics(null);
      setResults([]);
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${API}/api/admin/users/${userId}/results`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load student results"
        );
      }

      setStudent(data.student);
      setStatistics(data.statistics);
      setResults(data.results);

    } catch (error) {

      console.error(error);
      alert(error.message);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    loadStudentResults(selectedUser);

  }, [selectedUser]);

  return (
    <section className="panel">

      <div className="panel-header">

        <div>

          <p className="eyebrow">
            RESULTS
          </p>

          <h2>
            Individual Student Results
          </h2>

        </div>

      </div>


      <div className="form-group">

        <label>
          Select Student
        </label>

        <select
          value={selectedUser}
          onChange={(e) =>
            setSelectedUser(e.target.value)
          }
        >

          <option value="">
            Select a student
          </option>

          {users.map((user) => (

            <option
              key={user.id}
              value={user.id}
            >
              {user.name} — {user.email}
            </option>

          ))}

        </select>

      </div>


      {loading && (

        <div className="empty-panel">
          Loading student results...
        </div>

      )}


      {!loading && student && statistics && (

        <>

          <div className="stats-grid">

            <StatCard
              title="Student"
              value={student.name}
            />

            <StatCard
              title="Total Attempts"
              value={statistics.total_attempts}
            />

            <StatCard
              title="Average Score"
              value={`${statistics.average_score}%`}
            />

            <StatCard
              title="Highest Score"
              value={`${statistics.highest_score}%`}
            />

            <StatCard
              title="Passed"
              value={statistics.passed}
            />

            <StatCard
              title="Failed"
              value={statistics.failed}
            />

          </div>


          <div className="table-wrap">

            <table className="data-table">

              <thead>

                <tr>

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

                {results.length === 0 ? (

                  <tr>

                    <td colSpan="6">
                      No quiz attempts found.
                    </td>

                  </tr>

                ) : (

                  results.map((result) => (

                    <tr key={result.attempt_id}>

                      <td>
                        <strong>
                          {result.quiz_title}
                        </strong>
                      </td>

                      <td>
                        {result.percentage}%
                      </td>

                      <td>
                        {result.correct_answers ?? 0}
                      </td>

                      <td>
                        {result.incorrect_answers ?? 0}
                      </td>

                      <td>

                        <span
                          className={`status-pill ${
                            result.status === "PASSED"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {result.status}
                        </span>

                      </td>

                      <td>
                        {result.completed_at
                          ? new Date(
                              result.completed_at
                            ).toLocaleString()
                          : "Not completed"}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </>

      )}

    </section>
  );
}


function StatCard({ title, value }) {

  return (

    <div className="stat-card">

      <p>
        {title}
      </p>

      <strong>
        {value}
      </strong>

    </div>

  );
}


export default StudentResultsManagement;