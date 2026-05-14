import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  fetchDisasterModules,
  fetchRandomDisasterQuiz,
  submitRandomDisasterQuiz,
} from "../../services/disasters.js";
import {
  fetchMyQuizResults,
  fetchQuizLeaderboard,
  fetchRevisionPlan,
  submitQuizResult,
} from "../../services/education.js";
import { useAuth } from "../../hooks/useAuth.js";

const disasterIcons = {
  flood: "🌊",
  earthquake: "🌎",
  fire: "🔥",
};

const learningJourneys = [
  {
    id: "flood-journey",
    title: "Flood Response Journey",
    disaster: "flood",
    level: "Core",
    microLessons: [
      { id: "f1", title: "Recognize flood warning signs", durationMins: 2 },
      { id: "f2", title: "Move to safer zones quickly", durationMins: 3 },
      { id: "f3", title: "Post-flood hygiene essentials", durationMins: 2 },
    ],
    checkpoint: {
      question: "When water starts entering your school ground, what is your first action?",
      options: [
        "Check depth by stepping in",
        "Move to higher floor with group",
        "Use electrical devices for visibility",
      ],
      answerIndex: 1,
      explanation: "Moving to higher ground with your group prevents isolation and current-related injuries.",
    },
  },
  {
    id: "earthquake-journey",
    title: "Earthquake Survival Journey",
    disaster: "earthquake",
    level: "Intermediate",
    microLessons: [
      { id: "e1", title: "Drop-Cover-Hold drills", durationMins: 3 },
      { id: "e2", title: "Safe evacuation timing", durationMins: 2 },
      { id: "e3", title: "Aftershock awareness", durationMins: 2 },
    ],
    checkpoint: {
      question: "During active shaking in class, what should you avoid most?",
      options: [
        "Protecting your head",
        "Running to stairs immediately",
        "Staying under sturdy desk",
      ],
      answerIndex: 1,
      explanation: "Stair and corridor rush during shaking causes most school injuries in quake events.",
    },
  },
];

const playbooks = [
  {
    key: "flood",
    label: "Flood",
    risk: "Monsoon + urban waterlogging",
    before: [
      "Identify safe high-ground routes from each classroom.",
      "Store emergency kit: torch, water pouch, whistle, first-aid strip.",
      "Save emergency contacts and school helpline in phone favorites.",
    ],
    during: [
      "Move to upper floors; do not walk through moving water.",
      "Switch off electrical mains if instructed by staff.",
      "Follow teacher roll-call and stay with your assigned group.",
    ],
    after: [
      "Avoid standing water until safety clearance is announced.",
      "Report injuries, contamination, or blocked exits immediately.",
      "Document lessons learned for the next drill debrief.",
    ],
  },
  {
    key: "earthquake",
    label: "Earthquake",
    risk: "Structural vibration and falling objects",
    before: [
      "Practice Drop, Cover, Hold at your desk position.",
      "Keep aisle spaces clear for quick movement after shaking stops.",
      "Know primary and alternate assembly points.",
    ],
    during: [
      "Drop under sturdy furniture and protect head and neck.",
      "Stay away from windows, shelves, and hanging fixtures.",
      "Do not run outside while shaking is active.",
    ],
    after: [
      "Evacuate in rows when instructed; avoid stair rush.",
      "Check buddy pair and report missing students.",
      "Expect aftershocks and remain in open assembly area.",
    ],
  },
  {
    key: "fire",
    label: "Fire",
    risk: "Electrical and lab-related ignition",
    before: [
      "Memorize nearest extinguisher and fire alarm points.",
      "Keep bags and furniture away from exits.",
      "Learn PASS method for extinguisher use in demos.",
    ],
    during: [
      "Activate alarm and inform the nearest teacher.",
      "If smoke is heavy, stay low and cover nose with cloth.",
      "Use stairs only; never use elevators.",
    ],
    after: [
      "Do not re-enter buildings before official clearance.",
      "Attend medical check if exposed to smoke.",
      "Participate in debrief on what slowed evacuation.",
    ],
  },
];

const quickChecks = [
  {
    id: 1,
    question: "What is the first action during an earthquake inside class?",
    answer: "Drop, Cover, and Hold. Do not run while shaking is active.",
    explanation: "This protects head and neck from falling objects and prevents crowd panic.",
  },
  {
    id: 2,
    question: "Why are buddy assignments important in disasters?",
    answer: "They ensure vulnerable students are supported and attendance is verified quickly.",
    explanation: "Buddy systems reduce missing-person risk and speed up emergency accountability.",
  },
  {
    id: 3,
    question: "What should students do after evacuation reaches assembly point?",
    answer: "Stay in assigned group, wait for roll-call, and report missing or injured persons.",
    explanation: "Structured roll-call enables responders to prioritize rescue and medical support faster.",
  },
];

