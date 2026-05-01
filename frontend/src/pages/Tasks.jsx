import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Search, Plus, Filter } from "lucide-react";
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
  PageHeader,
  Spinner,
  EmptyState,
  Toast,
  useToast,
} from "../components/UI";

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const isOverdue = (t) => t.status !== "done" && new Date(t.due) < new Date();

const FILTERS = [
  { id: "all", label: "All" },
  { id: "todo", label: "To Do" },
  { id: "progress", label: "In Progress" },
  { id: "done", label: "Done" },
  { id: "overdue", label: "Overdue" },
];

export default function Tasks() {
  const { user } = useAuth();
  const { toast, show: showToast, hide } = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    project: "",
    assignee: "",
    status: "todo",
    priority: "medium",
    due: "",
  });

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    Promise.all([api.get("/tasks"), api.get("/projects"), api.get("/users")])
      .then(([t, p, u]) => {
        setTasks(t.data);
        setProjects(p.data);
        setUsers(u.data);
      })
      .catch(() => showToast("Failed to load tasks", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter((t) => {
    if (filter === "overdue") return isOverdue(t);
    if (filter !== "all" && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      setTasks((ts) => ts.map((t) => (t._id === id ? { ...t, status } : t)));
      if (selectedTask?._id === id) setSelectedTask((s) => ({ ...s, status }));
      showToast("Status updated");
    } catch (e) {
      showToast("Error updating task", "error");
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((ts) => ts.filter((t) => t._id !== id));
      if (selectedTask?._id === id) setSelectedTask(null);
      showToast("Task deleted");
    } catch (e) {
      showToast("Error", "error");
    }
  };

  const createTask = async () => {
    if (!taskForm.title.trim() || !taskForm.project || !taskForm.due) {
      showToast("Title, project and due date are required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/tasks", taskForm);
      setTasks((ts) => [res.data, ...ts]);
      setShowNewTask(false);
      setTaskForm({
        title: "",
        description: "",
        project: "",
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

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    progress: tasks.filter((t) => t.status === "progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
  };

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
        title="My Tasks"
        subtitle="Track all your task assignments"
        actions={
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "7px 12px",
              }}
            >
              <Search size={14} color="#64748b" />
              <input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#f8fafc",
                  fontSize: 13,
                  fontFamily: "DM Sans, sans-serif",
                  width: 180,
                }}
              />
            </div>
            {isAdmin && (
              <Button onClick={() => setShowNewTask(true)}>
                <Plus size={14} />
                New Task
              </Button>
            )}
          </>
        }
      />

      <div style={{ padding: "24px 28px" }}>
        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            padding: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 20,
            width: "fit-content",
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                transition: "all 0.2s",
                background:
                  filter === f.id ? "rgba(124,58,237,0.3)" : "transparent",
                color: filter === f.id ? "#a78bfa" : "#94a3b8",
                fontWeight: filter === f.id ? 500 : 400,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {f.label}
              {counts[f.id] > 0 && (
                <span
                  style={{
                    background:
                      filter === f.id
                        ? "rgba(124,58,237,0.4)"
                        : "rgba(255,255,255,0.1)",
                    borderRadius: 100,
                    padding: "0 5px",
                    fontSize: 10,
                  }}
                >
                  {counts[f.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <Card>
          {filtered.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[
                      "Task",
                      "Project",
                      "Assignee",
                      "Priority",
                      "Status",
                      "Due Date",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          color: "#64748b",
                          padding: "8px 14px",
                          textAlign: "left",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const proj = projects.find(
                      (p) => p._id === (t.project?._id || t.project),
                    );
                    const ov = isOverdue(t);
                    return (
                      <motion.tr
                        key={t._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedTask(t)}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.02)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>
                            {t.title}
                          </div>
                          {t.description && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "#64748b",
                                marginTop: 2,
                              }}
                            >
                              {t.description.slice(0, 50)}
                              {t.description.length > 50 ? "..." : ""}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {proj ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: "#7c3aed",
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ fontSize: 12 }}>{proj.name}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "#64748b" }}>
                              —
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {t.assignee ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                              }}
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
                        <td style={{ padding: "12px 14px" }}>
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <select
                            className="tf-input"
                            style={{
                              padding: "4px 28px 4px 8px",
                              fontSize: 11,
                              borderRadius: 6,
                              width: "auto",
                            }}
                            value={t.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateStatus(t._id, e.target.value);
                            }}
                          >
                            <option value="todo">To Do</option>
                            <option value="progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: 12,
                            color: ov ? "#fca5a5" : "#64748b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ov && t.status !== "done" ? "⚠ " : ""}
                          {fmt(t.due)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={CheckSquare}
              title="No tasks found"
              description={
                search
                  ? "Try a different search term."
                  : "Change the filter or create a new task."
              }
            />
          )}
        </Card>
      </div>

      {/* Task Detail Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || ""}
      >
        {selectedTask && (
          <>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <StatusBadge status={selectedTask.status} />
              <PriorityBadge priority={selectedTask.priority} />
              {isOverdue(selectedTask) && selectedTask.status !== "done" && (
                <span className="badge badge-overdue">Overdue</span>
              )}
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 12,
                fontSize: 13,
                color: "#94a3b8",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              {selectedTask.description || "No description provided."}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {[
                {
                  label: "Project",
                  value:
                    projects.find(
                      (p) =>
                        p._id ===
                        (selectedTask.project?._id || selectedTask.project),
                    )?.name || "—",
                },
                {
                  label: "Due Date",
                  value: fmt(selectedTask.due),
                  red:
                    isOverdue(selectedTask) && selectedTask.status !== "done",
                },
                { label: "Assignee", value: null, user: selectedTask.assignee },
                { label: "Created", value: fmt(selectedTask.createdAt) },
              ].map(({ label, value, red, user: u }) => (
                <div key={label}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#94a3b8",
                      letterSpacing: 0.5,
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </div>
                  {u ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <Avatar user={u} size={24} />
                      <span style={{ fontSize: 13 }}>{u.name}</span>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: 13,
                        color: red ? "#fca5a5" : "#f8fafc",
                      }}
                    >
                      {value}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <FormGroup label="Update Status">
              <Select
                value={selectedTask.status}
                onChange={(e) => updateStatus(selectedTask._id, e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="progress">In Progress</option>
                <option value="done">Done</option>
              </Select>
            </FormGroup>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Button
                variant="secondary"
                onClick={() => setSelectedTask(null)}
                style={{ flex: 1, justifyContent: "center" }}
              >
                Close
              </Button>
              {isAdmin && (
                <Button
                  variant="danger"
                  onClick={() => deleteTask(selectedTask._id)}
                  style={{ justifyContent: "center" }}
                >
                  Delete Task
                </Button>
              )}
            </div>
          </>
        )}
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
        <FormGroup label="Project *">
          <Select
            value={taskForm.project}
            onChange={(e) =>
              setTaskForm((f) => ({ ...f, project: e.target.value }))
            }
          >
            <option value="">Select project...</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </Select>
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
              {users.map((u) => (
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

      <Toast message={toast?.message} type={toast?.type} onClose={hide} />
    </>
  );
}
