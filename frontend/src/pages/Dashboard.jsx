import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ListChecks,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Card,
  StatCard,
  ProgressBar,
  StatusBadge,
  PriorityBadge,
  Avatar,
  PageHeader,
  Spinner,
  Toast,
  useToast,
} from "../components/UI";

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const isOverdue = (t) => t.status !== "done" && new Date(t.due) < new Date();

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, show: showToast, hide } = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/tasks"), api.get("/projects")])
      .then(([t, p]) => {
        setTasks(t.data);
        setProjects(p.data);
      })
      .catch(() => showToast("Failed to load data", "error"))
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  };
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const overdue = tasks.filter((t) => isOverdue(t)).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const activeTasks = tasks.filter((t) => t.status !== "done").slice(0, 6);
  const recentActivity = [
    {
      text: "Dashboard loaded successfully",
      time: "Just now",
      color: "#10b981",
    },
    {
      text: `You have ${inProgress} tasks in progress`,
      time: "Now",
      color: "#2563eb",
    },
    {
      text: `${overdue} task${overdue !== 1 ? "s are" : " is"} overdue`,
      time: "Now",
      color: "#ef4444",
    },
    {
      text: `${projects.length} active project${projects.length !== 1 ? "s" : ""}`,
      time: "Now",
      color: "#7c3aed",
    },
  ];

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
        title="Dashboard"
        subtitle={`Good ${greeting()}, ${user?.name?.split(" ")[0]}!`}
      />
      <div style={{ padding: "24px 28px" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <StatCard
            label="Total Tasks"
            value={tasks.length}
            icon={ListChecks}
            color="#7c3aed"
            bg="rgba(124,58,237,0.15)"
            change={`Across ${projects.length} projects`}
          />
          <StatCard
            label="Completed"
            value={done}
            icon={CheckCircle2}
            color="#10b981"
            bg="rgba(16,185,129,0.15)"
            change={`${pct}% completion rate`}
          />
          <StatCard
            label="In Progress"
            value={inProgress}
            icon={Clock}
            color="#2563eb"
            bg="rgba(37,99,235,0.15)"
            change="Active now"
          />
          <StatCard
            label="Overdue"
            value={overdue}
            icon={AlertCircle}
            color={overdue ? "#ef4444" : "#10b981"}
            bg={overdue ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"}
            change={overdue ? "Needs attention" : "All on track"}
            positive={!overdue}
          />
        </div>

        {/* Overall progress */}
        <Card gradient style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
                className="grad-text"
              >
                Overall Progress
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                {done} of {tasks.length} tasks completed
              </div>
            </div>
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 36,
                fontWeight: 800,
                background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {pct}%
            </div>
          </div>
          <ProgressBar
            value={pct}
            height={8}
            color="linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4)"
          />
        </Card>

        {/* Active tasks + sidebar */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}
        >
          {/* Active tasks */}
          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Active Tasks
              </h3>
              <button
                onClick={() => navigate("/tasks")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                }}
              >
                View all <ArrowRight size={13} />
              </button>
            </div>
            {activeTasks.length ? (
              activeTasks.map((t, i) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}
                  >
                    {t.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    <span
                      style={{
                        fontSize: 11,
                        color: isOverdue(t) ? "#fca5a5" : "#64748b",
                        marginLeft: "auto",
                      }}
                    >
                      {fmt(t.due)}
                    </span>
                    {t.assignee && <Avatar user={t.assignee} size={22} />}
                  </div>
                </motion.div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: "#64748b",
                }}
              >
                <CheckCircle2
                  size={32}
                  style={{ opacity: 0.3, marginBottom: 8 }}
                />
                <div>All tasks completed! 🎉</div>
              </div>
            )}
          </Card>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Projects progress */}
            <Card>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 15,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Projects
                </h3>
                <button
                  onClick={() => navigate("/projects")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                  }}
                >
                  View all <ArrowRight size={13} />
                </button>
              </div>
              {projects.map((p) => {
                const ptasks = tasks.filter(
                  (t) => t.project?._id === p._id || t.project === p._id,
                );
                const pdone = ptasks.filter((t) => t.status === "done").length;
                const ppct = ptasks.length
                  ? Math.round((pdone / ptasks.length) * 100)
                  : 0;
                return (
                  <div key={p._id} style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 5,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
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
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {p.name}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        {pdone}/{ptasks.length}
                      </span>
                    </div>
                    <ProgressBar
                      value={ppct}
                      color={
                        p.color || "linear-gradient(90deg,#7c3aed,#2563eb)"
                      }
                      height={4}
                    />
                  </div>
                );
              })}
            </Card>

            {/* Activity feed */}
            <Card>
              <h3
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  margin: "0 0 12px",
                }}
              >
                Recent Activity
              </h3>
              {recentActivity.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom:
                      i < recentActivity.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: a.color,
                      flexShrink: 0,
                      marginTop: 5,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                      {a.text}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}
                    >
                      {a.time}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={hide} />
    </>
  );
}
