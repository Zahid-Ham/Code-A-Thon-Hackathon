export const MISSIONS = [
    {
        id: 'skyfall',
        title: 'Operation Skyfall',
        subtitle: 'Earth Defense',
        description: 'A Category 5 hurricane is forming 48 hours early. Launch a next-gen weather sentinel to save millions of lives.',
        difficulty: 'NORMAL',
        color: '#00F0FF',
        icon: 'Wind',
        excludePayloads: [], // Can filter if needed
        scenarios: [
            {
                id: 'launch_day_001',
                type: 'LAUNCH',
                title: 'Launch Day: Weather Violation',
                description: 'T-Minus 9 minutes. Range Safety reports upper-level wind shear is marginally exceeding limits. The hurricane is approaching fast.',
                context: { location: 'Cape Canaveral', weather: 'Red', pressure: 'Time Critical' },
                choices: [
                    {
                        id: 'launch_now', text: 'Override & Launch',
                        description: 'Trust the vehicle margins. We need those eyes in the sky NOW.',
                        risk: { successChance: 0.50, failureconsequences: 'Vehicle stress fracture.', successconsequences: 'Orbit achieved with structural fatigue.' },
                        outcomeIds: { success: 'launch_success', failure: 'launch_failure' }
                    },
                    {
                        id: 'delay_24h', text: 'Scrub & Recycle',
                        description: 'Wait for the winds to calm, risking the hurricane hitting the pad.',
                        risk: { successChance: 0.95, costImpact: 25, failureconsequences: 'Pad destroyed by storm.', successconsequences: 'Safe launch next day.' },
                        outcomeIds: { success: 'delay_success', failure: 'delay_failure' }
                    }
                ]
            },
            {
                id: 'orbit_insertion_001',
                type: 'ORBIT',
                title: 'Orbital Insertion',
                description: 'The second stage underperformed. Perigee is dangerously low (120km).',
                context: { phase: 'Insertion', status: 'Off-Nominal' },
                choices: [
                    {
                        id: 'nominal_burn', text: 'Standard Burn',
                        description: 'Stick to the plan. Hope momentum carries us.',
                        risk: { successChance: 0.20, fuelCost: 0, failureconsequences: 'Re-entry in 3 orbits.' },
                        outcomeIds: { success: 'orbit_success', failure: 'orbit_fail' }
                    },
                    {
                        id: 'emergency_burn', text: 'Emergency Boost',
                        description: 'Burn reserve fuel to raise orbit immediately.',
                        risk: { successChance: 0.95, fuelCost: 30, failureconsequences: 'Fuel depletion.' },
                        outcomeIds: { success: 'orbit_boost_success', failure: 'orbit_boost_fail' }
                    }
                ]
            },
            {
                id: 'solar_array_stuck',
                type: 'SYSTEM',
                title: 'Power Critical',
                description: 'Solar array deployment stalled at 40%. Batteries are draining fast.',
                context: { power: '42%', trend: 'Dropping' },
                choices: [
                    {
                        id: 'thruster_jolt', text: 'Thruster Jolt',
                        description: 'Pulse RCS thrusters to shake the mechanism loose.',
                        risk: { successChance: 0.60, safetyImpact: -20, failureconsequences: 'Deployment failed.' },
                        outcomeIds: { success: 'array_fixed', failure: 'array_broken' }
                    },
                    {
                        id: 'power_cycle', text: 'Retract & Retry',
                        description: 'Full retraction cycle. Consumes critical battery reserves.',
                        risk: { successChance: 0.85, costImpact: 40, failureconsequences: 'Battery dead.' },
                        outcomeIds: { success: 'array_fixed_cost', failure: 'power_dead' }
                    }
                ]
            }
        ]
    },
    {
        id: 'red_horizon',
        title: 'Red Horizon',
        subtitle: 'Interplanetary Cargo',
        description: 'The Mars colony is critically low on oxygen scrubbers. Deliver the payload or the colony fails.',
        difficulty: 'HARD',
        color: '#FF4400',
        icon: 'Globe',
        scenarios: [
            {
                id: 'mars_transfer',
                type: 'TRANSIT',
                title: 'Trans-Mars Injection',
                description: 'The injection window is closing. A fuel valve is sticking open.',
                context: { location: 'Earth Orbit', distance: '0.0 AU', status: 'Critical' },
                choices: [
                    {
                        id: 'burn_dirty', text: 'Burn With Valve Issue',
                        description: 'Ignore the sensor. We miss this window, they die.',
                        risk: { successChance: 0.40, failureconsequences: 'Engine rich combustion.', successconsequences: 'En-route to Mars.' },
                        outcomeIds: { success: 'tmi_success', failure: 'tmi_failure' }
                    },
                    {
                        id: 'fix_cycle', text: 'Cycle Valves',
                        description: 'Attempt to reset the valve. Takes 30 crucial minutes.',
                        risk: { successChance: 0.80, costImpact: 50, failureconsequences: 'Window missed.' },
                        outcomeIds: { success: 'valve_fixed', failure: 'valve_stuck' }
                    }
                ]
            },
            {
                id: 'mars_capture',
                type: 'ORBIT',
                title: 'Aerobraking Desperado',
                description: 'We arrived too fast. Not enough fuel for propulsive capture. We must skim the atmosphere.',
                context: { location: 'Mars Atmosphere', speed: '5.4 km/s' },
                choices: [
                    {
                        id: 'deep_dip', text: 'Deep Dip (Aggressive)',
                        description: 'Go deeper into atmosphere for maximum braking.',
                        risk: { successChance: 0.30, safetyImpact: -40, failureconsequences: 'Burn up.' },
                        outcomeIds: { success: 'capture_success', failure: 'capture_burn' }
                    },
                    {
                        id: 'shallow_dip', text: 'Shallow Passes',
                        description: 'Multiple passes. Takes weeks, delay supplies.',
                        risk: { successChance: 0.90, scienceReturn: -50, failureconsequences: 'Supplies late.' },
                        outcomeIds: { success: 'slow_capture', failure: 'skip_out' }
                    }
                ]
            },
            {
                id: 'radiation_storm',
                type: 'HAZARD',
                title: 'Solar Flare Inbound',
                description: 'X-Class solar flare detected. High-energy protons will hit in 15 minutes.',
                context: { radiation: 'Extreme', shield: 'Nominal' },
                choices: [
                    {
                        id: 'max_shield', text: 'Max Shielding',
                        description: 'Orient tail-to-sun and power down systems.',
                        risk: { successChance: 0.95, scienceReturn: -30, failureconsequences: 'Minor corruption.' },
                        outcomeIds: { success: 'shield_hold', failure: 'shield_fail' }
                    },
                    {
                        id: 'speed_up', text: 'Outrun the Stream',
                        description: 'Burn reserves to minimize exposure time.',
                        risk: { successChance: 0.30, fuelCost: 40, failureconsequences: 'Engine overheat.' },
                        outcomeIds: { success: 'outrun_success', failure: 'outrun_fail' }
                    }
                ]
            }
        ]
    },
    {
        id: 'deep_impact',
        title: 'Deep Impact',
        subtitle: 'Asteroid Deflection',
        description: 'Asteroid 99942 Apophis has shifted trajectory. Collision probability 15%. Intercept and divert.',
        difficulty: 'EXTREME',
        color: '#A855F7',
        icon: 'Zap',
        scenarios: [
            {
                id: 'intercept_method',
                type: 'INTERCEPT',
                title: 'Kinetic Impactor',
                description: 'We have intercepted the rock. Targeting computer is losing lock due to tumbling.',
                context: { target: 'Apophis', range: '500km' },
                choices: [
                    {
                        id: 'manual_guide', text: 'Manual Terminal Guidance',
                        description: 'Switch to joystick control. High latency (3s).',
                        risk: { successChance: 0.20, failureconsequences: 'Missed target.' },
                        outcomeIds: { success: 'impact_hit', failure: 'impact_miss' }
                    },
                    {
                        id: 'ai_guide', text: 'Trust AI Targeting',
                        description: 'Let the onboard neural net predict the tumble.',
                        risk: { successChance: 0.75, costImpact: 100, failureconsequences: 'AI hallucination.' },
                        outcomeIds: { success: 'impact_hit_ai', failure: 'impact_glance' }
                    }
                ]
            },
            {
                id: 'drift_warning',
                type: 'NAV',
                title: 'Trajectory Drift',
                description: 'The asteroid is outgassing, altering its course. Intercept solution is degrading.',
                context: { deviation: '0.4 deg', propellant: 'Low' },
                choices: [
                    {
                        id: 'correction_burn', text: 'Correction Burn',
                        description: 'Use remaining fuel to realign.',
                        risk: { successChance: 0.90, fuelCost: 20, failureconsequences: 'Fuel out.' },
                        outcomeIds: { success: 'burn_ok', failure: 'burn_empty' }
                    },
                    {
                        id: 'wait_see', text: 'Wait & Recalculate',
                        description: 'Hope the outgassing stops. Risk missing the window.',
                        risk: { successChance: 0.40, failureconsequences: 'Too late.' },
                        outcomeIds: { success: 'drift_stop', failure: 'drift_miss' }
                    }
                ]
            },
            {
                id: 'debris_field',
                type: 'HAZARD',
                title: 'Debris Cloud',
                description: 'The asteroid is shedding rocks. A dense debris field blocks the path.',
                context: { density: 'High', shield: 'Active' },
                choices: [
                    {
                        id: 'evasive', text: 'Evasive Maneuvers',
                        description: 'Complex flying. High pilot skill required.',
                        risk: { successChance: 0.60, safetyImpact: -30, failureconsequences: 'Impact.' },
                        outcomeIds: { success: 'evade_ok', failure: 'evade_hit' }
                    },
                    {
                        id: 'shield_ram', text: 'Shields Max',
                        description: 'Plow through. Risk sensor damage.',
                        risk: { successChance: 0.80, costImpact: 50, failureconsequences: 'Sensor blind.' },
                        outcomeIds: { success: 'ram_ok', failure: 'ram_blind' }
                    }
                ]
            }
        ]
    },
    {
        id: 'void_walker',
        title: 'Void Walker',
        subtitle: 'Rescue Ops',
        description: 'A commercial space station has suffered a hull breach. Crew is stranded in the safe room.',
        difficulty: 'NORMAL',
        color: '#2DD4BF',
        icon: 'Shield',
        scenarios: [
            {
                id: 'docking_danger',
                type: 'DOCKING',
                title: 'High-Spin Docking',
                description: 'The station is venting gas, causing a 4rpm spin. Docking computer rejects the solution.',
                context: { rotation: '4 RPM', debris: 'High' },
                choices: [
                    {
                        id: 'match_spin', text: 'Match Spin & Dock',
                        description: 'Interstellar style. Risky for the pilot.',
                        risk: { successChance: 0.45, safetyImpact: -50 },
                        outcomeIds: { success: 'dock_success', failure: 'collision' }
                    },
                    {
                        id: 'wait_stabilize', text: 'Wait for venting to stop',
                        description: 'Wait it out. Air is running low for the crew.',
                        risk: { successChance: 0.85, scienceReturn: -100 },
                        outcomeIds: { success: 'late_rescue', failure: 'too_late' }
                    }
                ]
            },
            {
                id: 'airlock_jam',
                type: 'SYSTEM',
                title: 'Airlock Malfunction',
                description: 'Heat damage has fused the primary airlock. Crew is trapped inside.',
                context: { oxygen: 'Low', temp: 'Rising' },
                choices: [
                    {
                        id: 'explosive_bolts', text: 'Explosive Bolts',
                        description: 'Blow the hatch. Risky for hull integrity.',
                        risk: { successChance: 0.85, safetyImpact: -40, failureconsequences: 'Hull Breach.' },
                        outcomeIds: { success: 'hatch_open', failure: 'hatch_breach' }
                    },
                    {
                        id: 'laser_cut', text: 'Laser Cutter',
                        description: 'Precise but slow. Oxygen is dropping.',
                        risk: { successChance: 0.60, failureconsequences: 'Suffocation.' },
                        outcomeIds: { success: 'cut_success', failure: 'cut_slow' }
                    }
                ]
            },
            {
                id: 'survivor_critical',
                type: 'MEDICAL',
                title: 'Suit Breach',
                description: 'One survivor has a micro-puncture. Pressure dropping steadily.',
                context: { vitals: 'Unstable', leaking: 'Yes' },
                choices: [
                    {
                        id: 'share_o2', text: 'Share Oxygen',
                        description: 'Connect umbilicals. Limits mobility for both.',
                        risk: { successChance: 0.75, safetyImpact: -20, failureconsequences: 'Both hypoxic.' },
                        outcomeIds: { success: 'share_ok', failure: 'share_fail' }
                    },
                    {
                        id: 'patch_kit', text: 'Emergency Patch',
                        description: 'Use sealant kit. Hard to apply in vacuum.',
                        risk: { successChance: 0.50, failureconsequences: 'Patch failed.' },
                        outcomeIds: { success: 'patch_ok', failure: 'patch_fail' }
                    }
                ]
            }
        ]
    }
];

