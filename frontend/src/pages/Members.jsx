import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, UserCheck } from 'lucide-react';
import api from '../utils/api';
import { Card, Avatar, ProgressBar, PageHeader, Spinner, Toast, useToast } from '../components/UI';

export default function Members() {
  const { toast, show: showToast, hide } = useToast();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/tasks'), api.get('/projects')])
      .then(([u, t, p]) => { setUsers(u.data); setTasks(t.data); setProjects(p.data); })
      .catch(() => showToast('Failed to load team data', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const userStats = (uid) => {
    const ut = tasks.filter(t => t.assignee?._id === uid || t.assignee === uid);
    const done = ut.filter(t => t.status === 'done').length;
    const inProgress = ut.filter(t => t.status === 'progress').length;
    const pct = ut.length ? Math.round(done / ut.length * 100) : 0;
    return { total: ut.length, done, inProgress, pct };
  };

  const maxTaskCount = Math.max(...users.map(u => userStats(u._id).total), 1);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spinner size={36} /></div>;

  return (
    <>
      <PageHeader title="Team Members" subtitle="Manage your team and track workload" />

      <div style={{ padding: '24px 28px' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Members', value: users.length, icon: Users, color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
            { label: 'Members', value: users.filter(u => u.role === 'member').length, icon: UserCheck, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
            { label: 'Active Projects', value: projects.length, icon: Users, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
          {/* Member list */}
          <Card>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>All Members ({users.length})</h3>
            {users.map((u, i) => {
              const s = userStats(u._id);
              return (
                <motion.div key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <Avatar user={u} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</span>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>{u.role === 'admin' ? 'Admin' : 'Member'}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{u.email}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}><ProgressBar value={s.pct} color={u.color || '#7c3aed'} height={4} /></div>
                      <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{s.done}/{s.total} tasks</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: u.color || '#7c3aed' }}>{s.pct}%</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>complete</div>
                  </div>
                </motion.div>
              );
            })}
          </Card>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Workload bar chart */}
            <Card>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Active Workload</h3>
              {users.map(u => {
                const s = userStats(u._id);
                const barPct = maxTaskCount ? Math.round(s.total / maxTaskCount * 100) : 0;
                return (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Avatar user={u} size={28} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12 }}>{u.name.split(' ')[0]}</span>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{s.total} tasks</span>
                      </div>
                      <ProgressBar value={barPct} color={u.color || '#7c3aed'} height={5} />
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* Task status breakdown per user */}
            <Card>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Status Breakdown</h3>
              {users.map(u => {
                const s = userStats(u._id);
                return (
                  <div key={u._id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Avatar user={u} size={24} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{u.name.split(' ')[0]}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { label: 'Done', count: s.done, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                        { label: 'Active', count: s.inProgress, color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
                        { label: 'Todo', count: s.total - s.done - s.inProgress, color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
                      ].map(b => (
                        <div key={b.label} style={{ flex: 1, background: b.bg, borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 16, fontWeight: 600, color: b.color, fontFamily: 'Syne, sans-serif' }}>{b.count}</div>
                          <div style={{ fontSize: 10, color: '#64748b' }}>{b.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={hide} />
    </>
  );
}
