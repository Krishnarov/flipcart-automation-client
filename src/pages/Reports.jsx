import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, ChevronRight, ExternalLink } from 'lucide-react';
import { getJobs, getJobTasks } from '../api/automation.api.js';

const Reports = () => {
    const { jobId } = useParams();
    const [jobs, setJobs] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(jobId || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await getJobs();
                setJobs(data);
                if (!selectedJobId && data.length > 0) {
                    setSelectedJobId(data[0]._id);
                }
            } catch (error) {
                console.error('Error fetching jobs');
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        if (selectedJobId) {
            const fetchTasks = async () => {
                setLoading(true);
                try {
                    const { data } = await getJobTasks(selectedJobId);
                    setTasks(data);
                } catch (error) {
                    console.error('Error fetching tasks');
                } finally {
                    setLoading(false);
                }
            };
            fetchTasks();
        }
    }, [selectedJobId]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'success': return { color: '#4ade80' };
            case 'failed': return { color: '#f87171' };
            default: return { color: '#fbbf24' };
        }
    };

    return (
        <div className="container">
            <div className="dashboard-grid">
                {/* Job Selection Sidebar */}
                <div className="glass-card" style={{ height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Active History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {jobs.map(job => (
                            <div
                                key={job._id}
                                onClick={() => setSelectedJobId(job._id)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '0.75rem',
                                    cursor: 'pointer',
                                    background: selectedJobId === job._id ? 'rgba(37, 99, 235, 0.1)' : 'var(--glass)',
                                    border: `1px solid ${selectedJobId === job._id ? 'var(--primary)' : 'var(--border)'}`,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '0.875rem', marginBottom: '4px' }}>{job.uploadFile.split('/').pop()}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(job.createdAt).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tasks View */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Automation Logs <ChevronRight size={20} opacity={0.5} /> {tasks.length} Tasks
                    </h2>

                    {loading ? (
                        <div className="glass-card" style={{ textAlign: 'center' }}>Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center' }}>Select a job to view results.</div>
                    ) : (
                        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '15px' }}>Email</th>
                                        <th style={{ padding: '15px' }}>Name</th>
                                        <th style={{ padding: '15px' }}>Location</th>
                                        <th style={{ padding: '15px' }}>Product</th>
                                        <th style={{ padding: '15px' }}>Status</th>
                                        <th style={{ padding: '15px' }}>Remark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map(task => (
                                        <tr key={task._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '15px', fontSize: '0.875rem' }}>{task.email}</td>
                                            <td style={{ padding: '15px', fontSize: '0.875rem' }}>
                                                <div style={{ fontWeight: 600 }}>{task.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.phone}</div>
                                            </td>
                                            <td style={{ padding: '15px', fontSize: '0.875rem' }}>
                                                <div style={{ fontWeight: 600 }}>{task.city}, {task.state} ({task.pincode})</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.address}, {task.landmark}</div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <a href={task.productLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <ExternalLink size={14} /> Link
                                                </a>
                                            </td>
                                            <td style={{ padding: '15px', fontWeight: 600, ...getStatusStyle(task.status) }}>
                                                {task.status.toUpperCase()}
                                            </td>
                                            <td style={{ padding: '15px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {task.reason || '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
