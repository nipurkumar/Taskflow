import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

// ── Avatar ──────────────────────────────────────────────────────────────────
export const Avatar = ({ user, size = 32 }) => (
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
      border: "2px solid rgba(255,255,255,0.1)",
    }}
  >
    {user?.avatar || "?"}
  </div>
);

// ── Button ──────────────────────────────────────────────────────────────────
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  type = "button",
  style = {},
}) => {
  const variants = {
    primary: {
      background: "linear-gradient(135deg,#7c3aed,#2563eb)",
      color: "#fff",
      boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
      border: "none",
    },
    secondary: {
      background: "rgba(255,255,255,0.07)",
      color: "#94a3b8",
      border: "1px solid rgba(255,255,255,0.14)",
    },
    danger: {
      background: "rgba(239,68,68,0.15)",
      color: "#fca5a5",
      border: "1px solid rgba(239,68,68,0.3)",
    },
    ghost: { background: "transparent", color: "#94a3b8", border: "none" },
  };
  const sizes = {
    sm: { padding: "6px 12px", fontSize: 12 },
    md: { padding: "9px 16px", fontSize: 13 },
    lg: { padding: "12px 24px", fontSize: 15 },
  };
  return (
    <motion.button
      type={type}
      whileHover={
        disabled
          ? {}
          : {
              y: -1,
              boxShadow:
                variant === "primary"
                  ? "0 6px 20px rgba(124,58,237,0.4)"
                  : undefined,
            }
      }
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        borderRadius: 10,
        fontFamily: "DM Sans, sans-serif",
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
};

// ── Card ────────────────────────────────────────────────────────────────────
export const Card = ({ children, gradient, style = {}, onClick }) => (
  <motion.div
    whileHover={onClick ? { y: -2, borderColor: "rgba(255,255,255,0.14)" } : {}}
    onClick={onClick}
    style={{
      background: gradient
        ? "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.1))"
        : "rgba(26,26,53,0.6)",
      border: gradient
        ? "1px solid rgba(124,58,237,0.2)"
        : "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: 20,
      backdropFilter: "blur(12px)",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}
  >
    {children}
  </motion.div>
);

// ── Badge ───────────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    todo: { cls: "badge-todo", label: "To Do" },
    progress: { cls: "badge-progress", label: "In Progress" },
    done: { cls: "badge-done", label: "Done" },
  };
  const { cls, label } = map[status] || map.todo;
  return <span className={`badge ${cls}`}>{label}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const map = {
    high: { cls: "badge-high", label: "High" },
    medium: { cls: "badge-medium", label: "Medium" },
    low: { cls: "badge-low", label: "Low" },
  };
  const { cls, label } = map[priority] || map.medium;
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ── Modal ───────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, width = 480 }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          style={{
            background: "rgba(22,22,48,0.97)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 24,
            padding: 28,
            width: "100%",
            maxWidth: width,
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
              }}
            >
              {title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              style={{ padding: 6 }}
            >
              <X size={16} />
            </Button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Form helpers ─────────────────────────────────────────────────────────────
export const FormGroup = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 500,
          color: "#94a3b8",
          marginBottom: 6,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
    )}
    {children}
  </div>
);

export const Input = (props) => <input className="tf-input" {...props} />;
export const Select = ({ children, ...props }) => (
  <select className="tf-input" {...props}>
    {children}
  </select>
);
export const Textarea = (props) => (
  <textarea
    className="tf-input"
    style={{ resize: "vertical", minHeight: 80 }}
    {...props}
  />
);

// ── Progress bar ─────────────────────────────────────────────────────────────
export const ProgressBar = ({
  value,
  color = "linear-gradient(90deg,#7c3aed,#2563eb)",
  height = 6,
}) => (
  <div className="progress-track" style={{ height }}>
    <motion.div
      className="progress-fill"
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(value, 100)}%` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ background: color }}
    />
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
export const Toast = ({ message, type = "success", onClose }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 200,
          background: "rgba(26,26,53,0.97)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderLeft: `3px solid ${type === "success" ? "#10b981" : "#ef4444"}`,
          borderRadius: 12,
          padding: "14px 18px",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          maxWidth: 320,
        }}
      >
        <span
          style={{
            color: type === "success" ? "#6ee7b7" : "#fca5a5",
            fontWeight: 600,
          }}
        >
          {type === "success" ? "✓" : "✕"}
        </span>
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <X size={14} />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Page Header ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div
    style={{
      padding: "20px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(10,10,26,0.5)",
      backdropFilter: "blur(10px)",
      position: "sticky",
      top: 0,
      zIndex: 40,
    }}
  >
    <div>
      <h1
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: 22,
          fontWeight: 700,
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 12,
            color: "#64748b",
            marginTop: 2,
            marginBottom: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
    {actions && (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {actions}
      </div>
    )}
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  bg,
  change,
  positive = true,
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    style={{
      background: "rgba(26,26,53,0.6)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: "18px 20px",
      backdropFilter: "blur(10px)",
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
      }}
    >
      <Icon size={18} color={color} />
    </div>
    <div
      style={{
        fontFamily: "Syne, sans-serif",
        fontSize: 28,
        fontWeight: 700,
        color,
        marginBottom: 4,
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 12, color: "#94a3b8" }}>{label}</div>
    {change && (
      <div
        style={{
          fontSize: 11,
          marginTop: 6,
          color: positive ? "#6ee7b7" : "#fca5a5",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {change}
      </div>
    )}
  </motion.div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
    {Icon && <Icon size={48} style={{ opacity: 0.3, marginBottom: 16 }} />}
    <h3
      style={{
        fontFamily: "Syne, sans-serif",
        fontSize: 18,
        fontWeight: 600,
        color: "#f8fafc",
        marginBottom: 8,
      }}
    >
      {title}
    </h3>
    {description && (
      <p style={{ fontSize: 13, marginBottom: 20 }}>{description}</p>
    )}
    {action}
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 24 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `2px solid rgba(124,58,237,0.3)`,
      borderTopColor: "#7c3aed",
      animation: "spin 0.7s linear infinite",
    }}
  />
);

// ── Tabs ──────────────────────────────────────────────────────────────────────
export const Tabs = ({ tabs, active, onChange }) => (
  <div
    style={{
      display: "flex",
      gap: 4,
      background: "rgba(255,255,255,0.04)",
      borderRadius: 10,
      padding: 3,
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        style={{
          padding: "7px 16px",
          borderRadius: 8,
          fontSize: 13,
          border: "none",
          fontFamily: "DM Sans, sans-serif",
          cursor: "pointer",
          transition: "all 0.2s",
          background:
            active === tab.id ? "rgba(124,58,237,0.3)" : "transparent",
          color: active === tab.id ? "#a78bfa" : "#94a3b8",
          fontWeight: active === tab.id ? 500 : 400,
        }}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// ── useToast hook ─────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";
export const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  const hide = useCallback(() => setToast(null), []);
  return { toast, show, hide };
};