export const OUTCOMES = {
    launch_success: {
        title: 'Orbit Achieved',
        success: true,
        message: 'The structure groaned under the shear forces, but the guidance computer compensated perfectly. You have successfully deployed the sentinel into a stable polar orbit.',
        stats: { cost: 0, science: 50, safety: -20 },
        whatIf: 'If the shear was 5% higher, the rocket would have folded in half.'
    },
    launch_failure: {
        title: 'Catastrophic Disassembly',
        success: false,
        message: 'Wind shear exceeded structural limits at Max-Q. The vehicle broke apart, raining debris over the Atlantic. The payload is lost.',
        stats: { cost: 200, science: 0, safety: -100 },
        whatIf: 'Waiting would have saved the payload, but lost the launch window.'
    },
    delay_success: {
        title: 'Safe Launch',
        success: true,
        message: 'The storm passed without damaging the pad. We launched the next morning in clear skies, achieving a perfect orbital insertion.',
        stats: { cost: 10, science: 100, safety: 10 },
        whatIf: 'A rushed launch risked a 45% failure rate.'
    },
    delay_failure: {
        title: 'Pad Destroyed',
        success: false,
        message: 'The hurricane intensified overnight. The Category 5 wins tore the gantry apart, destroying the vehicle on the pad before we could launch.',
        stats: { cost: 300, science: 0, safety: -50 },
        whatIf: 'Launching earlier was the only chance to save the mission.'
    },
    // ... ADDING GENERIC OUTCOMES FOR DEMO TO PREVENT CRASHES ...
    orbit_success: { title: 'Stable Orbit', success: true, message: 'Orbit insertion successful within nominal parameters. Telemetry confirms a stable perigee of 185km.', stats: { cost: 0, science: 50, safety: 0 } },
    orbit_fail: { title: 'Burn Up', success: false, message: 'Atmospheric drag overwhelmed the attitude control system. The vehicle tumbled and disintegrated upon re-entry.', stats: { cost: 100, science: 0, safety: -100 } },
    orbit_boost_success: { title: 'Boost Effective', success: true, message: 'The emergency burn successfully raised perigee. Fuel reserves are low, but the mission is saved.', stats: { cost: 20, science: 50, safety: 0 } },
    orbit_boost_fail: { title: 'Fuel Exhausted', success: false, message: 'The burn consumed all propellant before orbit was circularized. the payload re-entered over the Pacific.', stats: { cost: 20, science: 0, safety: -50 } },

    tmi_success: { title: 'En Route', success: true, message: 'The engine held together despite the rich mixture. We are on a high-energy transfer trajectory to Mars.', stats: { cost: 0, science: 100, safety: -10 } },
    tmi_failure: { title: 'Engine Explosion', success: false, message: 'The stuck valve caused a combustion instability. The main engine detonated 40 seconds into the burn.', stats: { cost: 100, science: 0, safety: -100 } },
    valve_fixed: { title: 'Valve Cleared', success: true, message: 'Cycling the valve worked. We ignited late but had enough delta-V to catch the tail end of the window.', stats: { cost: 0, science: 100, safety: 10 } },
    valve_stuck: { title: 'Window Missed', success: false, message: 'The valve remained stuck despite cycling attempts. The trans-Mars injection window has closed.', stats: { cost: 50, science: 0, safety: 0 } },

    capture_success: { title: 'Captured', success: true, message: 'The heat shield glowed white-hot, but held. Friction successfully braked us into a stable Martian orbit.', stats: { cost: 0, science: 200, safety: -30 } },
    capture_burn: { title: 'Burn Through', success: false, message: 'The entry angle was too steep. The heat shield ablated completely, and the orbiter was vaporized.', stats: { cost: 200, science: 0, safety: -100 } },
    slow_capture: { title: 'Orbit Achieved', success: true, message: 'After 30 conservative passes, we have circularized the orbit. Supplies are late, but the cargo looks intact.', stats: { cost: 0, science: 50, safety: 10 } },
    skip_out: { title: 'Skipped Out', success: false, message: 'The entry angle was too shallow. We bounced off the atmosphere like a stone on a lake, lost in deep space.', stats: { cost: 100, science: 0, safety: -50 } },

    impact_hit: { title: 'Target Hit', success: true, message: 'Manual guidance was shaky, but the impactor struck the center of mass. Asteroid deviated by 4000km.', stats: { cost: 0, science: 500, safety: 0 } },
    impact_miss: { title: 'Target Missed', success: false, message: 'The 3-second latency caused a pilot induced oscillation. The impactor flew harmlessly past the target.', stats: { cost: 100, science: 0, safety: 0 } },
    impact_hit_ai: { title: 'AI Lock', success: true, message: 'The neural net perfectly predicted the tumble. Kinetic energy transfer was optimized at 99.8%.', stats: { cost: 0, science: 500, safety: 10 } },
    impact_glance: { title: 'Glancing Blow', success: false, message: 'The AI targeted a protrusion that snapped off. Not enough momentum was transferred to divert the rock.', stats: { cost: 100, science: 20, safety: 0 } },

    dock_success: { title: 'Docked', success: true, message: 'You matched the spin perfectly. The hard lock engaged with a satisfying clunk. Station attitude stabilized.', stats: { cost: 0, science: 100, safety: -20 } },
    collision: { title: 'Collision', success: false, message: 'A slight mismatch in rotation speed caused the docking port to shear. We damaged the station\'s solar array.', stats: { cost: 50, science: 0, safety: -80 } },
    late_rescue: { title: 'Rescued', success: true, message: 'The venting finally stopped. We docked safely, but the crew was suffering from severe CO2 poisoning.', stats: { cost: 0, science: 80, safety: 10 } },
    too_late: { title: 'Too Late', success: false, message: 'We waited too long. By the time we opened the hatch, life support had failed completely.', stats: { cost: 0, science: 0, safety: -100 } },

    array_fixed: { title: 'Array Deployed', success: true, message: 'The violent jolt shattered the ice blocking the hinge. Solar array is deploying to 100%.', stats: { cost: 0, science: 50, safety: -10 } },
    array_broken: { title: 'Mechanism Jammed', success: false, message: 'The thruster pulse bent the deployment arm. The array is permanently stuck at 40% efficiency.', stats: { cost: 100, science: -50, safety: 0 } },
    array_fixed_cost: { title: 'Reset Complete', success: true, message: 'The long retraction cycle cleared the jam. We are back online, but battery life is critical.', stats: { cost: 50, science: 50, safety: 0 } },
    power_dead: { title: 'Batteries Drained', success: false, message: 'The retraction took too long. Main bus voltage dropped below 12V before we could recharge.', stats: { cost: 100, science: 0, safety: 0 } },

    shield_hold: { title: 'Storm weathered', success: true, message: 'By pointing the engine bell at the sun, the thick mass protected our computers. No data loss.', stats: { cost: 0, science: 50, safety: 10 } },
    shield_fail: { title: 'Shield Breach', success: false, message: 'High-energy protons penetrated the main computer core. Navigational data has been corrupted.', stats: { cost: 100, science: -50, safety: -30 } },
    outrun_success: { title: 'Clear Space', success: true, message: 'The high-G burn successfully put distance between us and the particle stream. Radiation levels dropping.', stats: { cost: 50, science: 20, safety: 0 } },
    outrun_fail: { title: 'Engine Overheat', success: false, message: 'Running the engine at 110% triggered a thermal shutdown. We are drifting in the radiation belt.', stats: { cost: 100, science: 0, safety: -60 } },

    burn_ok: { title: 'Course Corrected', success: true, message: 'The burn was perfect. We are back on an intercept course, but fuel tanks are dangerously dry.', stats: { cost: 20, science: 20, safety: 0 } },
    burn_empty: { title: 'Tanks Dry', success: false, message: 'The main engine flamed out 5 seconds early. We do not have enough specific impulse to intercept.', stats: { cost: 50, science: 0, safety: -10 } },
    drift_stop: { title: 'Stabilized', success: true, message: 'The outgassing event was temporary. The asteroid settled back into a predictable orbit on its own.', stats: { cost: 0, science: 50, safety: 0 } },
    drift_miss: { title: 'Lost Target', success: false, message: 'The asteroid continued to accelerate away. We drifted too far to ever catch up.', stats: { cost: 0, science: -100, safety: 0 } },

    evade_ok: { title: 'Clean Flying', success: true, message: 'Incredible piloting! We weaved through the debris field without taking a single hit.', stats: { cost: 0, science: 50, safety: 10 } },
    evade_hit: { title: 'Impact', success: false, message: 'A rock the size of a baseball struck the avionics bay. Multiple systems are offline.', stats: { cost: 50, science: 0, safety: -40 } },
    ram_ok: { title: 'Plowed Through', success: true, message: 'The shields held against the smaller dust. We punched through the cloud with minor scouring.', stats: { cost: 30, science: 20, safety: -10 } },
    ram_blind: { title: 'Sensors Down', success: false, message: 'The high-velocity dust sandblasted our primary camera lens. We are flying blind.', stats: { cost: 100, science: -50, safety: -20 } },

    hatch_open: { title: 'Hatch Blown', success: true, message: 'The explosive bolts fired. The hatch flew off into space. The airlock is damaged, but the crew is out.', stats: { cost: 20, science: 10, safety: -20 } },
    hatch_breach: { title: 'Hull Loss', success: false, message: 'The explosion cracked the station\'s main pressure vessel. We saved the crew but lost the station.', stats: { cost: 100, science: 0, safety: -70 } },
    cut_success: { title: 'Clean Cut', success: true, message: 'The laser sliced through the locking pins. We opened the door manually with 2 minutes of air to spare.', stats: { cost: 0, science: 30, safety: 0 } },
    cut_slow: { title: 'Too Slow', success: false, message: 'The thick alloy took too long to cut. The crew passed out from hypoxia before we could reach them.', stats: { cost: 0, science: 0, safety: -50 } },

    share_ok: { title: 'Both Safe', success: true, message: 'It was a tight squeeze, but the buddy-breathing system worked. Both astronauts made it to the airlock.', stats: { cost: 0, science: 50, safety: 10 } },
    share_fail: { title: 'Panic', success: false, message: 'Restricted movement caused panic. The umbilical tore loose during the struggle.', stats: { cost: 0, science: 0, safety: -40 } },
    patch_ok: { title: 'Sealed', success: true, message: 'The emergency sealant cured instantly in the vacuum. The leak has stopped.', stats: { cost: 0, science: 50, safety: 0 } },
    patch_fail: { title: 'Leak Continues', success: false, message: 'The cold of space froze the sealant before it could bond. Pressure is still dropping.', stats: { cost: 0, science: 0, safety: -80 } }
};
