import { Cpu, Gauge, Crosshair } from 'lucide-react';

export const SCENE_SEQUENCE = {
    scrollPages: 14, // Extended for full solar system tour
    damping: 0.2, 
    // Define scroll thresholds for narrative beats
    thresholds: {
        intro: 0.1,
        journeyStart: 0.1,
        journeyEnd: 0.6,
        reflectionStart: 0.6,
        reflectionEnd: 0.85,
        arrivalStart: 0.85
    }
};

// Replaces generic markers with specific solar system bodies to fly by
export const PLANETARY_SYSTEM = [
    {
        name: "Mercury",
        position: [2, 0, -10], // Close pass on right
        size: 0.8,
        color: "#A5A5A5",
        type: "rocky",
        description: "The swift planet. Scorched and cratered.",
        textureType: "crater",
        scrollRange: [0.12, 0.20],
        scanData: {
            temp: "430°C",
            composition: "Metallic",
            gravity: "0.38g",
            hazard: "Extreme Heat"
        }
    },
    {
        name: "Venus",
        position: [-2.5, 1, -20], // Pass on left
        size: 1.5,
        color: "#E6B88A",
        type: "atmosphere",
        description: "Veiled in thick clouds. The morning star.",
        textureType: "cloud",
        scrollRange: [0.23, 0.30],
        scanData: {
            temp: "462°C",
            composition: "CO2/N2",
            gravity: "0.90g",
            hazard: "Acid Rain"
        }
    },
    {
        name: "Mars",
        position: [3, -1, -30], // Pass on right
        size: 1.0,
        color: "#FF6B6B",
        type: "rocky",
        description: "The red planet. Dust storms and rust.",
        textureType: "rust",
        scrollRange: [0.38, 0.48],
        scanData: {
            temp: "-63°C",
            composition: "Iron Oxide",
            gravity: "0.38g",
            hazard: "Dust Storms"
        }
    },
    {
        name: "Jupiter",
        position: [-5, 2, -50], // Distant giant on left
        size: 8, // Huge
        color: "#D4A373",
        type: "gas_giant",
        description: " The King. Storms larger than worlds.",
        textureType: "banded",
        scrollRange: [0.60, 0.70],
        scanData: {
            temp: "-108°C",
            composition: "H2/He",
            gravity: "2.40g",
            hazard: "Radiation"
        }
    },
    {
        name: "Saturn",
        position: [6, -2, -70], // Distant giant on right with rings
        size: 7,
        color: "#F4D03F",
        type: "ringed",
        description: "The Jewel. Adorned with icy rings.",
        textureType: "banded",
        scrollRange: [0.78, 0.88],
        scanData: {
            temp: "-139°C",
            composition: "H2/He",
            gravity: "1.06g",
            hazard: "Ring Debris"
        }
    }
];

// Deprecated generic markers
export const COSMIC_MARKERS = []; 


export const NARRATIVE_TEXT = {
    introMain: "Antariksh me anginat raaz aur rahasya hai…",
    introSub: "SCROLL TO TRAVEL",
    reflection1: "Ham insaan aaj tak sirf kuch hissa hi dekh paaye hai…",
    reflection2: "Aur jaan paaye hai…",
    finale: "ANTARIKSH ANANT HAI.",
    cta: "Explore. Learn. Stay Connected with the Universe.",
    button: "Initialize Systems"
};

export const AUDIO_CONFIG = {
    // These paths assumes files exist. 
    // If not, the system should degrade gracefully (silent or console warning).
    stems: {
        space: '/sounds/space_ambience.mp3',
        cockpit: '/sounds/cockpit_hum.mp3',
        reflection: '/sounds/ethereal_pad.mp3'
    }
};