const videoLessons = [
  {
    key: "flood",
    title: "Flood Safety Video Drill",
    videoId: "43M5mZuzHF8",
    fallbackQuery: "flood safety for students emergency preparedness",
    objective: "Learn safe movement, regroup, and post-flood hygiene steps.",
    checkpoints: [
      "Move to higher ground with your class group.",
      "Avoid walking through moving or unclear flood water.",
      "Use only boiled/packaged water after flooding.",
    ],
    checkQuestion: "After watching: what is the safest first move when flood water enters school?",
    checkOptions: [
      "Test the depth by stepping in",
      "Move to higher floor and stay with your group",
      "Wait near electrical panels",
    ],
    checkAnswerIndex: 1,
    checkExplanation: "Early vertical evacuation with group accountability is the safest protocol.",
  },
  {
    key: "earthquake",
    title: "Earthquake Safety Video Drill",
    videoId: "BLEPakj1YTY",
    fallbackQuery: "earthquake drop cover hold safety drill classroom",
    objective: "Practice Drop-Cover-Hold and safe post-shaking evacuation timing.",
    checkpoints: [
      "Drop, Cover, and Hold during active shaking.",
      "Avoid windows, shelves, and stair rush during shaking.",
      "Evacuate only when shaking stops and guidance is given.",
    ],
    checkQuestion: "After watching: which action should be avoided most during active shaking?",
    checkOptions: [
      "Protecting your head under sturdy desk",
      "Running to stairs immediately",
      "Staying low and calm",
    ],
    checkAnswerIndex: 1,
    checkExplanation: "Running during shaking causes falls and crowd injuries in confined exits.",
  },
  {
    key: "fire",
    title: "Fire Evacuation Video Drill",
    videoId: null,
    fallbackQuery: "fire evacuation safety school students stairs smoke",
    objective: "Reinforce alarm, low-smoke movement, and assembly-point discipline.",
    checkpoints: [
      "Raise alarm and alert nearby adults quickly.",
      "Use stairs only and stay low if smoke is present.",
      "Complete roll-call at assembly point before any movement.",
    ],
    checkQuestion: "After watching: what is the safest evacuation route during building fire?",
    checkOptions: [
      "Elevator for faster descent",
      "Nearest stairway",
      "Any random open route",
    ],
    checkAnswerIndex: 1,
    checkExplanation: "Stairways remain the safest route when lifts can fail during fires.",
  },
];

