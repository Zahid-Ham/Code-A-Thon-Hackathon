module.exports = {
  // STATION
  "25544": {
    name: "ISS (International Space Station)",
    launchDate: "1998-11-20",
    operator: "NASA, Roscosmos, ESA, JAXA, CSA",
    missionType: "Human Spaceflight",
    primaryUse: "Scientific Research",
    realWorldImpact: "Hosts continuous human presence in space, researching microgravity effects on biology and materials.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/International_Space_Station_after_undocking_of_STS-132.jpg/640px-International_Space_Station_after_undocking_of_STS-132.jpg",
    liveStreamUrl: "https://www.youtube.com/watch?v=xRPjKQtRXR8",
    history: "Launched in 1998, the ISS is a modular space station in low Earth orbit. It is a multinational collaborative project involving five participating space agencies.",
    instruments: ["Alpha Magnetic Spectrometer", "Vegetation Production System", "Cold Atom Lab"],
    achievements: "Over 20 years of continuous human occupation; thousands of experiments conducted."
  },
  "48274": {
    name: "Tiangong Space Station",
    launchDate: "2021-04-29",
    operator: "CMSA (China)",
    missionType: "Human Spaceflight",
    primaryUse: "Research Station",
    realWorldImpact: "China's permanent space station proving long-term habitation technology.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Tiangong_space_station_render_%282022%29.png/640px-Tiangong_space_station_render_%282022%29.png",
    history: "The core module Tianhe was launched in 2021, marking the beginning of the verification phase of the Tiangong space station.",
    instruments: ["High Energy Cosmic-Radiation Detection", "Space Solar Telescope"],
    achievements: "First long-term orbital station for China."
  },
  
  // TELESCOPES
  "20580": {
    name: "Hubble Space Telescope",
    launchDate: "1990-04-24",
    operator: "NASA / ESA",
    missionType: "Astronomy",
    primaryUse: "Deep Space Imaging",
    realWorldImpact: "Revolutionized our understanding of the universe, discovering dark energy and imaging distant galaxies.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/HST-SM4.jpeg/640px-HST-SM4.jpeg",
    history: "Launched aboard Discovery (STS-31). Despite an initial mirror flaw, servicing missions corrected the optics, making it one of the most productive scientific instruments ever.",
    instruments: ["Wide Field Camera 3 (WFC3)", "Cosmic Origins Spectrograph (COS)", "Advanced Camera for Surveys (ACS)"],
    achievements: "Determined the rate of expansion of the universe; Discovered that black holes are common in galaxy centers."
  },
  "50463": {
    name: "James Webb Space Telescope",
    // Note: JWST is L2, not usually in TLEs from Earth orbit sources, but if it appears (often as a computed TLE), we have data.
    // CelesTrak often does NOT carry JWST TLEs in standard LEO/GEO files. It's listed separately.
    launchDate: "2021-12-25",
    operator: "NASA / ESA / CSA",
    missionType: "Astronomy",
    primaryUse: "Infrared Astronomy",
    realWorldImpact: "Seeing the first galaxies formed after the Big Bang.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/James_Webb_Space_Telescope_Mirror37.jpg/640px-James_Webb_Space_Telescope_Mirror37.jpg"
  },

  // WEATHER
  "41866": {
    name: "GOES-16 (GOES-East)",
    launchDate: "2016-11-19",
    operator: "NOAA / NASA",
    missionType: "Weather Monitoring",
    primaryUse: "Meteorology",
    realWorldImpact: "Provides critical hurricane tracking and severe weather alerts for the Americas.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/GOES-R_Spacecraft.jpg/640px-GOES-R_Spacecraft.jpg"
  },
  
  // NAVIGATION
  "22659": {
    name: "GPS BIIA-10 (Navstar 35)",
    launchDate: "1993-10-26",
    operator: "US Space Force",
    missionType: "Navigation",
    primaryUse: "Global Positioning",
    realWorldImpact: "Part of the constellation enabling GPS on your phone.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/GPS_Satellite_NASA_art-iif.jpg/640px-GPS_Satellite_NASA_art-iif.jpg"
  },

  // COMMS
  "44713": {
    name: "Starlink-1007",
    launchDate: "2019-11-11",
    operator: "SpaceX",
    missionType: "Communications",
    primaryUse: "Internet Service",
    realWorldImpact: "Providing low-latency internet to remote areas worldwide.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Starlink_Mission_patch.png/480px-Starlink_Mission_patch.png"
  }
};
