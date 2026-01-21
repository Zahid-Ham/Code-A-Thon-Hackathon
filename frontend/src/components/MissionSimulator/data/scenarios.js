export const SCENARIOS = [
    {
        id: 'launch_day_001',
        type: 'LAUNCH',
        title: 'Launch Day: Weather Violation',
        description: 'T-Minus 9 minutes. Range Safety reports upper-level wind shear is marginally exceeding structural limits (105% of rated load). The window closes in 15 minutes. A Category 5 hurricane is approaching, and this is our last chance to launch the storm-tracking satellite before the launch site is evacuated.',
        context: {
            location: 'Cape Canaveral LC-39A',
            weather: 'Red (Wind Shear)',
            pressure: 'High (Political/Public)'
        },
        choices: [
            {
                id: 'launch_now',
                text: 'Override & Launch',
                description: 'Trust the vehicle structural margins (1.25 safety factor) and proceed. We need those eyes in the sky NOW.',
                risk: {
                    successChance: 0.45,
                    failureconsequences: 'Vehicle disintegration due to aerodynamic stress.',
                    successconsequences: 'Orbit achieved, but airframe structural integrity may be compromised.'
                },
                outcomeIds: {
                    success: 'launch_success_stress',
                    failure: 'launch_failure_explosion'
                }
            },
            {
                id: 'delay_24h',
                text: 'Scrub & Recycle',
                description: 'Call a hold. Detank and aim for tomorrow\'s window, despite the approaching hurricane.',
                risk: {
                    successChance: 0.95,
                    costImpact: 25,
                    failureconsequences: 'Facility damage from hurricane may prevent launch indefinitely.',
                    successconsequences: 'Safe launch once weather clears.'
                },
                outcomeIds: {
                    success: 'delay_success',
                    failure: 'delay_failure_hurricane'
                }
            }
        ]
    },
    {
        id: 'orbit_insertion_002',
        type: 'ORBIT',
        title: 'Orbit Insertion Anomaly',
        description: 'SECO (Second Stage Engine Cutoff) occurred 0.5 seconds early. Perigee is too low (120km). Atmospheric drag will cause re-entry in 3 orbits without intervention.',
        context: {
            phase: 'Insertion',
            target: 'SSO Orbit',
            status: 'Off-Nominal'
        },
        choices: [
            {
                id: 'nominal_burn',
                text: 'Standard Circularization',
                description: 'Stick to the pre-programmed burn duration at apogee. Conserves fuel but risky.',
                risk: {
                    successChance: 0.15,
                    fuelCost: 10,
                    scienceReturn: 'Low',
                },
                outcomeIds: {
                    success: 'orbit_nominal_success',
                    failure: 'orbit_undershoot'
                }
            },
            {
                id: 'emergency_burn',
                text: 'Emergency Raising Burn',
                description: 'Expend reserve fuel to raise perigee immediately. This cuts mission lifespan by 30%.',
                risk: {
                    successChance: 0.90,
                    fuelCost: 40,
                    scienceReturn: 'Reduced Life',
                },
                outcomeIds: {
                    success: 'orbit_salvage',
                    failure: 'orbit_overshoot'
                }
            }
        ]
    },
    {
        id: 'tech_failure_003',
        type: 'FAILURE',
        title: 'Port Solar Array Jam',
        description: 'Telemetry confirms the Port Solar Array has failed to deploy fully. Power generation is at 55%. We cannot run the main radar instrument and the heater simultaneously.',
        context: {
            system: 'Electrical/Mech',
            status: 'Critical',
            temp: 'Falling'
        },
        choices: [
            {
                id: 'force_deploy',
                text: 'The "Centrifuge" Maneuver',
                description: 'Spin the spacecraft rapidly to use centrifugal force to "flick" the array open. High risk of damaging orientation sensors.',
                risk: {
                    successChance: 0.60,
                    failureconsequences: 'Loss of attitude control; mission failure.',
                    successconsequences: 'Array fully deployed, sensors nominal.'
                },
                outcomeIds: {
                    success: 'array_fixed',
                    failure: 'array_broken'
                }
            },
            {
                id: 'thermal_cycling',
                text: 'Thermal Cycling',
                description: 'Rotate the stuck joint in and out of sunlight to expand/contract the metal. Takes 12 hours.',
                risk: {
                    successChance: 0.85,
                    failureconsequences: 'Joint seizes permanently.',
                    successconsequences: 'Slow but safe deployment.'
                },
                outcomeIds: {
                    success: 'thermal_success',
                    failure: 'thermal_failure'
                }
            }
        ]
    },
    {
        id: 'data_corruption_004',
        type: 'SOFTWARE',
        title: 'Radiation Bit-Flip',
        description: 'A high-energy cosmic ray has flipped a bit in the Flight Computer memory. The attitude control system is now in an infinite loop. The satellite is starting to tumble.',
        context: {
            system: 'Avionics',
            status: 'Emergency',
            orientation: 'Tumbling'
        },
        choices: [
            {
                id: 'soft_reboot',
                text: 'Warm Boot',
                description: 'Restart the control software while keeping the core kernel running. Quicker, but might not clear the corrupted memory block.',
                risk: {
                    successChance: 0.40,
                    failureconsequences: 'Persistent tumble; antenna pointing lost.',
                    successconsequences: 'System restored in 2 minutes.'
                },
                outcomeIds: {
                    success: 'reboot_success',
                    failure: 'reboot_failure'
                }
            },
            {
                id: 'hard_reset',
                text: 'Cold Power Cycle',
                description: 'Full power shutdown and restart. Guaranteed to clear memory, but the satellite will be "blind" for 15 minutes during reboot.',
                risk: {
                    successChance: 0.95,
                    failureconsequences: 'None (but high science loss during blackout)',
                    successconsequences: 'System clean, but 15 min of storm data lost.'
                },
                outcomeIds: {
                    success: 'cold_reset_success',
                    failure: 'cold_reset_failure'
                }
            }
        ]
    }
];

