import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { uploadExcel, getJobs } from '../api/automation.api.js';
import JobItem from '../components/JobItem';

const Dashboard = () => {
    const [file, setFile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const fetchJobs = async () => {
        try {
            const { data } = await getJobs();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs');
        }
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await uploadExcel(formData);
            setMessage({ type: 'success', text: 'File uploaded successfully!' });
            setFile(null);
            fetchJobs();
        } catch (error) {
            setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="container">
            <div className="dashboard-grid">
                {/* Upload Section */}
                <div className="glass-card" style={{ height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Upload size={24} color="var(--primary)" /> New Automation
                    </h2>

                    <form onSubmit={handleUpload}>
                        <div
                            style={{
                                border: '2px dashed var(--border)',
                                borderRadius: '1rem',
                                padding: '2rem',
                                textAlign: 'center',
                                marginBottom: '1.5rem',
                                cursor: 'pointer',
                                background: file ? 'rgba(37, 99, 235, 0.05)' : 'none'
                            }}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <input
                                id="file-input"
                                type="file"
                                hidden
                                accept=".xlsx, .xls"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            <FileSpreadsheet size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p style={{ color: 'var(--text-muted)' }}>
                                {file ? file.name : "Click to select Excel file"}
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%' }}
                            disabled={!file || loading}
                        >
                            {loading ? 'Uploading...' : 'Upload & Prepare'}
                        </button>
                    </form>

                    {message && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#4ade80' : '#f87171'
                        }}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Jobs List Section */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Recent Jobs</h2>
                    {jobs.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            No jobs uploaded yet.
                        </div>
                    ) : (
                        jobs.map(job => (
                            <JobItem key={job._id} job={job} onStatusUpdate={fetchJobs} />
                        ))
                    )}
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
