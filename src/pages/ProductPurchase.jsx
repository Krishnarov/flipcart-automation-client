import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, ShoppingCart } from 'lucide-react';
import { uploadExcel, getJobs } from '../api/automation.api.js';
import JobItem from '../components/JobItem';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const ProductPurchase = () => {
    const [file, setFile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [initLoading, setInitLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchJobs = async (silent = false) => {
        try {
            const { data } = await getJobs('purchase');
            setJobs(data);
        } catch (error) {
            if (!silent) toast.error('Error fetching jobs');
        } finally {
            if (initLoading) setInitLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(() => fetchJobs(true), 5000);
        return () => clearInterval(interval);
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        const uploadPromise = uploadExcel(formData, 'purchase');

        toast.promise(uploadPromise, {
            loading: 'Uploading Purchase Excel...',
            success: 'File uploaded successfully!',
            error: 'Upload failed.',
        });

        try {
            await uploadPromise;
            setFile(null);
            fetchJobs(true);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShoppingCart size={32} color="var(--primary)" /> Product Purchase
            </h1>

            <div className="dashboard-grid">
                <div className="glass-card" style={{ height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Upload size={24} color="var(--primary)" /> Upload Excel
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
                                {file ? file.name : "Select Excel with Product Details"}
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%' }}
                            disabled={!file || loading}
                        >
                            {loading ? 'Uploading...' : 'Upload & Purchase'}
                        </button>
                    </form>
                </div>

                <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Purchase History</h2>
                    {initLoading ? (
                        <Loader />
                    ) : jobs.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            No purchase jobs yet.
                        </div>
                    ) : (
                        jobs.map(job => (
                            <JobItem key={job._id} job={job} onStatusUpdate={() => fetchJobs(true)} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductPurchase;
