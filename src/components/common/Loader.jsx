import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen, size }) => {
    const loaderContent = (
        <div style={{ display: 'flex', justifyContent: 'center', padding: fullScreen ? '0' : '1rem' }}>
            <Loader2 className="animate-spin" size={size} color="var(--primary)" />
        </div>
    );

    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
};

export default Loader;
