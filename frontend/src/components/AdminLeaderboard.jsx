import { useEffect, useState } from "react";
import { API } from "../App";

function AdminLeaderboard({ token }) {

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadLeaderboard = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `${API}/api/admin/leaderboard`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load leaderboard"
        );
      }

      setLeaderboard(data);

    } catch (error) {

      console.error(
        "Leaderboard error:",
        error
      );

      alert(error.message);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (

    <section className="panel">

      <div className="panel-header">

        <div>

          <p className="eyebrow">
            RANKINGS
          </p>

          <h2>
            Leaderboard Management
          </h2>

        </div>

        <span className="count-badge">
          {leaderboard.length} Students
        </span>

      </div>

      {loading ? (

        <div className="empty-panel">

          <h3>
            Loading leaderboard...
          </h3>

        </div>

      ) : leaderboard.length === 0 ? (

        <div className="empty-panel">

          <h3>
            No leaderboard data yet
          </h3>

          <p>
            Students will appear here after completing quizzes.
          </p>

        </div>

      ) : (

        <div className="table-wrap">

          <table className="data-table">

            <thead>

              <tr>

                <th>Rank</th>

                <th>Student</th>

                <th>Attempts</th>

                <th>Average Score</th>

                <th>Highest Score</th>

              </tr>

            </thead>

            <tbody>

              {leaderboard.map((student) => (

                <tr key={student.user_id}>

                  <td>

                    <strong>
                      #{student.rank}
                    </strong>

                  </td>

                  <td>
                    {student.name}
                  </td>

                  <td>
                    {student.attempts}
                  </td>

                  <td>
                    {student.average_score}%
                  </td>

                  <td>
                    {student.highest_score}%
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

export default AdminLeaderboard;