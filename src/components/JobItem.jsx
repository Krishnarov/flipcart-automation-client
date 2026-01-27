import React from 'react';
import { Play, ClipboardCheck, Clock, FileSpreadsheet } from 'lucide-react';
import { startJob } from '../api/automation.api.js';

const JobItem = ({ job, onStatusUpdate }) => {
    const handleStart = async () => {
        try {
            await startJob(job._id);
            onStatusUpdate();
        } catch (error) {
            alert('Failed to start job');
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
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{job.uploadFile.split('/').pop()}</h4>
                    <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} /> {new Date(job.createdAt).toLocaleString()}
                        </span>
                        <span className={getStatusClass(job.status)}>{job.status}</span>
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
