const disasterCatalog = [
  {
    key: "earthquake",
    title: "Earthquake Safety Essentials",
    category: "Natural Disaster",
    level: "Core",
    mediaType: "Video + Guide",
    durationMins: 18,
    before: [
      "Identify sturdy furniture and practice Drop-Cover-Hold.",
      "Keep emergency contact list and torch accessible.",
      "Mark safe exits and open assembly zones."
    ],
    during: [
      "Drop under sturdy table and protect your head.",
      "Stay away from windows and heavy shelves.",
      "Do not rush to exits during active shaking."
    ],
    after: [
      "Evacuate calmly when shaking stops.",
      "Check for injuries and report missing persons.",
      "Expect aftershocks and stay in open safe area."
    ],
    quiz: [
      {
        question: "What is the safest first action indoors during an earthquake?",
        options: ["Run immediately", "Drop-Cover-Hold", "Stand near windows", "Use elevator"],
        answerIndex: 1,
        difficulty: "easy",
        weakArea: "Earthquake First Response",
        explanation: "Drop-Cover-Hold reduces head and neck injury risk from falling objects.",
        tip: "Practice the motion at your desk so it becomes automatic.",
      },
      {
        question: "When should you begin evacuation after an earthquake in class?",
        options: [
          "Immediately while shaking continues",
          "Only after shaking stops and teacher instructs",
          "After collecting all personal belongings",
          "When lifts are available",
        ],
        answerIndex: 1,
        difficulty: "medium",
        weakArea: "Earthquake Evacuation Timing",
        explanation: "Evacuating during active shaking can cause falls and crowd crush; move when instructed.",
        tip: "Prioritize controlled movement over speed.",
      },
      {
        question: "What is the safest location during active shaking?",
        options: ["Near glass windows", "Under sturdy furniture", "Doorway of any room", "On staircase"],
        answerIndex: 1,
        difficulty: "hard",
        weakArea: "Earthquake Shelter Selection",
        explanation: "Sturdy furniture provides impact protection, while windows and staircases increase injury risk.",
        tip: "Identify your nearest sturdy shelter spot in every room.",
      }
    ],
  },
  {
    key: "flood",
    title: "Flood Preparedness and Response",
    category: "Climate Disaster",
    level: "Core",
    mediaType: "Guide + Quiz",
    durationMins: 16,
    before: [
      "Track rainfall alerts and local flood warnings.",
      "Prepare waterproof emergency kit.",
      "Map route to nearest high ground."
    ],
    during: [
      "Move to higher floors and avoid water flow areas.",
      "Do not wade into unknown water depth.",
      "Follow official instructions and school alert protocol."
    ],
    after: [
      "Avoid contaminated water and damaged wiring.",
      "Use boiled or packaged water only.",
      "Document damage for emergency support requests."
    ],
    quiz: [
      {
        question: "Why should flood water be avoided even if it looks shallow?",
        options: ["It may be cold", "It can hide current, debris, or contamination", "It slows movement", "No reason"],
        answerIndex: 1,
        difficulty: "easy",
        weakArea: "Flood Hazard Awareness",
        explanation: "Even shallow water can carry strong currents, debris, and disease-causing contaminants.",
        tip: "Treat all flood water as hazardous unless authorities confirm safety.",
      },
      {
        question: "What is the correct immediate action when flood water enters school campus?",
        options: [
          "Test water depth by walking through",
          "Move to higher level and await instructions",
          "Use electrical devices to improve visibility",
          "Leave campus alone",
        ],
        answerIndex: 1,
        difficulty: "medium",
        weakArea: "Flood Evacuation Decision",
        explanation: "Moving to higher ground with staff coordination minimizes drowning and separation risk.",
        tip: "Follow assigned evacuation routes and stay with your group.",
      },
      {
        question: "After a flood, drinking water should be used only if it is:",
        options: ["Stored in open container", "Clear in color", "Boiled or packaged", "Mixed with tap water"],
        answerIndex: 2,
        difficulty: "hard",
        weakArea: "Post-Flood Health Safety",
        explanation: "Boiled or sealed water reduces exposure to flood-borne pathogens and chemical contamination.",
        tip: "Use a safe-water checklist before reopening classrooms.",
      }
    ],
  },
  {
    key: "fire",
    title: "Fire Emergency Response",
    category: "Urban Hazard",
    level: "Intermediate",
    mediaType: "Video + Drill",
    durationMins: 14,
    before: [
      "Know alarm points and extinguisher locations.",
      "Keep corridors and exits unobstructed.",
      "Participate in evacuation route rehearsal."
    ],
    during: [
      "Raise alarm and inform teacher/safety lead.",
      "Crawl low if smoke is dense.",
      "Use stairs only, never elevators."
    ],
    after: [
      "Assemble and complete roll call.",
      "Do not re-enter until cleared by authorities.",
      "Join post-incident debrief and corrections."
    ],
    quiz: [
      {
        question: "Which route should be used during a building fire evacuation?",
        options: ["Lift", "Nearest stairway", "Window jump", "Any random path"],
        answerIndex: 1,
        difficulty: "easy",
        weakArea: "Fire Evacuation Route",
        explanation: "Stairways remain the safest controlled route when lifts can fail during fires.",
        tip: "Memorize your nearest two staircase exits.",
      },
      {
        question: "If smoke is thick in a corridor, you should:",
        options: ["Run upright", "Crawl low and cover nose/mouth", "Open all doors quickly", "Go back for belongings"],
        answerIndex: 1,
        difficulty: "medium",
        weakArea: "Smoke Navigation",
        explanation: "Cleaner air is closer to the floor; covering nose helps reduce smoke inhalation.",
        tip: "Practice low-crawl movement during drills.",
      },
      {
        question: "What should happen after reaching the fire assembly point?",
        options: ["Re-enter for missing items", "Leave campus immediately", "Complete roll call and await clearance", "Stand near building entrance"],
        answerIndex: 2,
        difficulty: "hard",
        weakArea: "Post-Evacuation Accountability",
        explanation: "Roll call and clearance prevent secondary injuries and help responders locate missing people.",
        tip: "Stay with your roll-call group until all clear is announced.",
      }
    ],
  },
];

module.exports = { disasterCatalog };
