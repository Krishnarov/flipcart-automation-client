import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, PackageX, History } from 'lucide-react';
import { getStats, getJobs } from '../api/automation.api.js';
import JobItem from '../components/JobItem';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ purchaseCount: 0, cancelCount: 0 });
    const [jobs, setJobs] = useState([]);
    const [initLoading, setInitLoading] = useState(true);

    const fetchData = async (silent = false) => {
        try {
            const [statsRes, jobsRes] = await Promise.all([
                getStats(),
                getJobs()
            ]);
            setStats(statsRes.data);
            setJobs(jobsRes.data);
        } catch (error) {
            if (!silent) toast.error('Error fetching dashboard data');
            console.error('Error fetching dashboard data');
        } finally {
            if (initLoading) setInitLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div
                    className="glass-card stat-card"
                    onClick={() => navigate('/product-purchase')}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid var(--primary)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Purchased</p>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.purchaseCount}</h2>
                        </div>
                        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '15px', borderRadius: '50%' }}>
                            <ShoppingCart size={32} color="var(--primary)" />
                        </div>
                    </div>
                </div>

                <div
                    className="glass-card stat-card"
                    onClick={() => navigate('/order-cancel')}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid var(--error)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Cancelled</p>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.cancelCount}</h2>
                        </div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '50%' }}>
                            <PackageX size={32} color="var(--error)" />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <History size={24} color="var(--primary)" /> Recent Activity
                </h2>
                {initLoading ? (
                    <Loader />
                ) : jobs.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        No automation jobs found.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {jobs.map(job => (
                            <JobItem key={job._id} job={job} onStatusUpdate={() => fetchData(true)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
