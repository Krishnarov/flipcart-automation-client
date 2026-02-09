import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, ExternalLink, RotateCw, Image as ImageIcon, Edit2, X, Save } from 'lucide-react';
import { getJobs, getJobTasks, retryJob, retryTask, updateTaskReason, startJob, stopJob } from '../api/automation.api.js';
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
    const [starting, setStarting] = useState(false);

    // Screenshot Preview State
    const [previewImage, setPreviewImage] = useState(null);

    // Edit Reason State
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [savingReason, setSavingReason] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

    const fetchJobs = async (silent = false) => {
        if (!silent) setJobsLoading(true);
        try {
            const { data } = await getJobs(reportType);
            setJobs(data);
            if (data.length > 0) {
                if (!selectedJobId || !data.some(j => j._id === selectedJobId)) {
                    setSelectedJobId(data[0]._id);
                }
            } else {
                setSelectedJobId('');
                setTasks([]);
            }
        } catch (error) {
            if (!silent) toast.error('Error fetching jobs');
        } finally {
            if (!silent) setJobsLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [reportType]);

    const fetchTasks = async (silent = false) => {
        if (!selectedJobId) return;
        if (!silent) setLoading(true);
        try {
            const { data } = await getJobTasks(selectedJobId);
            setTasks(data);
        } catch (error) {
            if (!silent) toast.error('Error fetching tasks');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [selectedJobId]);

    // Polling for job status when running
    useEffect(() => {
        const interval = setInterval(() => {
            fetchJobs(true);
            fetchTasks(true);
        }, 5000);
        return () => clearInterval(interval);
    }, [reportType, selectedJobId]);

    const handleRetryJob = async () => {
        if (!selectedJobId) return;
        try {
            const { data } = await retryJob(selectedJobId);
            toast.success(data.message);
            fetchJobs(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error retrying job');
        }
    };

    const handleStartPending = async () => {
        if (!selectedJobId) return;
        setStarting(true);
        try {
            const { data } = await startJob(selectedJobId);
            toast.success(data.message);
            fetchJobs(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error starting pending tasks');
        } finally {
            setStarting(false);
        }
    };

    const handleStopJob = async () => {
        if (!selectedJobId) return;
        try {
            const { data } = await stopJob(selectedJobId);
            toast.success(data.message);
            fetchJobs(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error stopping job');
        }
    };

    const handleRetryTask = async (taskId) => {
        try {
            const { data } = await retryTask(taskId, reportType);
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error retrying task');
        }
    };

    const handleSaveReason = async (taskId) => {
        setSavingReason(true);
        try {
            await updateTaskReason(taskId, reportType, editValue);
            setTasks(tasks.map(t => t._id === taskId ? { ...t, reason: editValue } : t));
            setEditingTaskId(null);
            toast.success('Reason updated successfully');
        } catch (error) {
            toast.error('Error updating reason');
        } finally {
            setSavingReason(false);
        }
    };

    const exportToCSV = () => {
        if (tasks.length === 0) return;

        const job = jobs.find(j => j._id === selectedJobId);
        const headers = job.type === 'cancel'
            ? ['Email', 'Order ID', 'Status', 'Reason']
            : ['Email', 'Name', 'Phone', 'Pincode', 'Product Link', "Order ID", 'Status', 'Reason'];

        const csvRows = [
            headers.join(','),
            ...tasks.map(t => {
                if (job.type === 'cancel') {
                    return [t.email, t.orderId, t.status, t.reason].map(v => `"${v || ''}"`).join(',');
                } else {
                    return [t.email, t.name, t.phone, t.pincode, t.productlink, t.orderId, t.status, t.reason].map(v => `"${v || ''}"`).join(',');
                }
            })
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `report-${job?.type || 'automation'}-${selectedJobId}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'success': return { color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)' };
            case 'failed': return { color: '#f87171', background: 'rgba(248, 113, 113, 0.1)' };
            default: return { color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)' };
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
                            {jobs.length === 0 && <div style={{ textAlign: 'center', opacity: 0.5 }}>No records found</div>}
                        </div>
                    )}
                </div>

                {/* Tasks View */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Automation Logs <ChevronRight size={20} opacity={0.5} /> {tasks.length} Tasks
                        </h2>
                        {tasks.length > 0 && (() => {
                            const currentJob = jobs.find(j => j._id === selectedJobId);
                            const isRunning = currentJob?.status === 'running';

                            return (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {isRunning ? (
                                        <button
                                            className="btn-primary"
                                            onClick={handleStopJob}
                                            style={{ padding: '8px 16px', fontSize: '0.8rem', background: '#f87171', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <X size={14} /> Stop Job Now
                                        </button>
                                    ) : (
                                        <>
                                            {tasks.some(t => t.status === 'pending') && (
                                                <button
                                                    className="btn-primary"
                                                    onClick={handleStartPending}
                                                    disabled={starting}
                                                    style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                >
                                                    <RotateCw size={14} className={starting ? 'animate-spin' : ''} /> Resume Pending
                                                </button>
                                            )}
                                            {tasks.some(t => t.status === 'failed') && (
                                                <button className="btn-secondary" onClick={handleRetryJob} style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid #f87171' }}>
                                                    <RotateCw size={14} style={{ marginRight: '5px' }} /> Retry All Failed
                                                </button>
                                            )}
                                        </>
                                    )}
                                    <button className="btn-secondary" onClick={exportToCSV} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                                        Export to CSV
                                    </button>
                                </div>
                            );
                        })()}
                    </div>

                    {loading ? (
                        <div className="glass-card" style={{ padding: '4rem' }}><Loader size={48} /></div>
                    ) : tasks.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center' }}>Select a job to view results.</div>
                    ) : (
                        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '15.px' }}>Target Info</th>
                                            {reportType === 'purchase' && <th style={{ padding: '15px' }}>Location</th>}
                                            <th style={{ padding: '15px' }}>Status</th>
                                            <th style={{ padding: '15px' }}>Reference</th>
                                            <th style={{ padding: '15px' }}>Remark/Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map(task => (
                                            <tr key={task._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{task.email}</div>
                                                    {reportType === 'purchase' ? (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.name} ({task.phone})</div>
                                                    ) : (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order: {task.orderId}</div>
                                                    )}
                                                </td>
                                                {reportType === 'purchase' && (
                                                    <td style={{ padding: '15px', fontSize: '0.8rem' }}>
                                                        <div style={{ color: 'var(--text-muted)' }}>{task.pincode}</div>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{task.addressline1?.substring(0, 30)}...</div>
                                                    </td>
                                                )}
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        ...getStatusStyle(task.status)
                                                    }}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        {/* {task.productlink && (
                                                            <a href={task.productlink} target="_blank" rel="noreferrer" title="View Product" style={{ color: 'var(--text-muted)' }}>
                                                                <ExternalLink size={18} />
                                                            </a>
                                                        )} */}
                                                        {task.screenshot && (
                                                            <button
                                                                onClick={() => setPreviewImage(task.screenshot)}
                                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: 0 }}
                                                                title="View Screenshot"
                                                            >
                                                                <ImageIcon size={18} />
                                                            </button>
                                                        )}
                                                        {task.status === 'failed' && (<>
                                                            <button
                                                                onClick={() => handleRetryTask(task._id)}
                                                                style={{ background: 'none', border: 'none', color: '#f87171', padding: 0 }}
                                                                title="Retry Task"
                                                            >
                                                                <RotateCw size={18} />
                                                            </button>

                                                        </>)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px', fontSize: '0.875rem' }}>
                                                    {editingTaskId === task._id ? (
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                style={{
                                                                    background: 'rgba(0,0,0,0.2)',
                                                                    border: '1px solid var(--primary)',
                                                                    color: 'white',
                                                                    borderRadius: '4px',
                                                                    padding: '4px 8px',
                                                                    fontSize: '0.8rem',
                                                                    width: '100%'
                                                                }}
                                                                autoFocus
                                                            />
                                                            <button onClick={() => handleSaveReason(task._id)} disabled={savingReason} style={{ background: 'var(--primary)', padding: '4px' }}>
                                                                <Save size={14} />
                                                            </button>
                                                            <button onClick={() => setEditingTaskId(null)} style={{ background: 'var(--glass)', padding: '4px' }}>
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', group: 'true' }}>
                                                            <span style={{ opacity: task.reason ? 0.8 : 0.3 }}>{task.reason || 'No remark'}</span>
                                                            <button
                                                                onClick={() => { setEditingTaskId(task._id); setEditValue(task.reason || ''); }}
                                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                                            >
                                                                <Edit2 size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '40px'
                    }}
                    onClick={() => setPreviewImage(null)}
                >
                    <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewImage(null)}
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                right: '-40px',
                                color: 'white',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                padding: '10px'
                            }}
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={`${API_BASE_URL}/${previewImage}`}
                            alt="Screenshot Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '85vh',
                                borderRadius: '8px',
                                border: '4px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
