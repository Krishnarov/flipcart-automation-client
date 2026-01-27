import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        </div>
    );
};

export default Loader;
