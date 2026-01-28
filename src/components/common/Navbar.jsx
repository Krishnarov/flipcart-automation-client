import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, PackageX, ShoppingCart } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                    FLIPKART<span style={{ color: 'var(--text)' }}>AUTOMATION</span>
                </Link>
            </div>
            <ul className="nav-links">
                <li>
                    <Link to="/dashboard">
                        <LayoutDashboard size={18} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/product-purchase">
                        <ShoppingCart size={18} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Purchase
                    </Link>
                </li>
                <li>
                    <Link to="/order-cancel">
                        <PackageX size={18} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Cancel
                    </Link>
                </li>
                <li>
                    <Link to="/reports">
                        <FileText size={18} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Reports
                    </Link>
                </li>
                <li>
                    <button onClick={handleLogout} style={{ background: 'none', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
