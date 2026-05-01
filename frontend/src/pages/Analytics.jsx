import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Percent, Layers, AlertTriangle, FolderOpen, TrendingUp, Award } from 'lucide-react';
import api from '../utils/api';
import { Card, Avatar, ProgressBar, PageHeader, Spinner, Toast, useToast } from '../components/UI';

const isOverdue = (t) => t.status !== 'done' && new Date(t.due) < new Date();

// Simple animated bar chart row
const BarRow = ({ label, value, max, color, suffix = '' }) => {
  const pct = max ? Math.round(value / max * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', width: 80, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 100 }} />
      </div>
      <span style={{ fontSize: 11, color: '#94a3b8', width: 28 }}>{value}{suffix}</span>
    </div>
  );
};

// Mini bar chart (weekly)
const WeeklyChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <motion.div initial={{ height: 0 }} animate={{ height: `${Math.round(d.value / max * 70)}px` }}
            transition={{ duration: 0.6, delay: i * 0.07 }}
            style={{ width: '100%', background: color || 'linear-gradient(180deg,#7c3aed,#2563eb)', borderRadius: '4px 4px 0 0', minHeight: 4, opacity: 0.8 }} />
          <span style={{ fontSize: 9, color: '#64748b' }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
};

// Donut chart (SVG)
const DonutChart = ({ segments, size = 120 }) => {
  const r = 45;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      {segments.map((s, i) => {
        const dash = (s.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle key={i} cx="50" cy="50" r={r} fill="none"
            stroke={s.color} strokeWidth="10"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset + circ * 0.25}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="700" fill="#f8fafc" fontFamily="Syne, sans-serif">
        {total}
      </text>
    </svg>
  );
};

export default function Analytics() {
  const { toast, show: showToast, hide } = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/projects'), api.get('/users')])
      .then(([t, p, u]) => { setTasks(t.data); setProjects(p.data); setUsers(u.data); })
      .catch(() => showToast('Failed to load analytics', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const done = tasks.filter(t => t.status === 'done').length;
  const inProg = tasks.filter(t => t.status === 'progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const overdue = tasks.filter(t => isOverdue(t)).length;
  const total = tasks.length;
  const completionRate = total ? Math.round(done / total * 100) : 0;
  const overdueRate = total ? Math.round(overdue / total * 100) : 0;
  const avgPerProject = projects.length ? Math.round(total / projects.length) : 0;

  const byPriority = [
    { label: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
    { label: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { label: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' },
  ];

  const byStatus = [
    { label: 'Done', value: done, color: '#10b981' },
    { label: 'In Progress', value: inProg, color: '#2563eb' },
    { label: 'To Do', value: todo, color: '#64748b' },
  ];

  // Simulated weekly completion data
  const weeklyData = [
    { value: 3 }, { value: 7 }, { value: 5 }, { value: 9 }, { value: 6 }, { value: 8 }, { value: 4 }
  ];

  const topPerformers = [...users].map(u => ({
    ...u,
    done: tasks.filter(t => (t.assignee?._id === u._id || t.assignee === u._id) && t.status === 'done').length,
    total: tasks.filter(t => t.assignee?._id === u._id || t.assignee === u._id).length,
  })).sort((a, b) => b.done - a.done);

  const projectStats = projects.map(p => {
    const pt = tasks.filter(t => t.project?._id === p._id || t.project === p._id);
    const pd = pt.filter(t => t.status === 'done').length;
    return { ...p, total: pt.length, done: pd, pct: pt.length ? Math.round(pd / pt.length * 100) : 0 };
  }).sort((a, b) => b.pct - a.pct);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spinner size={36} /></div>;

  return (
    <>
      <PageHeader title="Analytics" subtitle="Performance insights and team metrics" />
      <div style={{ padding: '24px 28px' }}>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Completion Rate', value: `${completionRate}%`, icon: Percent, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            { label: 'Avg Tasks / Project', value: avgPerProject, icon: Layers, color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
            { label: 'Overdue Rate', value: `${overdueRate}%`, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
            { label: 'Active Projects', value: projects.length, icon: FolderOpen, color: '#2563eb', bg: 'rgba(37,99,235,0.15)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: 'rgba(26,26,53,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '18px 20px', backdropFilter: 'blur(10px)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Status Donut + bars */}
          <Card>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Tasks by Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <DonutChart segments={byStatus} />
              <div style={{ flex: 1 }}>
                {byStatus.map(s => (
                  <BarRow key={s.label} label={s.label} value={s.value} max={total || 1} color={s.color} />
                ))}
                <div style={{ marginTop: 12 }}>
                  {byStatus.map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.label}: {s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Priority distribution */}
          <Card>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Tasks by Priority</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <DonutChart segments={byPriority} />
              <div style={{ flex: 1 }}>
                {byPriority.map(s => (
                  <BarRow key={s.label} label={s.label} value={s.value} max={total || 1} color={s.color} />
                ))}
                <div style={{ marginTop: 12 }}>
                  {byPriority.map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.label}: {s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

          {/* Weekly completions */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <TrendingUp size={16} color="#7c3aed" />
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, margin: 0 }}>Weekly Completions</h3>
            </div>
            <WeeklyChart data={weeklyData} color="linear-gradient(180deg,#7c3aed,#2563eb)" />
            <div style={{ marginTop: 12, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
              {weeklyData.reduce((a, d) => a + d.value, 0)} tasks completed this week
            </div>
          </Card>

          {/* Top performers */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Award size={16} color="#f59e0b" />
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, margin: 0 }}>Top Performers</h3>
            </div>
            {topPerformers.map((u, i) => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 20, fontSize: 12, color: i < 3 ? ['#f59e0b','#94a3b8','#cd7c2f'][i] : '#64748b', fontWeight: 600 }}>#{i + 1}</div>
                <Avatar user={u} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{u.name.split(' ')[0]}</div>
                  <ProgressBar value={u.total ? Math.round(u.done / u.total * 100) : 0} color={u.color || '#7c3aed'} height={3} />
                </div>
                <span style={{ fontSize: 11, color: '#64748b' }}>{u.done}/{u.total}</span>
              </div>
            ))}
          </Card>

          {/* Project progress */}
          <Card>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Project Progress</h3>
            {projectStats.length ? projectStats.map(p => (
              <div key={p._id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{p.pct}%</span>
                </div>
                <ProgressBar value={p.pct} color={p.color || 'linear-gradient(90deg,#7c3aed,#2563eb)'} height={5} />
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>{p.done}/{p.total} tasks done</div>
              </div>
            )) : <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No projects yet</div>}
          </Card>
        </div>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={hide} />
    </>
  );
}
