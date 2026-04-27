import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import MatrixAnalytics from './MatrixAnalytics';
import TouchPOS from './TouchPOS';
import Tables from './Tables';
import KDS from './KDS';
import MenuManager from './MenuManager';
import WaiterDashboard from './WaiterDashboard';
import SettingsNode from './SettingsNode';
import CRMManager from './CRMManager';
import SmartUpload from './SmartUpload';
import DailyReport from './DailyReport';

const ManagerControlHub = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    const syncHash = () => {
        const role = localStorage.getItem('ro_role') || 'owner';
        const defaultHash = role === 'waiter' ? 'pos' : role === 'chef' ? 'kitchen' : 'dashboard';
        const hash = window.location.hash.substring(1) || defaultHash;
        setActiveSection(hash);
        setLoading(false);
    };

    useEffect(() => {
        syncHash();
        window.addEventListener('hashchange', syncHash);
        // Aggressive sync for component state
        const interval = setInterval(() => {
            const h = window.location.hash.substring(1);
            if (h && h !== activeSection) syncHash();
        }, 100);
        return () => {
            window.removeEventListener('hashchange', syncHash);
            clearInterval(interval);
        };
    }, [activeSection]);

    if (loading) return null;

    const renderSection = () => {
        switch (activeSection) {
            case 'dashboard': return <Dashboard />;
            case 'pos': return <TouchPOS />;
            case 'tables': return <Tables />;
            case 'kitchen': return <KDS />;
            case 'menu': return <MenuManager />;
            case 'analytics': return <MatrixAnalytics />;
            case 'waiter': return <div className="max-w-6xl mx-auto p-10"><WaiterDashboard /></div>;
            case 'settings': return <SettingsNode />;
            case 'upload': return <div className="max-w-6xl mx-auto p-10"><SmartUpload /></div>;
            case 'crm': return <div className="max-w-7xl mx-auto p-10"><CRMManager /></div>;
            case 'reports': return <div className="max-w-7xl mx-auto p-10"><DailyReport /></div>;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="section-hub animate-in fade-in transition-all duration-500">
            {renderSection()}
        </div>
    );
};

export default ManagerControlHub;
