import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ClipboardCheck, Clock, FileSpreadsheet, Eye } from 'lucide-react';
import { startJob } from '../api/automation.api.js';
import toast from 'react-hot-toast';

const JobItem = ({ job, onStatusUpdate }) => {
    const handleStart = async () => {
        const loadingToast = toast.loading('Starting job...');
        try {
            await startJob(job._id);
            toast.success('Job started successfully!', { id: loadingToast });
            onStatusUpdate();
        } catch (error) {
            toast.error('Failed to start job', { id: loadingToast });
        }
    };

    const getStatusClass = (status) => {
        return `status-badge status-${status.toLowerCase()}`;
    };

    return (
        <div className="glass-card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                    <FileSpreadsheet size={24} color="var(--primary)" />
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{job.uploadFile.split('/').pop()}</div>
                        <span style={{
                            fontSize: '0.65rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: job.type === 'cancel' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                            color: job.type === 'cancel' ? 'var(--error)' : 'var(--primary)',
                            border: `1px solid ${job.type === 'cancel' ? 'var(--error)' : 'var(--primary)'}`
                        }}>
                            {job.type === 'cancel' ? 'Cancellation' : 'Purchase'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Link to={`/reports/${job._id}`} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Eye size={14} /> View Report
                        </Link>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            <Clock size={12} /> {new Date(job.createdAt).toLocaleString()}
                        </span>
                        <span className={getStatusClass(job.status)} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{job.status}</span>
                    </div>
                </div>
            </div>

            {job.status === 'pending' && (
                <button className="btn-primary" onClick={handleStart} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                    <Play size={16} fill="white" /> Start Job
                </button>
            )}

            {(job.status === 'running' || job.status === 'completed') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <ClipboardCheck size={20} />
                    {job.status === 'running' ? 'Processing...' : 'Completed'}
                </div>
            )}
        </div>
    );
};

export default JobItem;