const toVideoEmbedUrl = (lesson, useAlternateSource = false) => {
  if (!useAlternateSource && lesson.videoId) {
    return `https://www.youtube.com/embed/${lesson.videoId}?rel=0&modestbranding=1&playsinline=1`;
  }
  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
    lesson.fallbackQuery || lesson.title
  )}&rel=0&modestbranding=1&playsinline=1`;
};

const toVideoSearchUrl = (lesson) => {
  if (lesson.videoId) {
    return `https://www.youtube.com/watch?v=${lesson.videoId}`;
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    lesson.fallbackQuery || lesson.title
  )}`;
};

const scenarioDeck = {
  flood: {
    title: "Heavy Rainfall Is Flooding Streets Near Campus",
    prompt: "What do you do first?",
    choices: [
      {
        id: "f-a",
        label: "Go outside and test water level",
        consequence: "High risk: hidden currents and contamination can injure you quickly.",
        points: -20,
      },
      {
        id: "f-b",
        label: "Move to higher floor and stay with your group",
        consequence: "Best action: reduces drowning risk and preserves accountability.",
        points: 25,
      },
      {
        id: "f-c",
        label: "Wait alone for further updates",
        consequence: "Delayed action increases exposure and communication breakdown.",
        points: -5,
      },
      {
        id: "f-d",
        label: "Drive out immediately",
        consequence: "Flooded roads create vehicle entrapment and rescue complexity.",
        points: -10,
      },
    ],
  },
  earthquake: {
    title: "Earthquake Strikes During Classroom Session",
    prompt: "What do you do first?",
    choices: [
      {
        id: "e-a",
        label: "Run to the staircase right away",
        consequence: "High injury risk: moving during active shaking causes falls and crush points.",
        points: -20,
      },
      {
        id: "e-b",
        label: "Drop, Cover, and Hold under sturdy desk",
        consequence: "Correct action: protects against debris until shaking stops.",
        points: 25,
      },
      {
        id: "e-c",
        label: "Stand near window to observe",
        consequence: "Glass-shatter risk is severe near windows.",
        points: -15,
      },
      {
        id: "e-d",
        label: "Use elevator to evacuate quickly",
        consequence: "Elevators are unsafe during seismic events due to sudden failures.",
        points: -20,
      },
    ],
  },
  fire: {
    title: "Electrical Fire Starts in the Corridor",
    prompt: "What do you do first?",
    choices: [
      {
        id: "fi-a",
        label: "Collect your belongings then exit",
        consequence: "Delay increases smoke exposure and blocks evacuation flow.",
        points: -15,
      },
      {
        id: "fi-b",
        label: "Alert others and evacuate via stairs",
        consequence: "Correct: fast alert + stairs improves survival outcomes.",
        points: 25,
      },
      {
        id: "fi-c",
        label: "Hide in classroom and wait silently",
        consequence: "Without communication and movement, rescue is delayed.",
        points: -10,
      },
      {
        id: "fi-d",
        label: "Use lift because it is faster",
        consequence: "Elevator failure risk is critical in fire emergencies.",
        points: -20,
      },
    ],
  },
};

const journeyBadges = [
  { id: "badge-1", title: "Disaster Ready", threshold: 80 },
  { id: "badge-2", title: "Quick Responder", threshold: 120 },
  { id: "badge-3", title: "Evacuation Expert", threshold: 160 },
];

const improvementTips = {
  "Flood Hazard Awareness": "Review water-current and contamination signs before attempting movement.",
  "Flood Evacuation Decision": "Practice vertical evacuation routes and team regroup protocols.",
  "Post-Flood Health Safety": "Revise sanitation and safe drinking water checks.",
  "Earthquake First Response": "Repeat Drop-Cover-Hold drill until response is automatic.",
  "Earthquake Evacuation Timing": "Wait for shaking to stop and teacher signal before moving.",
  "Earthquake Shelter Selection": "Map strong shelter points in every classroom.",
  "Fire Evacuation Route": "Memorize two nearest stair exits from each classroom.",
  "Smoke Navigation": "Train low-crawl movement and cloth-filter breathing habit.",
  "Post-Evacuation Accountability": "Practice assembly roll-call and missing-person reporting.",
};

const LearningCenterPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activePlaybook, setActivePlaybook] = useState(playbooks[0].key);
  const [liveModules, setLiveModules] = useState([]);
  const [moduleLoadState, setModuleLoadState] = useState("loading");
  const [locationState, setLocationState] = useState({ status: "pending", lat: null, lon: null });
  const [journeyCompletion, setJourneyCompletion] = useState({});
  const [checkpointChoice, setCheckpointChoice] = useState({});
  const [checkpointFeedback, setCheckpointFeedback] = useState({});
  const [quickOpen, setQuickOpen] = useState({});
  const [authIssue, setAuthIssue] = useState(false);

  const [scenarioScore, setScenarioScore] = useState(0);
  const [scenarioChoiceId, setScenarioChoiceId] = useState("");
  const [activeVideoKey, setActiveVideoKey] = useState(videoLessons[0].key);
  const [watchedVideos, setWatchedVideos] = useState({});
  const [videoCheckChoice, setVideoCheckChoice] = useState({});
  const [videoCheckFeedback, setVideoCheckFeedback] = useState({});
  const [useAlternateVideoSource, setUseAlternateVideoSource] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [quizSaveState, setQuizSaveState] = useState("idle");
  const [quizFeedback, setQuizFeedback] = useState([]);
  const [quizWeakAreas, setQuizWeakAreas] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizHistoryState, setQuizHistoryState] = useState("loading");
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardState, setLeaderboardState] = useState("loading");
  const [revisionPlan, setRevisionPlan] = useState([]);
  const [revisionPlanState, setRevisionPlanState] = useState("loading");
  const [bestScore, setBestScore] = useState(null);
  const [latestScore, setLatestScore] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizQuestionState, setQuizQuestionState] = useState("loading");
  const [quizSessionToken, setQuizSessionToken] = useState("");
  const [quizSessionExpiresAt, setQuizSessionExpiresAt] = useState("");
  const [requestedDifficulty, setRequestedDifficulty] = useState("medium");
  const [streakDays, setStreakDays] = useState(1);
  
  const markAuthIssue = (error) => {
    if (error?.response?.status === 401) {
      setAuthIssue(true);
      logout();
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    const storedAttempts = Number(localStorage.getItem("dpres_learning_quiz_attempts") || "0");
    setQuizAttempts(storedAttempts);

    const streak = Number(localStorage.getItem("dpres_learning_streak") || "1");
    setStreakDays(streak);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadRevisionPlan = async () => {
      setRevisionPlanState("loading");
      try {
        const payload = await fetchRevisionPlan({ contentKey: "learning-center-self-check" });
        if (ignore) return;
        setRevisionPlan(Array.isArray(payload?.schedule) ? payload.schedule : []);
        setRevisionPlanState("ready");
      } catch (error) {
        if (!ignore) {
          markAuthIssue(error);
          setRevisionPlanState("failed");
        }
      }
    };

    loadRevisionPlan();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const onSuccess = (position) => {
      setLocationState({
        status: "enabled",
        lat: Number(position.coords.latitude.toFixed(3)),
        lon: Number(position.coords.longitude.toFixed(3)),
      });
    };

    const onError = () => {
      setLocationState({ status: "blocked", lat: null, lon: null });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: false,
        timeout: 5000,
      });
    } else {
      onError();
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadHistory = async () => {
      setQuizHistoryState("loading");
      try {
        const response = await fetchMyQuizResults();
        if (ignore) return;

        const items = Array.isArray(response?.items) ? response.items : [];
        setQuizHistory(items);

        if (response?.summary) {
          setBestScore(response.summary.bestScore ?? null);
          setLatestScore(response.summary.latestScore ?? null);
          const attemptsFromServer = Number(response.summary.attempts || 0);
          setQuizAttempts(attemptsFromServer);
          localStorage.setItem("dpres_learning_quiz_attempts", String(attemptsFromServer));
        }

        setQuizHistoryState("ready");
      } catch (error) {
        if (!ignore) {
          markAuthIssue(error);
          setQuizHistoryState("failed");
        }
      }
    };

    loadHistory();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const adaptiveDifficulty =
      typeof latestScore === "number" ? (latestScore >= 85 ? "hard" : latestScore >= 60 ? "medium" : "easy") : "easy";

    const loadQuizQuestions = async () => {
      setQuizQuestionState("loading");
      try {
        const response = await fetchRandomDisasterQuiz({ count: 5, difficulty: adaptiveDifficulty });
        if (ignore) return;

        const questions = Array.isArray(response?.quiz) ? response.quiz : [];
        setQuizQuestions(questions);
        setRequestedDifficulty(response?.requestedDifficulty || adaptiveDifficulty);
        setQuizSessionToken(response?.sessionToken || "");
        setQuizSessionExpiresAt(response?.expiresAt || "");
        setQuizAnswers({});
        setQuizFeedback([]);
        setQuizWeakAreas([]);
        setQuizQuestionState(questions.length ? "ready" : "failed");
      } catch (error) {
        if (!ignore) {
          markAuthIssue(error);
          setQuizQuestionState("failed");
        }
      }
    };

    loadQuizQuestions();

    return () => {
      ignore = true;
    };
  }, [latestScore]);

  useEffect(() => {
    let ignore = false;

    const loadLeaderboard = async () => {
      setLeaderboardState("loading");
      try {
        const payload = await fetchQuizLeaderboard({ days: 30, contentKey: "learning-center-self-check" });
        if (ignore) return;
        setLeaderboard(Array.isArray(payload?.leaderboard) ? payload.leaderboard : []);
        setLeaderboardState("ready");
      } catch (error) {
        if (!ignore) {
          markAuthIssue(error);
          setLeaderboardState("failed");
        }
      }
    };

    loadLeaderboard();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadModules = async () => {
      try {
        const items = await fetchDisasterModules();
        if (!ignore) {
          setLiveModules(items);
          setModuleLoadState("ready");
        }
      } catch (error) {
        if (!ignore) {
          markAuthIssue(error);
          setModuleLoadState("failed");
        }
      }
    };

    loadModules();

    return () => {
      ignore = true;
    };
  }, []);

  const selectedPlaybook = useMemo(
    () => playbooks.find((item) => item.key === activePlaybook) || playbooks[0],
    [activePlaybook]
  );

  const selectedScenario = scenarioDeck[activePlaybook] || scenarioDeck.flood;
  const selectedVideoLesson =
    videoLessons.find((lesson) => lesson.key === activeVideoKey) || videoLessons[0];

  const selectedScenarioChoice = useMemo(
    () => selectedScenario.choices.find((choice) => choice.id === scenarioChoiceId) || null,
    [selectedScenario, scenarioChoiceId]
  );

  const totalMicroLessons = learningJourneys.reduce((sum, journey) => sum + journey.microLessons.length, 0);
  const completedMicroLessons = Object.values(journeyCompletion).filter(Boolean).length;
  const watchedCount = Object.values(watchedVideos).filter(Boolean).length;

  const xpPoints =
    completedMicroLessons * 10 +
    watchedCount * 15 +
    quizAttempts * 12 +
    Math.round((latestScore || 0) * 0.35) +
    scenarioScore;
  const earnedBadges = journeyBadges.filter((badge) => xpPoints >= badge.threshold);

  const safetyPercentile = Math.min(98, Math.max(50, 55 + Math.round((xpPoints + (bestScore || 0)) / 8)));

  const adaptiveDifficultyLabel =
    requestedDifficulty === "hard" ? "Advanced Challenge" : requestedDifficulty === "medium" ? "Skill Builder" : "Foundation Mode";

  const confidenceCount = [bestScore || 0, latestScore || 0, scenarioScore + 50].filter((value) => value >= 70).length;

  const likelyLocalRisk = useMemo(() => {
    if (locationState.status !== "enabled") return ["Flood", "Fire"];
    if (typeof locationState.lat !== "number") return ["Flood", "Fire"];
    if (Math.abs(locationState.lat) < 24) return ["Flood", "Heatwave", "Fire"];
    return ["Earthquake", "Fire", "Flood"];
  }, [locationState]);

  const recommendedRevision =
    quizWeakAreas[0]?.area || (latestScore !== null && latestScore < 70 ? "Emergency Communication" : "Scenario Decision Timing");

  const nextJourney =
    learningJourneys.find((journey) =>
      journey.microLessons.some((lesson) => !journeyCompletion[lesson.id])
    ) || learningJourneys[0];

  const journeyProgressPercent =
    totalMicroLessons > 0 ? Math.round((completedMicroLessons / totalMicroLessons) * 100) : 0;

  const onChooseAnswer = (questionId, optionIndex) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const onToggleMicroLesson = (lessonId) => {
    setJourneyCompletion((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const onCheckpointAnswer = (journeyId, optionIndex, correctIndex, explanation) => {
    setCheckpointChoice((prev) => ({ ...prev, [journeyId]: optionIndex }));
    setCheckpointFeedback((prev) => ({
      ...prev,
      [journeyId]: {
        isCorrect: optionIndex === correctIndex,
        explanation,
      },
    }));
  };

  const onChooseScenario = (choice) => {
    setScenarioChoiceId(choice.id);
    setScenarioScore((prev) => Math.max(0, prev + choice.points));
  };

  const onMarkVideoWatched = (key) => {
    setWatchedVideos((prev) => ({ ...prev, [key]: true }));
  };

  const onAnswerVideoCheck = (key, optionIndex) => {
    const lesson = videoLessons.find((item) => item.key === key);
    if (!lesson) return;

    setVideoCheckChoice((prev) => ({ ...prev, [key]: optionIndex }));
    setVideoCheckFeedback((prev) => ({
      ...prev,
      [key]: {
        isCorrect: optionIndex === lesson.checkAnswerIndex,
        explanation: lesson.checkExplanation,
      },
    }));
  };

  const onRefreshQuiz = async () => {
    setQuizQuestionState("loading");
    try {
      const adaptiveDifficulty =
        typeof latestScore === "number" ? (latestScore >= 85 ? "hard" : latestScore >= 60 ? "medium" : "easy") : "easy";
      const response = await fetchRandomDisasterQuiz({ count: 5, difficulty: adaptiveDifficulty });
      const questions = Array.isArray(response?.quiz) ? response.quiz : [];
      setQuizQuestions(questions);
      setRequestedDifficulty(response?.requestedDifficulty || adaptiveDifficulty);
      setQuizSessionToken(response?.sessionToken || "");
      setQuizSessionExpiresAt(response?.expiresAt || "");
      setQuizAnswers({});
      setQuizFeedback([]);
      setQuizWeakAreas([]);
      setQuizQuestionState(questions.length ? "ready" : "failed");
      setQuizSaveState("idle");
    } catch (error) {
      markAuthIssue(error);
      setQuizQuestionState("failed");
    }
  };

  const onSubmitQuiz = async () => {
    if (!quizQuestions.length) {
      setQuizSaveState("incomplete");
      return;
    }

    if (!quizSessionToken) {
      setQuizSaveState("save-failed");
      return;
    }

    const hasAllAnswers = quizQuestions.every((q) => typeof quizAnswers[q.id] === "number");
    if (!hasAllAnswers) {
      setQuizSaveState("incomplete");
      return;
    }

    const newAttempts = quizAttempts + 1;
    setQuizSaveState("saving");

    try {
      const evaluated = await submitRandomDisasterQuiz(
        {
          sessionToken: quizSessionToken,
          answers: quizQuestions.map((q) => ({
            id: q.id,
            selectedIndex: quizAnswers[q.id],
          })),
        }
      );
      const score = Number(evaluated?.score || 0);
      const feedback = Array.isArray(evaluated?.feedback) ? evaluated.feedback : [];
      const weakAreas = Array.isArray(evaluated?.weakAreas) ? evaluated.weakAreas : [];

      setQuizScore(score);
      setQuizFeedback(feedback);
      setQuizWeakAreas(weakAreas);
      setLatestScore(score);
      setBestScore((prev) => (typeof prev === "number" ? Math.max(prev, score) : score));
      setQuizAttempts(newAttempts);
      localStorage.setItem("dpres_learning_quiz_attempts", String(newAttempts));

      const today = new Date().toISOString().slice(0, 10);
      const lastDay = localStorage.getItem("dpres_learning_last_day");
      if (lastDay !== today) {
        const nextStreak = lastDay ? streakDays + 1 : streakDays;
        setStreakDays(nextStreak);
        localStorage.setItem("dpres_learning_streak", String(nextStreak));
        localStorage.setItem("dpres_learning_last_day", today);
      }

      const saved = await submitQuizResult({
        contentKey: "learning-center-self-check",
        score,
        attempts: newAttempts,
        difficulty: requestedDifficulty,
        weakAreas: weakAreas.map((item) => item.area),
      });
      setQuizHistory((prev) => [saved, ...prev].slice(0, 5));
      setQuizSaveState("saved");

      try {
        const payload = await fetchRevisionPlan({ contentKey: "learning-center-self-check" });
        setRevisionPlan(Array.isArray(payload?.schedule) ? payload.schedule : []);
        setRevisionPlanState("ready");
      } catch (refreshError) {
        markAuthIssue(refreshError);
        setRevisionPlanState("failed");
      }
    } catch (error) {
      if (error?.response?.status === 429) {
        setQuizSaveState("rate-limited");
      } else {
          markAuthIssue(error);
          setQuizSaveState("save-failed");
      }
    }
  };

  return (
    <section className="space-y-5">
      <article className="glass-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="page-title">Your Safety Journey</h1>
            <p className="page-subtitle mt-0">
              Duolingo-style micro learning meets simulation decision training for life-saving preparedness.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
              XP {xpPoints} • Streak {streakDays} days
            </span>
            <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
              You are {safetyPercentile}% safer than average users
            </span>
          </div>
        </div>
      </article>
      {authIssue && (
        <article className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <p className="text-sm text-rose-200">
            Your session has expired or you are not authenticated. Please log in again to load live modules, quiz pool,
            leaderboard, and revision plan.
          </p>
        </article>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="glass-card p-5 md:p-6">
          <h2 className="mb-2 text-sm text-muted">Progress With Meaning</h2>
          <div className="mb-2 h-3 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${journeyProgressPercent}%` }} />
          </div>
          <p className="text-sm text-muted">{journeyProgressPercent}% of micro-lessons completed</p>
          <p className="mt-2 text-xs text-muted">
            You can handle {confidenceCount}/5 disaster scenarios confidently.
          </p>
        </article>

        <article className="glass-card p-5 md:p-6">
          <h2 className="mb-2 text-sm text-muted">Personalized Recommendations</h2>
          <p className="text-sm">
            Next module: <span className="font-semibold">{nextJourney.title}</span>
          </p>
          <p className="mt-2 text-sm">
            Revision focus: <span className="text-amber-300">{recommendedRevision}</span>
          </p>
          <p className="mt-2 text-xs text-muted">
            Location-aware risks: {likelyLocalRisk.join(" • ")}
          </p>
          <p className="mt-2 text-xs text-muted">Daily reminder: 1 micro-lesson + 1 scenario keeps readiness sharp.</p>
        </article>

        <article className="glass-card p-5 md:p-6">
          <h2 className="mb-2 text-sm text-muted">Badges Earned</h2>
          <div className="flex flex-wrap gap-2">
            {journeyBadges.map((badge) => (
              <span
                key={badge.id}
                className={`rounded-full px-3 py-1 text-xs ${earnedBadges.some((item) => item.id === badge.id)
                  ? "border border-yellow-400/40 bg-yellow-500/20 text-yellow-200"
                  : "border border-white/10 bg-slate-900/40 text-muted"
                  }`}
              >
                {earnedBadges.some((item) => item.id === badge.id) ? "🏅" : "○"} {badge.title}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Complete lessons and simulations to unlock more badges.</p>
        </article>
      </section>

      <article className="glass-card p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="section-title">Learning Journeys</h2>
          <span className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-xs text-muted">
            Active recall + checkpoint feedback
          </span>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {learningJourneys.map((journey) => {
            const completed = journey.microLessons.filter((lesson) => journeyCompletion[lesson.id]).length;
            const progress = Math.round((completed / journey.microLessons.length) * 100);
            return (
              <article key={journey.id} className="surface-card p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    {disasterIcons[journey.disaster] || "🧭"} {journey.title}
                  </h3>
                  <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-300">{journey.level}</span>
                </div>

                <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-secondary" style={{ width: `${progress}%` }} />
                </div>
                <p className="mb-3 text-xs text-muted">{progress}% complete • micro-lessons: {journey.microLessons.length}</p>

                <div className="space-y-2">
                  {journey.microLessons.map((lesson) => {
                    const done = Boolean(journeyCompletion[lesson.id]);
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onToggleMicroLesson(lesson.id)}
                        className={`focus-ring flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                          done
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-slate-900/40 text-muted hover:bg-white/5"
                        }`}
                      >
                        <span>{lesson.title}</span>
                        <span className="text-xs">{lesson.durationMins} min</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs font-medium">Checkpoint: {journey.checkpoint.question}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {journey.checkpoint.options.map((option, index) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          onCheckpointAnswer(
                            journey.id,
                            index,
                            journey.checkpoint.answerIndex,
                            journey.checkpoint.explanation
                          )
                        }
                        className="focus-ring rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-muted hover:bg-white/5"
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {checkpointFeedback[journey.id] && (
                    <p
                      className={`mt-2 text-xs ${checkpointFeedback[journey.id].isCorrect ? "text-emerald-300" : "text-amber-300"
                        }`}
                    >
                      {checkpointFeedback[journey.id].isCorrect ? "Correct." : "Try again."} {checkpointFeedback[journey.id].explanation}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </article>

      <article className="glass-card p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="section-title">Safety Video Studio</h2>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            Watched: {watchedCount}/{videoLessons.length}
          </span>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {videoLessons.map((lesson) => (
            <button
              key={lesson.key}
              type="button"
              onClick={() => {
                setActiveVideoKey(lesson.key);
                setUseAlternateVideoSource(false);
              }}
              className={`focus-ring rounded-full border px-3 py-1.5 text-sm transition ${
                activeVideoKey === lesson.key
                  ? "border-secondary bg-secondary/20 text-white"
                  : "border-white/10 bg-slate-900/40 text-muted hover:bg-white/5"
              }`}
            >
              {disasterIcons[lesson.key] || "🎬"} {lesson.title}
            </button>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
              <iframe
                title={`${selectedVideoLesson.title} tutorial`}
                src={toVideoEmbedUrl(selectedVideoLesson, useAlternateVideoSource)}
                className="h-[320px] w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
<<<<<<< HEAD
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted">{selectedVideoLesson.objective}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseAlternateVideoSource((prev) => !prev)}
                  className="focus-ring rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-xs text-muted hover:bg-white/5"
                >
                  {useAlternateVideoSource ? "Use Curated Source" : "Try Alternate Source"}
                </button>
                <a
                  href={toVideoSearchUrl(selectedVideoLesson)}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-200 hover:bg-sky-500/20"
                >
                  Open Full Lesson
                </a>
              </div>
=======
            <div className="progress-track h-2">
              <div className="h-full rounded-full bg-secondary" style={{ width: `${course.progress}%` }} />
>>>>>>> 17a7e3f37a5ab5d3984af2cc6447046e60c6916b
            </div>
            <p className="mt-1 text-xs text-muted">
              If embedded playback is blocked by network or browser policy, use "Open Full Lesson".
            </p>
          </div>

          <article className="surface-card p-4">
            <h3 className="mb-2 text-sm font-semibold">What To Watch For</h3>
            <div className="space-y-2 text-xs text-muted">
              {selectedVideoLesson.checkpoints.map((item) => (
                <p key={item} className="rounded-lg border border-white/10 bg-slate-900/40 p-2">
                  {item}
                </p>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onMarkVideoWatched(selectedVideoLesson.key)}
              className="interactive focus-ring mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
            >
              {watchedVideos[selectedVideoLesson.key] ? "Completed" : "Mark Watched (+15 XP)"}
            </button>
          </article>
        </div>

        <article className="mt-3 rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <p className="text-sm font-medium">Interactive check: {selectedVideoLesson.checkQuestion}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedVideoLesson.checkOptions.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => onAnswerVideoCheck(selectedVideoLesson.key, index)}
                className={`focus-ring rounded-full border px-3 py-1.5 text-xs ${
                  videoCheckChoice[selectedVideoLesson.key] === index
                    ? "border-secondary bg-secondary/20 text-white"
                    : "border-white/10 bg-slate-950/40 text-muted hover:bg-white/5"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {videoCheckFeedback[selectedVideoLesson.key] && (
            <p
              className={`mt-2 text-xs ${
                videoCheckFeedback[selectedVideoLesson.key].isCorrect ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {videoCheckFeedback[selectedVideoLesson.key].isCorrect ? "Correct." : "Try again."} {" "}
              {videoCheckFeedback[selectedVideoLesson.key].explanation}
            </p>
          )}
        </article>
      </article>

      <article className="glass-card p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="section-title">Live Disaster Awareness Modules</h2>
          <span className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-xs text-muted">
            Location-aware recommendations
          </span>
        </div>

        {moduleLoadState === "loading" && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <article key={item} className="surface-card animate-pulse p-3">
                <div className="mb-2 h-4 w-3/4 rounded bg-slate-700/40" />
                <div className="mb-2 h-3 w-1/2 rounded bg-slate-700/40" />
                <div className="h-3 w-2/3 rounded bg-slate-700/40" />
              </article>
            ))}
          </div>
        )}

        {moduleLoadState === "failed" && (
          <article className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-200">Live data temporarily unavailable. Showing recommended modules from your journey path.</p>
          </article>
        )}

        {(moduleLoadState === "ready" || moduleLoadState === "failed") && (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(moduleLoadState === "ready" ? liveModules : learningJourneys).map((module) => {
              const key = module.key || module.disaster;
              const title = module.title;
              const duration = module.durationMins || 7;
              const level = module.level || "Core";
              return (
                <article key={key} className="surface-card p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold">
                      {disasterIcons[key] || "🛟"} {title}
                    </h3>
                    <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs text-sky-300">{level}</span>
                  </div>
                  <p className="text-xs text-muted">Estimated time: {duration} minutes</p>
                </article>
              );
            })}
          </div>
        )}
      </article>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="glass-card p-5 md:p-6 xl:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="section-title">Scenario Simulation Lab</h2>
            <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-200">
              Decision score: {scenarioScore}
            </span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {playbooks.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActivePlaybook(item.key);
                  setScenarioChoiceId("");
                }}
                className={`focus-ring rounded-full border px-3 py-1.5 text-sm transition ${
                  activePlaybook === item.key
                    ? "border-secondary bg-secondary/20 text-white"
                    : "border-white/10 bg-slate-900/40 text-muted hover:bg-white/5"
                }`}
              >
                {disasterIcons[item.key] || "🛟"} {item.label}
              </button>
            ))}
          </div>

          <article className="mb-3 rounded-lg border border-white/10 bg-slate-900/40 p-3">
            <p className="text-sm font-semibold">🚨 Scenario: {selectedScenario.title}</p>
            <p className="mt-1 text-sm text-muted">{selectedScenario.prompt}</p>
          </article>

          <div className="grid gap-2 md:grid-cols-2">
            {selectedScenario.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => onChooseScenario(choice)}
                className={`focus-ring rounded-lg border px-3 py-2 text-left text-sm ${
                  scenarioChoiceId === choice.id
                    ? choice.points > 0
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-200"
                    : "border-white/10 bg-slate-900/40 text-muted hover:bg-white/5"
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>

          {selectedScenarioChoice && (
            <article
              className={`mt-3 rounded-lg border p-3 text-sm ${
                selectedScenarioChoice.points > 0
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-200"
              }`}
            >
              {selectedScenarioChoice.consequence}
            </article>
          )}
        </article>

        <article className="glass-card p-5 md:p-6">
          <h2 className="section-title mb-3">Visual Safety Cards</h2>
          <div className="space-y-2 text-sm">
            <article className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="mb-1 text-emerald-300">✅ Before</p>
              <p className="text-emerald-200">{selectedPlaybook.before[0]}</p>
            </article>
            <article className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="mb-1 text-amber-300">⚠ During</p>
              <p className="text-amber-200">{selectedPlaybook.during[0]}</p>
            </article>
            <article className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
              <p className="mb-1 text-rose-300">🛑 Critical After-Step</p>
              <p className="text-rose-200">{selectedPlaybook.after[0]}</p>
            </article>
          </div>
          <p className="mt-2 text-xs text-muted">Color cues: red = danger, yellow = caution, green = safe action.</p>
        </article>
      </section>

      <article className="glass-card p-5 md:p-6">
        <h2 className="section-title mb-3">Quick Knowledge Checks</h2>
        <div className="space-y-2">
          {quickChecks.map((item) => {
            const isOpen = Boolean(quickOpen[item.id]);
            return (
              <article key={item.id} className="surface-card p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.question}</p>
                  <button
                    type="button"
                    className="focus-ring rounded-full border border-white/10 px-3 py-1 text-xs text-muted hover:bg-white/5"
                    onClick={() => setQuickOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  >
                    {isOpen ? "Hide" : "Show answer"}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-emerald-300">Answer: {item.answer}</p>
                    <p className="text-muted">Why it matters: {item.explanation}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </article>

      <article className="glass-card p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="section-title">Spaced Revision Plan</h2>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            Active Recall: Day 1 • Day 3 • Day 7
          </span>
        </div>

        {revisionPlanState === "loading" && <p className="text-sm text-muted">Building your revision schedule...</p>}
        {revisionPlanState === "failed" && (
          <p className="text-sm text-amber-300">Revision schedule is temporarily unavailable. We will regenerate after next attempt.</p>
        )}

        {revisionPlanState === "ready" && (
          <div className="space-y-2">
            {(revisionPlan.length ? revisionPlan : [{ area: "Emergency Communication", reviews: [] }]).map((topic) => (
              <article key={topic.area} className="surface-card p-3">
                <p className="text-sm font-semibold">{topic.area}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(topic.reviews || []).map((review) => (
                    <span key={`${topic.area}-${review.label}`} className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-xs text-muted">
                      {review.label}: {new Date(review.reviewAt).toLocaleDateString()}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </article>

      <article className="glass-card p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="section-title">Adaptive Readiness Quiz</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-xs text-muted">
              Attempts: {quizAttempts}
            </span>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">
              {adaptiveDifficultyLabel}
            </span>
            <button
              type="button"
              onClick={onRefreshQuiz}
              className="focus-ring rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-xs text-muted hover:bg-white/5"
            >
              New Question Set
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <article className="surface-card p-3">
            <p className="text-xs text-muted">Latest score</p>
            <p className="mt-1 text-xl font-semibold">{typeof latestScore === "number" ? `${latestScore}%` : "-"}</p>
          </article>
          <article className="surface-card p-3">
            <p className="text-xs text-muted">Best score</p>
            <p className="mt-1 text-xl font-semibold">{typeof bestScore === "number" ? `${bestScore}%` : "-"}</p>
          </article>
          <article className="surface-card p-3">
            <p className="text-xs text-muted">Qualification status</p>
            <p className={`mt-1 text-sm font-semibold ${typeof latestScore === "number" && latestScore >= 70 ? "text-emerald-300" : "text-amber-300"}`}>
              {typeof latestScore !== "number"
                ? "Pending"
                : latestScore >= 70
                  ? "Qualified for advanced simulation"
                  : "Needs more practice"}
            </p>
          </article>
        </div>

        <div className="mb-4 grid gap-3 xl:grid-cols-2">
          <article className="surface-card p-3">
            <p className="mb-2 text-xs text-muted">Past Performance Trend</p>
            {quizHistory.length > 1 ? (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={quizHistory
                      .slice(0, 8)
                      .map((item, idx) => ({
                        attempt: `A${quizHistory.length - idx}`,
                        score: item.score,
                      }))
                      .reverse()}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="attempt" stroke="#94a3b8" />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted">Take at least two attempts to unlock your trend chart.</p>
            )}
          </article>

          <article className="surface-card p-3">
            <p className="mb-2 text-xs text-muted">Leaderboard (30 days)</p>
            {leaderboardState === "loading" && <p className="text-sm text-muted">Loading leaderboard...</p>}
            {leaderboardState === "failed" && <p className="text-sm text-amber-300">Leaderboard temporarily unavailable.</p>}
            {leaderboardState === "ready" && (
              <div className="space-y-2">
                {(leaderboard.length ? leaderboard : [{ name: "You", avgScore: latestScore || 0, attempts: quizAttempts }]).slice(0, 5).map((row, index) => (
                  <div key={`${row.name}-${index}`} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm">
                    <p>
                      #{index + 1} {row.name}
                    </p>
                    <p className="text-emerald-300">{row.avgScore}%</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>

        {quizSessionExpiresAt && (
          <p className="mb-2 text-xs text-muted">Session expires: {new Date(quizSessionExpiresAt).toLocaleTimeString()}</p>
        )}

        {quizQuestionState === "loading" && <p className="mb-3 text-sm text-muted">Loading randomized quiz...</p>}
        {quizQuestionState === "failed" && (
          <p className="mb-3 text-sm text-amber-300">Unable to load quiz pool right now. Try refresh.</p>
        )}

        <div className="space-y-3">
          {quizQuestions.map((question, index) => (
            <article key={question.id} className="surface-card p-3">
              <p className="mb-2 text-sm font-medium">
                {index + 1}. {question.question}
              </p>
              <p className="mb-2 text-xs text-muted">Source: {question.moduleTitle}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {question.options.map((option, optionIndex) => {
                  const selected = quizAnswers[question.id] === optionIndex;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onChooseAnswer(question.id, optionIndex)}
                      className={`focus-ring rounded-lg border px-3 py-2 text-left text-sm transition ${
                        selected
                          ? "border-secondary bg-secondary/20 text-white"
                          : "border-white/10 bg-slate-900/40 text-muted hover:bg-white/5"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSubmitQuiz}
            className="interactive focus-ring rounded-full bg-secondary px-4 py-2 text-sm font-semibold"
          >
            Submit Quiz
          </button>

          {quizSaveState === "incomplete" && (
            <span className="text-sm text-amber-300">Please answer all questions before submitting.</span>
          )}
          {quizSaveState === "saving" && <span className="text-sm text-muted">Saving your score...</span>}
          {quizSaveState === "saved" && <span className="text-sm text-emerald-300">Score saved successfully.</span>}
          {quizSaveState === "rate-limited" && (
            <span className="text-sm text-amber-300">Too many submissions. Please wait a minute and try again.</span>
          )}
          {quizSaveState === "save-failed" && (
            <span className="text-sm text-amber-300">Unable to save score, but your local result is shown below.</span>
          )}
        </div>

        {typeof quizScore === "number" && (
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-sm text-muted">Latest score</p>
            <p className="mt-1 text-2xl font-semibold">{quizScore}%</p>
            <p className={`mt-2 text-sm ${quizScore >= 70 ? "text-emerald-300" : "text-amber-300"}`}>
              {quizScore >= 70
                ? "Pass: You are ready for the next simulation challenge."
                : "Keep practicing: Review playbooks and retake to improve readiness."}
            </p>
            {quizScore >= 85 && (
              <p className="mt-2 inline-block rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                Readiness Certificate: Bronze Level
              </p>
            )}

            {quizWeakAreas.length > 0 && (
              <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-sm text-amber-200">Weak areas detected:</p>
                <ul className="mt-1 space-y-1 text-xs text-amber-100">
                  {quizWeakAreas.slice(0, 2).map((item) => (
                    <li key={item.area}>
                      {item.area}: {improvementTips[item.area] || "Revise this concept with a guided replay."}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {quizFeedback.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold">Answer Explanations</h3>
            <div className="space-y-2">
              {quizFeedback.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-lg border p-3 text-xs ${
                    item.isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-100"
                  }`}
                >
                  <p className="font-medium">{item.moduleTitle} • {item.difficulty}</p>
                  <p className="mt-1">{item.explanation}</p>
                  <p className="mt-1 opacity-90">Tip: {item.tip}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Attempts</h3>
            {quizHistoryState === "loading" && <span className="text-xs text-muted">Syncing...</span>}
            {quizHistoryState === "failed" && <span className="text-xs text-amber-300">History unavailable</span>}
          </div>

          {quizHistory.length === 0 ? (
            <p className="text-sm text-muted">No attempts recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {quizHistory.slice(0, 5).map((attempt, idx) => (
                <article key={attempt._id || `${attempt.completedAt || "attempt"}-${idx}`} className="surface-card flex items-center justify-between p-3">
                  <p className="text-sm text-muted">Attempt #{quizAttempts - idx}</p>
                  <p className="text-sm font-semibold">{attempt.score}%</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </article>
    </section>
  );
};

export default LearningCenterPage;
