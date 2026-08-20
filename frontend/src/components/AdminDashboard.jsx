import { useEffect, useState } from "react";
import { API } from "../App";
import AttemptsManagement from "./AttemptsManagement";
import StudentResultsManagement from "./StudentResultsManagement";
import AdminLeaderboard from "./AdminLeaderboard";
import StudentProfile from "./StudentProfile";
function AdminDashboard({ token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [analytics, setAnalytics] = useState(null);
const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activePage, setActivePage] =
    useState("Dashboard");

  const headers = {
    Authorization: `Bearer ${token}`,
  };


  // -----------------------------
  // LOAD DASHBOARD
  // -----------------------------

  const loadDashboard = async () => {
    try {
      const response = await fetch(
        `${API}/api/admin/dashboard`,
        {
          headers,
        }
      );

      if (response.ok) {
        setStats(await response.json());
      }

    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );
    }
  };


  // -----------------------------
  // LOAD USERS
  // -----------------------------

  const loadUsers = async () => {
    try {
      const response = await fetch(
        `${API}/api/admin/users`,
        {
          headers,
        }
      );

      if (response.ok) {
        setUsers(await response.json());
      }

    } catch (error) {
      console.error(
        "Users error:",
        error
      );
    }
  };
const loadAnalytics = async () => {
  try {
    const response = await fetch(
      `${API}/api/admin/analytics`,
      {
        headers,
      }
    );

    if (response.ok) {
      setAnalytics(await response.json());
    }
  } catch (error) {
    console.error("Analytics error:", error);
  }
};
const filteredUsers = users.filter((user) => {
  const search = userSearch.toLowerCase();

  return (
    String(user.id).includes(search) ||
    user.name?.toLowerCase().includes(search) ||
    user.email?.toLowerCase().includes(search)
  );
});
  // -----------------------------
  // INITIAL LOAD
  // -----------------------------

  useEffect(() => {
  loadDashboard();
  loadUsers();
  loadAnalytics();
}, []);

  // -----------------------------
  // TOGGLE USER STATUS
  // -----------------------------

  const toggleStatus = async (id) => {
    try {
      await fetch(
        `${API}/api/admin/users/${id}/status`,
        {
          method: "PATCH",
          headers,
        }
      );

      loadUsers();

    } catch (error) {
      console.error(
        "Status update error:",
        error
      );
    }
  };


  // -----------------------------
  // DELETE USER
  // -----------------------------

  const deleteUser = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this student?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await fetch(
        `${API}/api/admin/users/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      loadUsers();
      loadDashboard();

    } catch (error) {

      console.error(
        "Delete user error:",
        error
      );

    }
  };


  // -----------------------------
  // SIDEBAR ITEMS
  // -----------------------------

  
const navItems = [
  "Dashboard",
  "Users",
  "Quizzes",
  "Categories",
  "Questions",
  "Analytics",
  "Attempts",
  "Student Results",
  "Leaderboard"
  
  
];

  return (
    <div className="app-shell">


      {/* ================================= */}
      {/* SIDEBAR */}
      {/* ================================= */}

      <aside className="sidebar">


        {/* BRAND */}

        <div className="sidebar-brand">

          <div className="brand-mark small">
            Q
          </div>

          <div>

            <strong>
              Quiz Platform
            </strong>

            <span>
              Admin Panel
            </span>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          {navItems.map((item) => (

            <button
              key={item}
              className={`nav-item ${
                activePage === item
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage(item)
              }
            >

              {item}

            </button>

          ))}

        </nav>


        {/* LOGOUT */}

        <button
          className="logout-btn sidebar-logout"
          onClick={onLogout}
        >
          Logout
        </button>

      </aside>



      {/* ================================= */}
      {/* MAIN CONTENT */}
      {/* ================================= */}

      <main className="dashboard-main">


        {/* TOP BAR */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              ADMIN
            </p>

            <h1>
              {activePage}
            </h1>

          </div>


          <button
            className="logout-btn top-logout"
            onClick={onLogout}
          >
            Logout
          </button>

        </header>



        {/* ================================= */}
        {/* DASHBOARD */}
        {/* ================================= */}

        {activePage === "Dashboard" && (

          <section>


            {/* WELCOME */}

            <div className="welcome-card">

              <div>

                <p className="eyebrow">
                  OVERVIEW
                </p>

                <h2>
                  Welcome back, Admin
                </h2>

                <p>
                  Manage students, quizzes
                  and your quiz platform
                  from here.
                </p>

              </div>

            </div>



            {/* STATS */}

            {stats ? (

              <div className="stats-grid">


                <StatCard
                  title="Total Students"
                  value={
                    stats.total_students
                  }
                />


                <StatCard
                  title="Total Quizzes"
                  value={
                    stats.total_quizzes
                  }
                />


                <StatCard
                  title="Published Quizzes"
                  value={
                    stats.published_quizzes
                  }
                />


                <StatCard
                  title="Draft Quizzes"
                  value={
                    stats.draft_quizzes
                  }
                />


                <StatCard
                  title="Total Questions"
                  value={
                    stats.total_questions
                  }
                />


                <StatCard
                  title="Total Attempts"
                  value={
                    stats.total_attempts
                  }
                />


                <StatCard
                  title="Average Score"
                  value={`${stats.average_score}%`}
                />


                <StatCard
                  title="Passed Attempts"
                  value={
                    stats.total_passed_attempts
                  }
                />


                <StatCard
                  title="Failed Attempts"
                  value={
                    stats.total_failed_attempts
                  }
                />

              </div>

            ) : (

              <div className="loading-card">
                Loading dashboard...
              </div>

            )}

          </section>

        )}



        {/* ================================= */}
        {/* USERS */}
        {/* ================================= */}

        {activePage === "Users" && (
  selectedStudentId ? (
    <StudentProfile
      token={token}
      studentId={selectedStudentId}
      onBack={() => setSelectedStudentId(null)}
    />
  ) : (
    <section className="panel">


            {/* PANEL HEADER */}

          <div className="panel-header">

  <div>

    <p className="eyebrow">
      MANAGEMENT
    </p>

    <h2>
      Student Management
    </h2>

  </div>

  <div className="action-group">

    <input
      type="text"
      placeholder="Search students..."
      value={userSearch}
      onChange={(e) => setUserSearch(e.target.value)}
    />

    <span className="count-badge">
      {filteredUsers.length} Students
    </span>

  </div>

</div>



            {/* TABLE */}

            <div className="table-wrap">

              <table className="data-table">

                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                    <th>
  Registration Date
</th>

                  </tr>

                </thead>


                <tbody>

                  {filteredUsers.map((user) => (

                    <tr
                      key={user.id}
                    >

                      <td>
                        {user.id}
                      </td>


                      <td>
                        {user.name}
                      </td>


                      <td>
                        {user.email}
                      </td>

                      


                      <td>

                        <span
                          className={`status-pill ${
                            user.status
                              ? "active"
                              : "inactive"
                          }`}
                        >

                          {user.status
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>


                      <td>

 <div className="action-group">

  <button
    className="secondary-btn"
    onClick={() =>
      setSelectedStudentId(user.id)
    }
  >
    View Profile
  </button>

  <button
    className="secondary-btn"
    onClick={() =>
      toggleStatus(user.id)
    }
  >
    {user.status
      ? "Deactivate"
      : "Activate"}
  </button>

  <button
    className="danger-outline-btn"
    onClick={() =>
      deleteUser(user.id)
    }
  >
    Delete
  </button>

</div>

                      </td>
                       <td>
  {user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "-"}
</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>
  )

        )}
        {/* ================================= */}
        {/* OTHER ADMIN PAGES */}
        {/* ================================= */}

        {activePage === "Quizzes" && (
  <QuizManagement
    token={token}
    headers={headers}
    onUpdated={() => {
      loadDashboard();
    }}
  />
)}
{activePage === "Attempts" && (
  <AttemptsManagement token={token} />
)}
{activePage === "Student Results" && (
  <StudentResultsManagement
    token={token}
    users={users}
  />
)}
{activePage === "Leaderboard" && (
  <AdminLeaderboard token={token} />
)}
{activePage === "Categories" && (
  <CategoryManagement
    token={token}
    headers={headers}
  />
)}

{activePage === "Questions" && (
  <QuestionManagement
    token={token}
    headers={headers}
  />
)}
        {/* ================================= */}
{/* ANALYTICS */}
{/* ================================= */}

{activePage === "Analytics" && analytics && (

  <section>

    <div className="stats-grid">

      <StatCard
        title="Total Students"
        value={
          analytics.student_statistics.total_students
        }
      />

      <StatCard
        title="Total Quizzes"
        value={
          analytics.quiz_statistics.total_quizzes
        }
      />

      <StatCard
        title="Total Attempts"
        value={
          analytics.attempt_statistics.total_attempts
        }
      />

      <StatCard
        title="Average Score"
        value={`${analytics.attempt_statistics.average_score}%`}
      />

      <StatCard
        title="Passed Attempts"
        value={
          analytics.pass_fail_analytics.passed
        }
      />

      <StatCard
        title="Failed Attempts"
        value={
          analytics.pass_fail_analytics.failed
        }
      />

    </div>


    <div className="panel">

      <div className="panel-header">

        <div>

          <p className="eyebrow">
            QUIZ PERFORMANCE
          </p>

          <h2>
            Quiz Statistics
          </h2>

        </div>

      </div>


      <div className="table-wrap">

        <table className="data-table">

          <thead>

            <tr>
              <th>Quiz</th>
              <th>Attempts</th>
              <th>Average Score</th>
              <th>Passed</th>
              <th>Failed</th>
            </tr>

          </thead>


          <tbody>

            {analytics.quiz_performance.map(
              (quiz) => (

                <tr key={quiz.quiz_id}>

                  <td>
                    {quiz.quiz_title}
                  </td>

                  <td>
                    {quiz.attempts}
                  </td>

                  <td>
                    {quiz.average_score}%
                  </td>

                  <td>
                    {quiz.passed}
                  </td>

                  <td>
                    {quiz.failed}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  </section>

)}
      </main>

    </div>
  );
}

// =====================================
// QUIZ MANAGEMENT
// =====================================

function QuizManagement({ headers, onUpdated }) {

  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    difficulty: "Easy",
    duration: 30,
    passing_score: 50,
    max_attempts: 1,
    status: "Draft",
    thumbnail: "",
  });

  const loadQuizzes = async () => {

    try {

      const response = await fetch(
        `${API}/api/quizzes`,
        { headers }
      );

      if (response.ok) {
        setQuizzes(await response.json());
      }

    } catch (error) {
      console.error("Quiz loading error:", error);
    }
  };


  const loadCategories = async () => {

    try {

      const response = await fetch(
        `${API}/api/categories`,
        { headers }
      );

      if (response.ok) {
        setCategories(await response.json());
      }

    } catch (error) {
      console.error("Category loading error:", error);
    }
  };


  useEffect(() => {
    loadQuizzes();
    loadCategories();
  }, []);


  const resetForm = () => {

    setForm({
      title: "",
      description: "",
      category_id: "",
      difficulty: "Easy",
      duration: 30,
      passing_score: 50,
      max_attempts: 1,
      status: "Draft",
      thumbnail: "",
    });

    setEditingQuiz(null);
    setShowForm(false);
  };


  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const saveQuiz = async (e) => {

    e.preventDefault();

    try {

      const url = editingQuiz
        ? `${API}/api/quizzes/${editingQuiz.id}`
        : `${API}/api/quizzes`;

      const response = await fetch(
        url,
        {
          method: editingQuiz ? "PUT" : "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            category_id:
              form.category_id
                ? Number(form.category_id)
                : null,
            duration: Number(form.duration),
            passing_score: Number(form.passing_score),
            max_attempts: Number(form.max_attempts),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Unable to save quiz."
        );

        return;
      }

      alert(
        editingQuiz
          ? "Quiz updated successfully."
          : "Quiz created successfully."
      );

      resetForm();
      loadQuizzes();
      onUpdated();

    } catch (error) {

      console.error(error);

      alert("Something went wrong.");
    }
  };


  const editQuiz = (quiz) => {

    setEditingQuiz(quiz);

    setForm({
      title: quiz.title || "",
      description: quiz.description || "",
      category_id: quiz.category_id || "",
      difficulty: quiz.difficulty || "Easy",
      duration: quiz.duration || 30,
      passing_score: quiz.passing_score || 50,
      max_attempts: quiz.max_attempts || 1,
      status: quiz.status || "Draft",
      thumbnail: quiz.thumbnail || "",
    });

    setShowForm(true);
  };


  const deleteQuiz = async (id) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this quiz?"
      )
    ) {
      return;
    }

    try {

      const response = await fetch(
        `${API}/api/quizzes/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Unable to delete quiz."
        );

        return;
      }

      alert("Quiz deleted successfully.");

      loadQuizzes();
      onUpdated();

    } catch (error) {

      console.error(error);

      alert("Something went wrong.");
    }
  };


  const togglePublish = async (id) => {

    try {

      const response = await fetch(
        `${API}/api/quizzes/${id}/status`,
        {
          method: "PATCH",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Unable to update quiz status."
        );

        return;
      }

      loadQuizzes();
      onUpdated();

    } catch (error) {

      console.error(error);

      alert("Something went wrong.");
    }
  };


  return (
    <section className="panel">

      <div className="panel-header">

        <div>

          <p className="eyebrow">
            MANAGEMENT
          </p>

          <h2>
            Quiz Management
          </h2>

        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setEditingQuiz(null);
            setForm({
              title: "",
              description: "",
              category_id: "",
              difficulty: "Easy",
              duration: 30,
              passing_score: 50,
              max_attempts: 1,
              status: "Draft",
              thumbnail: "",
            });
            setShowForm(true);
          }}
        >
          + Create Quiz
        </button>

      </div>


      {showForm && (

        <form
          onSubmit={saveQuiz}
          className="quiz-form"
        >

          <div className="form-grid">

  <div className="form-field">
    <label>Quiz Title</label>

    <input
      name="title"
      placeholder="Enter quiz title"
      value={form.title}
      onChange={handleChange}
      required
    />
  </div>


  <div className="form-field">
    <label>Category</label>

    <select
      name="category_id"
      value={form.category_id}
      onChange={handleChange}
    >
      <option value="">
        Select Category
      </option>

      {categories.map((category) => (
        <option
          key={category.id}
          value={category.id}
        >
          {category.name}
        </option>
      ))}
    </select>
  </div>


  <div className="form-field">
    <label>Difficulty</label>

    <select
      name="difficulty"
      value={form.difficulty}
      onChange={handleChange}
    >
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </select>
  </div>


  <div className="form-field">
    <label>Duration (minutes)</label>

    <input
      type="number"
      name="duration"
      value={form.duration}
      onChange={handleChange}
      min="1"
      required
    />
  </div>


  <div className="form-field">
    <label>Passing Score (%)</label>

    <input
      type="number"
      name="passing_score"
      value={form.passing_score}
      onChange={handleChange}
      min="0"
      max="100"
      required
    />
  </div>


  <div className="form-field">
    <label>Maximum Attempts</label>

    <input
      type="number"
      name="max_attempts"
      value={form.max_attempts}
      onChange={handleChange}
      min="1"
      required
    />
  </div>

</div>


          <textarea
            name="description"
            placeholder="Quiz description"
            value={form.description}
            onChange={handleChange}
          />


          <div className="action-group">

            <button
              type="submit"
              className="primary-btn"
            >
              {editingQuiz
                ? "Update Quiz"
                : "Create Quiz"}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={resetForm}
            >
              Cancel
            </button>

          </div>

        </form>
      )}


      <div className="table-wrap">

        <table className="data-table">

          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                Quiz
              </th>

              <th>
                Difficulty
              </th>

              <th>
                Duration
              </th>

              <th>
                Passing
              </th>

              <th>
                Attempts
              </th>

              <th>
                Status
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {quizzes.length === 0 ? (

              <tr>

                <td colSpan="8">
                  No quizzes found.
                </td>

              </tr>

            ) : (

              quizzes.map((quiz) => (

                <tr key={quiz.id}>

                  <td>
                    {quiz.id}
                  </td>

                  <td>
                    <strong>
                      {quiz.title}
                    </strong>
                  </td>

                  <td>
                    {quiz.difficulty}
                  </td>

                  <td>
                    {quiz.duration} min
                  </td>

                  <td>
                    {quiz.passing_score}%
                  </td>

                  <td>
                    {quiz.max_attempts}
                  </td>

                  <td>

                    <span
                      className={`status-pill ${
                        quiz.status === "Published"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {quiz.status}
                    </span>

                  </td>

                  <td>

                    <div className="action-group">

                      <button
                        className="secondary-btn"
                        onClick={() =>
                          editQuiz(quiz)
                        }
                      >
                        Edit
                      </button>


                      <button
                        className="secondary-btn"
                        onClick={() =>
                          togglePublish(quiz.id)
                        }
                      >
                        {quiz.status === "Published"
                          ? "Unpublish"
                          : "Publish"}
                      </button>


                      <button
                        className="danger-outline-btn"
                        onClick={() =>
                          deleteQuiz(quiz.id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </section>
  );
}
function QuestionManagement({ headers }) {

  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedQuiz, setSelectedQuiz] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const emptyForm = {
    question_text: "",
    marks: 1,
    explanation: "",
    difficulty: "Easy",
    options: [
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false }
    ]
  };

  const [form, setForm] = useState(emptyForm);


  const loadQuizzes = async () => {

    try {

      const response = await fetch(
        `${API}/api/quizzes`,
        { headers }
      );

      if (response.ok) {
        setQuizzes(await response.json());
      }

    } catch (error) {
      console.error(error);
    }
  };


  const loadQuestions = async (quizId) => {

    if (!quizId) {
      setQuestions([]);
      return;
    }

    try {

      const response = await fetch(
        `${API}/api/quizzes/${quizId}/questions`,
        { headers }
      );

      if (response.ok) {
        setQuestions(await response.json());
      }

    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    loadQuizzes();
  }, []);


  const selectQuiz = (e) => {

    const quizId = e.target.value;

    setSelectedQuiz(quizId);
    setShowForm(false);
    setEditingQuestion(null);

    loadQuestions(quizId);
  };


  const updateOption = (index, value) => {

    setForm((previous) => {

      const updatedOptions = [...previous.options];

      updatedOptions[index] = {
        ...updatedOptions[index],
        option_text: value
      };

      return {
        ...previous,
        options: updatedOptions
      };
    });
  };


  const setCorrectOption = (index) => {

    setForm((previous) => {

      const updatedOptions = previous.options.map(
        (option, optionIndex) => ({
          ...option,
          is_correct: optionIndex === index
        })
      );

      return {
        ...previous,
        options: updatedOptions
      };
    });
  };


  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  const resetForm = () => {

    setForm(emptyForm);
    setEditingQuestion(null);
    setShowForm(false);
  };


  const saveQuestion = async (e) => {

    e.preventDefault();

    if (!selectedQuiz) {

      alert("Please select a quiz first.");

      return;
    }


    const filledOptions = form.options.every(
      (option) =>
        option.option_text.trim() !== ""
    );

    if (!filledOptions) {

      alert("Please fill all 4 options.");

      return;
    }


    const correctCount = form.options.filter(
      (option) => option.is_correct
    ).length;

    if (correctCount !== 1) {

      alert(
        "Please select exactly one correct answer."
      );

      return;
    }


    try {

      const url = editingQuestion
        ? `${API}/api/questions/${editingQuestion.id}`
        : `${API}/api/quizzes/${selectedQuiz}/questions`;


      const response = await fetch(
        url,
        {
          method: editingQuestion
            ? "PUT"
            : "POST",

          headers: {
            ...headers,
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            question_text:
              form.question_text,

            marks:
              Number(form.marks),

            explanation:
              form.explanation,

            difficulty:
              form.difficulty,

            options:
              form.options
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Unable to save question."
        );

        return;
      }


      alert(
        editingQuestion
          ? "Question updated successfully."
          : "Question created successfully."
      );


      resetForm();

      loadQuestions(selectedQuiz);

    } catch (error) {

      console.error(error);

      alert("Something went wrong.");
    }
  };


  const editQuestion = (question) => {

    setEditingQuestion(question);

    setForm({
      question_text:
        question.question_text || "",

      marks:
        question.marks || 1,

      explanation:
        question.explanation || "",

      difficulty:
        question.difficulty || "Easy",

      options:
        question.options?.length === 4
          ? question.options.map(
              (option) => ({
                option_text:
                  option.option_text || "",

                is_correct:
                  option.is_correct || false
              })
            )
          : emptyForm.options
    });

    setShowForm(true);
  };


  const deleteQuestion = async (questionId) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this question?"
      )
    ) {
      return;
    }


    try {

      const response = await fetch(
        `${API}/api/questions/${questionId}`,
        {
          method: "DELETE",
          headers
        }
      );


      const data = await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Unable to delete question."
        );

        return;
      }


      alert(
        "Question deleted successfully."
      );


      loadQuestions(selectedQuiz);

    } catch (error) {

      console.error(error);

      alert("Something went wrong.");
    }
  };


  return (
    <section className="panel">

      <div className="panel-header">

        <div>

          <p className="eyebrow">
            MANAGEMENT
          </p>

          <h2>
            Question Management
          </h2>

        </div>


        {selectedQuiz && (

          <button
            className="primary-btn"
            onClick={() => {

              setEditingQuestion(null);

              setForm(emptyForm);

              setShowForm(true);

            }}
          >
            + Add Question
          </button>

        )}

      </div>


      <div className="form-field">

        <label>
          Select Quiz
        </label>

        <select
          value={selectedQuiz}
          onChange={selectQuiz}
        >

          <option value="">
            Select a quiz
          </option>

          {quizzes.map((quiz) => (

            <option
              key={quiz.id}
              value={quiz.id}
            >
              {quiz.title}
            </option>

          ))}

        </select>

      </div>


      {showForm && selectedQuiz && (

        <form
          onSubmit={saveQuestion}
          className="quiz-form"
        >

          <div className="form-field">

            <label>
              Question
            </label>

            <textarea
              name="question_text"
              value={form.question_text}
              onChange={handleChange}
              placeholder="Enter question"
              required
            />

          </div>


          <div className="form-grid">

            <div className="form-field">

              <label>
                Marks
              </label>

              <input
                type="number"
                name="marks"
                value={form.marks}
                onChange={handleChange}
                min="1"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Difficulty
              </label>

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
              >

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

            </div>

          </div>


          <div className="options-editor">

            <label>
              Options
            </label>


            {form.options.map(
              (option, index) => (

                <div
                  className="option-row"
                  key={index}
                >

                  <input
                    type="radio"
                    name="correct-option"
                    checked={
                      option.is_correct
                    }
                    onChange={() =>
                      setCorrectOption(index)
                    }
                  />


                  <span>
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>


                  <input
                    type="text"
                    value={
                      option.option_text
                    }
                    onChange={(e) =>
                      updateOption(
                        index,
                        e.target.value
                      )
                    }
                    placeholder={
                      `Option ${
                        String.fromCharCode(
                          65 + index
                        )
                      }`
                    }
                    required
                  />

                </div>

              )
            )}

          </div>


          <div className="form-field">

            <label>
              Explanation
            </label>

            <textarea
              name="explanation"
              value={form.explanation}
              onChange={handleChange}
              placeholder="Explain the correct answer"
            />

          </div>


          <div className="action-group">

            <button
              type="submit"
              className="primary-btn"
            >
              {editingQuestion
                ? "Update Question"
                : "Create Question"}
            </button>


            <button
              type="button"
              className="secondary-btn"
              onClick={resetForm}
            >
              Cancel
            </button>

          </div>

        </form>
      )}


      {!selectedQuiz && (

        <div className="empty-panel">

          <h3>
            Select a quiz
          </h3>

          <p>
            Select a quiz above to view and
            manage its questions.
          </p>

        </div>

      )}


      {selectedQuiz && !showForm && (

        <div className="table-wrap">

          <table className="data-table">

            <thead>

              <tr>

                <th>
                  #
                </th>

                <th>
                  Question
                </th>

                <th>
                  Marks
                </th>

                <th>
                  Difficulty
                </th>

                <th>
                  Correct Answer
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {questions.length === 0 ? (

                <tr>

                  <td colSpan="6">

                    No questions added yet.

                  </td>

                </tr>

              ) : (

                questions.map(
                  (question, index) => (

                    <tr
                      key={question.id}
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {question.question_text}
                      </td>

                      <td>
                        {question.marks}
                      </td>

                      <td>
                        {question.difficulty}
                      </td>

                      <td>

                        {question.options?.find(
                          (option) =>
                            option.is_correct
                        )?.option_text ||
                          "Not set"}

                      </td>

                      <td>

                        <div className="action-group">

                          <button
                            className="secondary-btn"
                            onClick={() =>
                              editQuestion(
                                question
                              )
                            }
                          >
                            Edit
                          </button>


                          <button
                            className="danger-outline-btn"
                            onClick={() =>
                              deleteQuestion(
                                question.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      )}

    </section>
  );
}
// =====================================
// CATEGORY MANAGEMENT
// =====================================

function CategoryManagement({ headers }) {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: ""
  });

  const [editingId, setEditingId] = useState(null);


  const loadCategories = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/categories",
        {
          headers
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load categories"
        );
      }

      setCategories(data);

    } catch (error) {

      console.error(error);
      alert(error.message);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadCategories();
  }, []);


  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.name.trim()) {
      alert("Category name is required");
      return;
    }


    try {

      const url = editingId
        ? `http://localhost:5000/api/categories/${editingId}`
        : "http://localhost:5000/api/categories";

      const method = editingId
        ? "PUT"
        : "POST";


      const response = await fetch(url, {
        method,
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong"
        );
      }


      alert(
        editingId
          ? "Category updated successfully"
          : "Category created successfully"
      );


      setForm({
        name: "",
        description: ""
      });

      setEditingId(null);

      loadCategories();


    } catch (error) {

      console.error(error);
      alert(error.message);

    }
  };


  const editCategory = (category) => {

    setEditingId(category.id);

    setForm({
      name: category.name,
      description: category.description || ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  const deleteCategory = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;


    try {

      const response = await fetch(
        `http://localhost:5000/api/categories/${id}`,
        {
          method: "DELETE",
          headers
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete category"
        );
      }


      alert("Category deleted successfully");

      loadCategories();


    } catch (error) {

      console.error(error);
      alert(error.message);

    }
  };


  const cancelEdit = () => {

    setEditingId(null);

    setForm({
      name: "",
      description: ""
    });
  };


  return (

    <section className="panel">

      <div className="panel-header">

        <div>

          <p className="eyebrow">
            MANAGEMENT
          </p>

          <h2>
            Category Management
          </h2>

        </div>

        <span className="count-badge">
          {categories.length} Categories
        </span>

      </div>


      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="admin-form"
      >

        <div>

          <label>
            Category Name
          </label>

          <input
            type="text"
            placeholder="e.g. Python"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
          />

        </div>


        <div>

          <label>
            Description
          </label>

          <textarea
            placeholder="Category description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value
              })
            }
          />

        </div>


        <div className="action-group">

          <button
            type="submit"
            className="primary-btn"
          >
            {editingId
              ? "Update Category"
              : "Create Category"}
          </button>


          {editingId && (

            <button
              type="button"
              className="secondary-btn"
              onClick={cancelEdit}
            >
              Cancel
            </button>

          )}

        </div>

      </form>


      {/* CATEGORY TABLE */}

      <div className="table-wrap">

        <table className="data-table">

          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                Category
              </th>

              <th>
                Description
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {loading ? (

              <tr>

                <td colSpan="4">
                  Loading categories...
                </td>

              </tr>

            ) : categories.length === 0 ? (

              <tr>

                <td colSpan="4">
                  No categories found.
                </td>

              </tr>

            ) : (

              categories.map((category) => (

                <tr key={category.id}>

                  <td>
                    {category.id}
                  </td>

                  <td>
                    <strong>
                      {category.name}
                    </strong>
                  </td>

                  <td>
                    {category.description || "-"}
                  </td>

                  <td>

                    <div className="action-group">

                      <button
                        className="secondary-btn"
                        onClick={() =>
                          editCategory(category)
                        }
                      >
                        Edit
                      </button>


                      <button
                        className="danger-outline-btn"
                        onClick={() =>
                          deleteCategory(category.id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </section>

  );
}
// =====================================
// STAT CARD
// =====================================

function StatCard({
  title,
  value,
}) {

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


export default AdminDashboard;