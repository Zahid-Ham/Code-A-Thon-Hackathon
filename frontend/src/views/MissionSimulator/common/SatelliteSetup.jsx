import React from 'react';
import { motion } from 'framer-motion';
import { Star, Shield, Wifi, Camera } from 'lucide-react';

const SATELLITE_TYPES = [
    {
        id: 'spy',
        name: 'DarkStar (Recon)',
        description: 'Military-grade reconnaissance. High stealth, critical for intelligence but heavy.',
        stats: { cost: 150000000, fuel: 80, durability: 90 },
        icon: Shield,
        color: '#ff4444'
    },
    {
        id: 'science',
        name: 'Neo-Geo (Research)',
        description: 'Advanced climate monitoring sensors. Delicate instruments.',
        stats: { cost: 80000000, fuel: 100, durability: 40 },
        icon: Star,
        color: '#44ff44'
    },
    {
        id: 'comms',
        name: 'StarLinker (Comms)',
        description: 'High-bandwidth relay station. Needs precise GEO placement.',
        stats: { cost: 120000000, fuel: 120, durability: 60 },
        icon: Wifi,
        color: '#4444ff'
    },
    {
        id: 'telescope',
        name: 'Void Gazer (Optics)',
        description: 'Deep space telescope. Extremely sensitive to vibration.',
        stats: { cost: 500000000, fuel: 60, durability: 20 },
        icon: Camera,
        color: '#ff00ff'
    }
];

export default function SatelliteSetup({ onSelect }) {
    return (
        <div className="satellite-setup-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            <h2 style={{ color: '#00f0ff', marginBottom: '2rem', fontSize: '2rem' }}>SELECT MISSION PAYLOAD</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', flex: 1 }}>
                {SATELLITE_TYPES.map((sat) => (
                    <motion.div
                        key={sat.id}
                        whileHover={{ scale: 1.05, borderColor: sat.color }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(sat)}
                        style={{
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: sat.color }} />

                        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                            <sat.icon size={64} color={sat.color} />
                        </div>

                        <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>{sat.name}</h3>
                        <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.5 }}>{sat.description}</p>

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <StatBar label="Cost" value={sat.stats.cost / 5000000} max={100} color={sat.color} />
                            <StatBar label="Fuel" value={sat.stats.fuel} max={150} color={sat.color} />
                            <StatBar label="Hull" value={sat.stats.durability} max={100} color={sat.color} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

const StatBar = ({ label, value, max, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: '40px', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: '2px' }} />
        </div>
    </div>
);
