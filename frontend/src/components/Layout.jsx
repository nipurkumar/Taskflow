import { Outlet, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart2,
  Zap,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/tasks", icon: CheckSquare, label: "My Tasks" },
  { to: "/members", icon: Users, label: "Team" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
];

const Avatar = ({ user, size = 34 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: user?.color || "#7c3aed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: Math.floor(size * 0.35),
      fontWeight: 600,
      flexShrink: 0,
      color: "#fff",
    }}
  >
    {user?.avatar || "?"}
  </div>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      {/* Sidebar */}
      <motion.nav
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: 260,
          minHeight: "100vh",
          background: "rgba(17,17,40,0.75)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#7c3aed,#2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={16} color="#fff" />
          </div>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 18,
              fontWeight: 700,
              background: "linear-gradient(90deg,#a78bfa,#60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TaskFlow
          </span>
        </div>

        {/* Nav label */}
        <div
          style={{
            padding: "0 20px 8px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: "#64748b",
            textTransform: "uppercase",
          }}
        >
          Navigation
        </div>

        {/* Nav items */}
        <div style={{ padding: "0 12px", flex: 1 }}>
          {NAV.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ x: 3 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    marginBottom: 2,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "#a78bfa" : "#94a3b8",
                    background: isActive
                      ? "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(37,99,235,0.15))"
                      : "transparent",
                    position: "relative",
                    transition: "all 0.2s",
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 3,
                        borderRadius: 2,
                        background: "linear-gradient(180deg,#a78bfa,#60a5fa)",
                      }}
                    />
                  )}
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                  {isActive && (
                    <ChevronRight
                      size={12}
                      style={{ marginLeft: "auto", opacity: 0.6 }}
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </div>

        {/* User card / logout */}
        <div
          style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <motion.div
            whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            onClick={logout}
            title="Logout"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              cursor: "pointer",
            }}
          >
            <Avatar user={user} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  textTransform: "capitalize",
                }}
              >
                {user?.role}
              </div>
            </div>
            <LogOut size={14} color="#64748b" />
          </motion.div>
        </div>
      </motion.nav>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: 260,
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
