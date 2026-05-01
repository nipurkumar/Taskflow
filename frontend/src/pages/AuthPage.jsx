import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Button, Input, FormGroup, Toast, useToast } from "../components/UI";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const { toast, show: showToast, hide } = useToast();
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) {
          showToast("Name is required", "error");
          return;
        }
        if (form.password.length < 6) {
          showToast("Password must be 6+ characters", "error");
          return;
        }
        await signup(form.name, form.email, form.password);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
      }}
    >
      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "rgba(17,17,40,0.88)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 24,
          padding: 40,
          width: "100%",
          maxWidth: 440,
          backdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg,#7c3aed,#2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <Zap size={24} color="#fff" />
          </div>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 28,
              fontWeight: 800,
              margin: "0 0 6px",
              background: "linear-gradient(135deg,#a78bfa,#60a5fa,#67e8f9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TaskFlow
          </h1>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
            {mode === "login"
              ? "Sign in to your workspace"
              : "Create your workspace"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <FormGroup label="Full Name">
              <div style={{ position: "relative" }}>
                <User
                  size={14}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748b",
                  }}
                />
                <Input
                  placeholder="Your full name"
                  value={form.name}
                  onChange={set("name")}
                  style={{ paddingLeft: 36 }}
                  required
                />
              </div>
            </FormGroup>
          )}

          <FormGroup label="Email">
            <div style={{ position: "relative" }}>
              <Mail
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              />
              <Input
                type="email"
                placeholder={
                  mode === "login" ? "alex@taskflow.io" : "you@company.com"
                }
                value={form.email}
                onChange={set("email")}
                style={{ paddingLeft: 36 }}
                required
              />
            </div>
          </FormGroup>

          <FormGroup label="Password">
            <div style={{ position: "relative" }}>
              <Lock
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              />
              <Input
                type={showPw ? "text" : "password"}
                placeholder={
                  mode === "login" ? "••••••••" : "Min. 6 characters"
                }
                value={form.password}
                onChange={set("password")}
                style={{ paddingLeft: 36, paddingRight: 40 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </FormGroup>

          <Button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "12px 24px",
              marginTop: 4,
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 13,
            color: "#94a3b8",
          }}
        >
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{
              background: "none",
              border: "none",
              color: "#a78bfa",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 13,
              fontFamily: "DM Sans, sans-serif",
              textDecoration: "underline",
            }}
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>

        {mode === "login" && (
          <div
            style={{
              marginTop: 16,
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: 10,
              padding: 12,
              fontSize: 12,
              color: "#a78bfa",
              textAlign: "center",
            }}
          >
            <strong>Demo:</strong> alex@taskflow.io / demo123
          </div>
        )}
      </motion.div>

      <Toast message={toast?.message} type={toast?.type} onClose={hide} />
    </div>
  );
}
