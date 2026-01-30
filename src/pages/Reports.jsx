import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { getJobs, getJobTasks } from '../api/automation.api.js';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const Reports = () => {
    const { jobId } = useParams();
    const [reportType, setReportType] = useState('purchase');
    const [jobs, setJobs] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(jobId || '');
    const [loading, setLoading] = useState(false);
    const [jobsLoading, setJobsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await getJobs(reportType);
                setJobs(data);
                if (data.length > 0) {
                    setSelectedJobId(data[0]._id);
                } else {
                    setSelectedJobId('');
                    setTasks([]);
                }
            } catch (error) {
                toast.error('Error fetching jobs');
            } finally {
                setJobsLoading(false);
            }
        };
        fetchJobs();
    }, [reportType]);

    useEffect(() => {
        if (selectedJobId) {
            const fetchTasks = async () => {
                setLoading(true);
                try {
                    const { data } = await getJobTasks(selectedJobId);
                    setTasks(data);
                } catch (error) {
                    toast.error('Error fetching tasks');
                } finally {
                    setLoading(false);
                }
            };
            fetchTasks();
        }
    }, [selectedJobId]);

    const exportToCSV = () => {
        if (tasks.length === 0) return;

        const job = jobs.find(j => j._id === selectedJobId);
        const headers = job.type === 'cancel'
            ? ['Email', 'Order ID', 'Status', 'Reason']
            : ['Email', 'Name', 'Phone', 'Pincode', 'City', 'State', 'Product Link', "Order ID", 'Status', 'Reason'];

        const csvRows = [
            headers.join(','),
            ...tasks.map(t => {
                if (job.type === 'cancel') {
                    return [t.email, t.orderId, t.status, t.reason].map(v => `"${v || ''}"`).join(',');
                } else {
                    return [t.email, t.name, t.phone, t.pincode, t.city, t.state, t.productlink, t.orderId, t.status, t.reason].map(v => `"${v || ''}"`).join(',');
                }
            })
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `report-${selectedJobId}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'success': return { color: '#4ade80' };
            case 'failed': return { color: '#f87171' };
            default: return { color: '#fbbf24' };
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '2rem' }}>
                <button
                    className={`btn-${reportType === 'purchase' ? 'primary' : 'secondary'}`}
                    onClick={() => setReportType('purchase')}
                    style={{ flex: 1 }}
                >
                    Purchase Reports
                </button>
                <button
                    className={`btn-${reportType === 'cancel' ? 'primary' : 'secondary'}`}
                    onClick={() => setReportType('cancel')}
                    style={{ flex: 1, color: 'white', background: reportType === 'cancel' ? 'var(--error)' : 'var(--glass)' }}
                >
                    Cancellation Reports
                </button>
            </div>

            <div className="dashboard-grid">
                {/* Job Selection Sidebar */}
                <div className="glass-card" style={{ height: 'fit-content', minHeight: '200px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Active History</h3>
                    {jobsLoading ? (
                        <Loader />
                    ) : (
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
                    )}
                </div>

                {/* Tasks View */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Automation Logs <ChevronRight size={20} opacity={0.5} /> {tasks.length} Tasks
                        </h2>
                        {tasks.length > 0 && (
                            <button className="btn-secondary" onClick={exportToCSV} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                                Export to CSV
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="glass-card" style={{ padding: '4rem' }}><Loader size={48} /></div>
                    ) : tasks.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center' }}>Select a job to view results.</div>
                    ) : (
                        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '15px' }}>Email</th>
                                        {jobs.find(j => j._id === selectedJobId)?.type === 'cancel' ? (
                                            <>
                                                <th style={{ padding: '15px' }}>Order ID</th>
                                            </>
                                        ) : (
                                            <>
                                                <th style={{ padding: '15px' }}>Name</th>
                                                <th style={{ padding: '15px' }}>Location</th>
                                                <th style={{ padding: '15px' }}>Product</th>
                                            </>
                                        )}
                                        <th style={{ padding: '15px' }}>Status</th>
                                        <th style={{ padding: '15px' }}>Remark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map(task => (
                                        <tr key={task._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '15px', fontSize: '0.875rem' }}>{task.email}</td>
                                            {jobs.find(j => j._id === selectedJobId)?.type === 'cancel' ? (
                                                <>
                                                    <td style={{ padding: '15px', fontSize: '0.875rem', fontWeight: 600 }}>{task.orderId}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td style={{ padding: '15px', fontSize: '0.875rem' }}>
                                                        <div style={{ fontWeight: 600 }}>{task.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.phone}</div>
                                                    </td>
                                                    <td style={{ padding: '15px', fontSize: '0.875rem' }}>
                                                        <div style={{ fontWeight: 600 }}>{task.city}, {task.state} ({task.pincode})</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.addressline1 || '--'}, {task.addressline2 || '--'}, {task.landmark}</div>
                                                        {task.alternatephone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Alt: {task.alternatephone}</div>}
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <a href={task.productlink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <ExternalLink size={14} /> Link
                                                        </a>
                                                    </td>
                                                </>
                                            )}
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
