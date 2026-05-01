import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  UserPlus,
  Users,
  CheckSquare,
  LayoutList,
  Columns,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Card,
  Button,
  Modal,
  FormGroup,
  Input,
  Textarea,
  Select,
  Avatar,
  StatusBadge,
  PriorityBadge,
  ProgressBar,
  PageHeader,
  Spinner,
  EmptyState,
  Toast,
  useToast,
  Tabs,
} from "../components/UI";

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const isOverdue = (t) => t.status !== "done" && new Date(t.due) < new Date();

const COLORS = [
  "linear-gradient(90deg,#7c3aed,#2563eb)",
  "linear-gradient(90deg,#06b6d4,#10b981)",
  "linear-gradient(90deg,#ec4899,#f97316)",
  "linear-gradient(90deg,#a78bfa,#ec4899)",
  "linear-gradient(90deg,#f59e0b,#ef4444)",
];

export default function Projects() {
  const { user } = useAuth();
  const { toast, show: showToast, hide } = useToast();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [taskView, setTaskView] = useState("list");

  // Modals
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Forms
  const [projForm, setProjForm] = useState({
    name: "",
    description: "",
    color: COLORS[0],
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignee: "",
    status: "todo",
    priority: "medium",
    due: "",
  });
  const [memberEmail, setMemberEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin =
    user?.role === "admin" ||
    selected?.owner?._id === user?._id ||
    selected?.owner === user?._id;

  useEffect(() => {
    Promise.all([api.get("/projects"), api.get("/tasks"), api.get("/users")])
      .then(([p, t, u]) => {
        setProjects(p.data);
        setTasks(t.data);
        setUsers(u.data);
      })
      .catch(() => showToast("Failed to load data", "error"))
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    const [p, t] = await Promise.all([api.get("/projects"), api.get("/tasks")]);
    setProjects(p.data);
    setTasks(t.data);
    if (selected)
      setSelected(p.data.find((pr) => pr._id === selected._id) || null);
  };

  const createProject = async () => {
    if (!projForm.name.trim()) {
      showToast("Project name required", "error");
      return;
    }
    setSaving(true);
    try {
      await api.post("/projects", projForm);
      await refresh();
      setShowNewProject(false);
      setProjForm({ name: "", description: "", color: COLORS[0] });
      showToast("Project created!");
    } catch (e) {
      showToast(e.response?.data?.message || "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete project and all its tasks?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((ps) => ps.filter((p) => p._id !== id));
      if (selected?._id === id) setSelected(null);
      showToast("Project deleted");
    } catch (e) {
      showToast("Error deleting project", "error");
    }
  };

  const createTask = async () => {
    if (!taskForm.title.trim() || !taskForm.due) {
      showToast("Title and due date required", "error");
      return;
    }
    setSaving(true);
    try {
      await api.post("/tasks", { ...taskForm, project: selected._id });
      await refresh();
      setShowNewTask(false);
      setTaskForm({
        title: "",
        description: "",
        assignee: "",
        status: "todo",
        priority: "medium",
        due: "",
      });
      showToast("Task created!");
    } catch (e) {
      showToast(e.response?.data?.message || "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      setTasks((ts) => ts.map((t) => (t._id === id ? { ...t, status } : t)));
    } catch (e) {
      showToast("Error updating task", "error");
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((ts) => ts.filter((t) => t._id !== id));
      showToast("Task deleted");
    } catch (e) {
      showToast("Error deleting task", "error");
    }
  };

  const addMember = async () => {
    if (!memberEmail.trim()) {
      showToast("Email required", "error");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/projects/${selected._id}/members`, {
        email: memberEmail,
      });
      await refresh();
      setShowAddMember(false);
      setMemberEmail("");
      showToast("Member added!");
    } catch (e) {
      showToast(e.response?.data?.message || "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const projTasks = (pid) =>
    tasks.filter((t) => t.project?._id === pid || t.project === pid);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <Spinner size={36} />
      </div>
    );

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Manage your projects and tasks"
        actions={
          <>
            {selected && isAdmin && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddMember(true)}
                >
                  <UserPlus size={13} />
                  Add Member
                </Button>
                <Button size="sm" onClick={() => setShowNewTask(true)}>
                  <Plus size={13} />
                  New Task
                </Button>
              </>
            )}
            {isAdmin && (
              <Button onClick={() => setShowNewProject(true)}>
                <Plus size={14} />
                New Project
              </Button>
            )}
          </>
        }
      />

      <div style={{ padding: "24px 28px" }}>
        {/* Project Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 14,
            marginBottom: selected ? 24 : 0,
          }}
        >
          {projects.map((p, i) => {
            const pt = projTasks(p._id);
            const done = pt.filter((t) => t.status === "done").length;
            const pct = pt.length ? Math.round((done / pt.length) * 100) : 0;
            const members = p.members || [];
            const isSel = selected?._id === p._id;
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelected(isSel ? null : p)}
                style={{
                  background: isSel
                    ? "rgba(124,58,237,0.12)"
                    : "rgba(26,26,53,0.6)",
                  border: `1px solid ${isSel ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 18,
                  padding: 20,
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  transition: "all 0.25s",
                }}
              >
                {/* Color bar */}
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: p.color || COLORS[0],
                    marginBottom: 16,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: 16,
                      fontWeight: 600,
                      margin: "0 0 6px",
                    }}
                  >
                    {p.name}
                  </h3>
                  {(p.owner?._id === user?._id || p.owner === user?._id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(p._id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    margin: "0 0 14px",
                    lineHeight: 1.5,
                  }}
                >
                  {p.description || "No description"}
                </p>

                <ProgressBar
                  value={pct}
                  color={p.color || COLORS[0]}
                  height={4}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {pct}% complete
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {pt.length} tasks
                    </div>
                  </div>
                  <div style={{ display: "flex" }}>
                    {members.slice(0, 4).map((m, mi) => (
                      <div
                        key={m._id || mi}
                        style={{ marginLeft: mi ? -6 : 0 }}
                      >
                        <Avatar user={m} size={26} />
                      </div>
                    ))}
                    {members.length > 4 && (
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.1)",
                          fontSize: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginLeft: -6,
                          color: "#94a3b8",
                          border: "2px solid rgba(10,10,26,0.8)",
                        }}
                      >
                        +{members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* New project placeholder */}
          {isAdmin && (
            <motion.div
              whileHover={{ borderColor: "rgba(124,58,237,0.4)" }}
              onClick={() => setShowNewProject(true)}
              style={{
                background: "rgba(26,26,53,0.3)",
                border: "1px dashed rgba(255,255,255,0.12)",
                borderRadius: 18,
                padding: 20,
                cursor: "pointer",
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={18} />
              </div>
              <span style={{ fontSize: 13 }}>New Project</span>
            </motion.div>
          )}
        </div>

        {/* Project Detail */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      margin: "0 0 4px",
                    }}
                  >
                    {selected.name}
                  </h2>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                    {selected.description}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setTaskView(taskView === "list" ? "kanban" : "list")
                    }
                  >
                    {taskView === "list" ? (
                      <>
                        <Columns size={13} />
                        Kanban
                      </>
                    ) : (
                      <>
                        <LayoutList size={13} />
                        List
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Members */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                {(selected.members || []).map((m) => (
                  <div
                    key={m._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255,255,255,0.05)",
                      padding: "4px 10px",
                      borderRadius: 100,
                    }}
                  >
                    <Avatar user={m} size={22} />
                    <span style={{ fontSize: 12 }}>
                      {m.name?.split(" ")[0]}
                    </span>
                    {(m._id === selected.owner?._id ||
                      m._id === selected.owner) && (
                      <span
                        className="badge badge-admin"
                        style={{ padding: "1px 6px", fontSize: 9 }}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Tasks */}
              {taskView === "list" ? (
                <TaskListView
                  tasks={projTasks(selected._id)}
                  onStatusChange={updateTaskStatus}
                  onDelete={deleteTask}
                  isAdmin={isAdmin}
                />
              ) : (
                <KanbanView
                  tasks={projTasks(selected._id)}
                  onStatusChange={updateTaskStatus}
                  onDelete={deleteTask}
                  isAdmin={isAdmin}
                />
              )}
            </Card>
          </motion.div>
        )}
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={showNewProject}
        onClose={() => setShowNewProject(false)}
        title="New Project"
      >
        <FormGroup label="Project Name *">
          <Input
            placeholder="My awesome project"
            value={projForm.name}
            onChange={(e) =>
              setProjForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </FormGroup>
        <FormGroup label="Description">
          <Textarea
            placeholder="What's this project about?"
            value={projForm.description}
            onChange={(e) =>
              setProjForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </FormGroup>
        <FormGroup label="Color Theme">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COLORS.map((c) => (
              <div
                key={c}
                onClick={() => setProjForm((f) => ({ ...f, color: c }))}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 6,
                  background: c,
                  cursor: "pointer",
                  border: `2px solid ${projForm.color === c ? "#fff" : "transparent"}`,
                  transition: "border 0.15s",
                }}
              />
            ))}
          </div>
        </FormGroup>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button
            variant="secondary"
            onClick={() => setShowNewProject(false)}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Cancel
          </Button>
          <Button
            onClick={createProject}
            disabled={saving}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {saving ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </Modal>

      {/* New Task Modal */}
      <Modal
        isOpen={showNewTask}
        onClose={() => setShowNewTask(false)}
        title="New Task"
      >
        <FormGroup label="Task Title *">
          <Input
            placeholder="Task title..."
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm((f) => ({ ...f, title: e.target.value }))
            }
          />
        </FormGroup>
        <FormGroup label="Description">
          <Textarea
            placeholder="More details..."
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </FormGroup>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <FormGroup label="Assignee">
            <Select
              value={taskForm.assignee}
              onChange={(e) =>
                setTaskForm((f) => ({ ...f, assignee: e.target.value }))
              }
            >
              <option value="">Unassigned</option>
              {(selected?.members || users).map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Priority">
            <Select
              value={taskForm.priority}
              onChange={(e) =>
                setTaskForm((f) => ({ ...f, priority: e.target.value }))
              }
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </FormGroup>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <FormGroup label="Status">
            <Select
              value={taskForm.status}
              onChange={(e) =>
                setTaskForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="todo">To Do</option>
              <option value="progress">In Progress</option>
              <option value="done">Done</option>
            </Select>
          </FormGroup>
          <FormGroup label="Due Date *">
            <Input
              type="date"
              value={taskForm.due}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setTaskForm((f) => ({ ...f, due: e.target.value }))
              }
            />
          </FormGroup>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button
            variant="secondary"
            onClick={() => setShowNewTask(false)}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Cancel
          </Button>
          <Button
            onClick={createTask}
            disabled={saving}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {saving ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Team Member"
      >
        <FormGroup label="Member Email">
          <Input
            type="email"
            placeholder="colleague@company.com"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
        </FormGroup>
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
          The user must already have a TaskFlow account.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            variant="secondary"
            onClick={() => setShowAddMember(false)}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Cancel
          </Button>
          <Button
            onClick={addMember}
            disabled={saving}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {saving ? "Adding..." : "Add Member"}
          </Button>
        </div>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={hide} />
    </>
  );
}

// ── Task List View ────────────────────────────────────────────────────────────
function TaskListView({ tasks, onStatusChange, onDelete, isAdmin }) {
  if (!tasks.length)
    return (
      <EmptyState
        icon={CheckSquare}
        title="No tasks yet"
        description="Add your first task to get started."
      />
    );
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Task", "Assignee", "Priority", "Status", "Due", ""].map((h) => (
              <th
                key={h}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "#64748b",
                  padding: "8px 12px",
                  textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr
              key={t._id}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <td style={{ padding: "12px", fontSize: 13, fontWeight: 500 }}>
                {t.title}
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  {t.description?.slice(0, 50)}
                </div>
              </td>
              <td style={{ padding: "12px" }}>
                {t.assignee ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <Avatar user={t.assignee} size={24} />
                    <span style={{ fontSize: 12 }}>
                      {t.assignee.name?.split(" ")[0]}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Unassigned
                  </span>
                )}
              </td>
              <td style={{ padding: "12px" }}>
                <PriorityBadge priority={t.priority} />
              </td>
              <td style={{ padding: "12px" }}>
                <select
                  className="tf-input"
                  style={{
                    padding: "4px 28px 4px 8px",
                    fontSize: 11,
                    borderRadius: 6,
                    width: "auto",
                  }}
                  value={t.status}
                  onChange={(e) => onStatusChange(t._id, e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </td>
              <td
                style={{
                  padding: "12px",
                  fontSize: 12,
                  color:
                    isOverdue(t) && t.status !== "done" ? "#fca5a5" : "#64748b",
                }}
              >
                {fmt(t.due)}
              </td>
              <td style={{ padding: "12px" }}>
                {isAdmin && (
                  <button
                    onClick={() => onDelete(t._id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Kanban View ───────────────────────────────────────────────────────────────
function KanbanView({ tasks, onStatusChange, onDelete, isAdmin }) {
  const cols = [
    { status: "todo", label: "To Do", color: "#64748b" },
    { status: "progress", label: "In Progress", color: "#2563eb" },
    { status: "done", label: "Done", color: "#10b981" },
  ];
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}
    >
      {cols.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            style={{
              background: "rgba(17,17,40,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: col.color,
                }}
              >
                {col.label}
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                  fontSize: 11,
                  padding: "2px 7px",
                  borderRadius: 100,
                }}
              >
                {colTasks.length}
              </span>
            </div>
            {colTasks.map((t) => (
              <div
                key={t._id}
                style={{
                  background: "rgba(26,26,53,0.7)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "12px",
                  marginBottom: 8,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                  {t.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    <PriorityBadge priority={t.priority} />
                    <span
                      style={{
                        fontSize: 10,
                        color: isOverdue(t) ? "#fca5a5" : "#64748b",
                      }}
                    >
                      {fmt(t.due)}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {t.assignee && <Avatar user={t.assignee} size={22} />}
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(t._id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#64748b",
                          cursor: "pointer",
                          padding: 2,
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
                {col.status !== "done" && (
                  <button
                    onClick={() =>
                      onStatusChange(
                        t._id,
                        col.status === "todo" ? "progress" : "done",
                      )
                    }
                    style={{
                      marginTop: 8,
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                      color: "#94a3b8",
                      fontSize: 11,
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Move to {col.status === "todo" ? "In Progress" : "Done"} →
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