export const OUTCOMES = {
    launch_success_stress: {
        title: 'Brave or Lucky?',
        message: 'The vehicle groaned under the loads, but the software held it straight. You achieved orbit! Technical debt is high, but the mission is alive.',
        stats: { cost: 0, science: 100, safety: -20 },
        realLifePrecedent: {
            mission: 'Apollo 12 (1969)',
            detail: 'Struck by lightning twice during launch. The Saturn V continued flying because its control logic was built to handle massive deviations. It was a gamble that NASA might not take today.'
        },
        whatIf: 'If the wind shear had been just 2% higher, the aerodynamic pressure would have exceeded the structural yield point of the second-stage interstage, leading to a catastrophic "Mid-Air Breakup".'
    },
    launch_failure_explosion: {
        title: 'Maximum Dynamic Pressure Failure',
        message: 'The vehicle reached "Max-Q" and the high wind shear caused the rocket to bend beyond its limits. Visual confirmation: Total Vehicle Loss.',
        stats: { cost: 400, science: 0, safety: -100 },
        realLifePrecedent: {
            mission: 'Challenger STS-51L (1986)',
            detail: 'NASA managers ignored weather warnings (cold temperatures affecting O-rings). This lead to a "Normalization of Deviance" where skipping safety rules became standard—until it became fatal.'
        },
        whatIf: 'Had you waited 24 hours, the winds would have died down to safer levels, though the hurricane arrival would have made the ground operations much more difficult.'
    },
    delay_success: {
        title: 'Safety First',
        message: 'A professional decision. The next morning, the "upper winds" were calm. The launch was flawless. You avoided a potential disaster.',
        stats: { cost: 25, science: 100, safety: 10 },
        realLifePrecedent: {
            mission: 'SpaceX CRS-16',
            detail: 'Launches are routinely scrubbed for minor sensor readings. The cost of a scrub (fueling/labor) is roughly 1% of the cost of losing a vehicle.'
        },
        whatIf: 'The "What If" here is a success story—you prioritized the multi-billion dollar asset over political pressure to launch.'
    },
    delay_failure_hurricane: {
        title: 'Hurricane Direct Hit',
        message: 'You waited too long. The hurricane arrived early, damaging the launch tower and the rocket while it was being rolled back to the hangar.',
        stats: { cost: 150, science: 0, safety: -30 },
        realLifePrecedent: {
            mission: 'Artemis I (2022)',
            detail: 'NASA had to weigh the risk of wind shear vs rolling the massive SLS rocket back to the VAB for Hurricane Ian. They successfully rolled it back, but it cost weeks of delay.'
        },
        whatIf: 'If you had launched during the weather violation, you might have either succeeded or exploded. By waiting, you saved the vehicle but lost the mission window.'
    },
    orbit_undershoot: {
        title: 'Atmospheric Drag-Down',
        message: 'The burn was too weak. The satellite hit the upper atmosphere at 7.5km/s and burned up over the Pacific.',
        stats: { cost: 200, science: 0, safety: -50 },
        realLifePrecedent: {
            mission: 'Starlink Group 4-7',
            detail: '40 satellites were lost in 2022 because a solar storm increased atmospheric density. Their orbits were too low (210km) and they couldn\'t overcome the drag.'
        },
        whatIf: 'Increasing the burn duration would have used more fuel, but saved the satellite. Most satellites carry "reserve" fuel specifically for these undershoot scenarios.'
    },
    orbit_salvage: {
        title: 'Mission Salvaged',
        message: 'The emergency burn worked! We are in a stable orbit. Fuel is low, but we can track the hurricane.',
        stats: { cost: 0, science: 70, safety: 10 },
        realLifePrecedent: {
            mission: 'Galileo to Jupiter',
            detail: 'When the main antenna failed, engineers used slow data rates and clever software to salvage 70% of the science from the mission over a decade.'
        },
        whatIf: 'Without this burn, the satellite would have been an expensive shooting star within 48 hours.'
    },
    array_fixed: {
        title: 'Percussive Maintenance',
        message: 'The "Flick" maneuver worked! The array snapped into place. Full power restored.',
        stats: { cost: 0, science: 100, safety: 20 },
        realLifePrecedent: {
            mission: 'Skylab 1 (1973)',
            detail: 'Astronauts had to perform an emergency EVA to "pry" open a solar array stuck by debris. Sometimes mechanical systems need a physical "kick".'
        },
        whatIf: 'A slightly harder spin could have snapped the orientation gyros, leaving the satellite blind and spinning out of control.'
    },
    array_broken: {
        title: 'Structural Failure',
        message: 'The maneuver was too violent. The solar array snapped off entirely. Power is now limited to 20%—essentially a dead satellite.',
        stats: { cost: 100, science: 5, safety: -80 },
        realLifePrecedent: {
            mission: 'Standard Failures',
            detail: 'Mechanical deployments are the second most common cause of satellite failure behind launch explosions.'
        },
        whatIf: 'A more patient approach like "Thermal Cycling" would have taken longer but had a much higher success probability.'
    },
    thermal_success: {
        title: 'Patience Rewarded',
        message: 'After 6 orbits of heating and cooling, the metal joint contracted enough to release the latch. Array deployed!',
        stats: { cost: 0, science: 100, safety: 40 },
        realLifePrecedent: {
            mission: 'Galileo (1991)',
            detail: 'Engineers tried thermal cycling to open the High Gain Antenna. While it didn\'t fully work for Galileo, it is a standard "soft" repair technique.'
        },
        whatIf: 'If the joint had remained stuck, you would have been forced to choose between the "Flick" maneuver or limited science.'
    },
    reboot_success: {
        title: 'Code Defeats Radiation',
        message: 'The warm reboot cleared the corrupted buffer. Systems are nominal!',
        stats: { cost: 0, science: 100, safety: 10 },
        realLifePrecedent: {
            mission: 'Voyager 1 & 2',
            detail: 'Both Voyagers have had multiple "bit flips" in their 45+ year journeys. They use "Watchdog Timers" that automatically reboot the system if it hangs.'
        },
        whatIf: 'Had you not rebooted, the satellite would have tumbled until its batteries died (because the solar cells were no longer pointing at the sun).'
    },
    cold_reset_success: {
        title: 'Clean Slate',
        message: 'A total reset worked. The satellite is stable again. 15 minutes of storm data was lost, but the asset is safe.',
        stats: { cost: 0, science: 90, safety: 20 },
        realLifePrecedent: {
            mission: 'Standard Satellite Ops',
            detail: 'Cold resets are the "Nuclear Option" for software. It clears everything, but you risk "boot failure" where the satellite never wakes up.'
        },
        whatIf: 'During those 15 minutes of "blindness", a critical hurricane intensification could have occurred that we missed.'
    }
};
