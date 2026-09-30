/**
 * ===================================================================
 * PDC (PERSONALITY DEVELOPMENT CLUB) — MASTER CONTENT CONFIGURATION
 * ===================================================================
 * Single source of truth for:
 * - PDC Branding, Logo & Theme Details
 * - WhatsApp Official Community URL
 * - Kondhwa Campus Routing & Quiz URL
 * - Firebase Project Credentials
 * - Assessment Structure (PQ, IQ, EQ)
 * - Activity Data & Direct Quality Linkages
 * - Concise, Actionable Evaluation Report Content
 * ===================================================================
 */

if (typeof window === "undefined") {
  global.window = {};
}

window.PDC_CONFIG = {
  // ── Brand & Club Information ─────────────────────────────────────
  club: {
    name: "Personality Development Club",
    shortName: "PDC",
    motto: "Character | Competence | Culture",
    tagline: "Official Personality & Aptitude Assessment (PQ · IQ · SQ) • VIT Pune",
    badge: "Official PDC Assessment 2026",
    logoPath: "assets/pdc-logo.png",
    bannerPath: "Stories/PDC Banner.png",

    // About Us Content (Collapsible accordion)
    about: {
      title: "About PDC",
      shortDescription: "The Personality Development Club (PDC) of VIT Pune empowers engineering students to excel across character, intellectual sharpness, and emotional poise through experiential workshops, premier mentorship, and leadership outings.",
      mission: "To inspire students to unlock their authentic potential, cultivate resolute character, and lead with confidence and compassion in every sphere of life.",
      pillars: [
        {
          title: "Character (PQ)",
          desc: "Develop resilience, integrity, articulate communication, and confidence under pressure."
        },
        {
          title: "Competence (IQ)",
          desc: "Sharpen logical structuring, technical problem-solving, and decisive analytical thinking."
        },
        {
          title: "Culture (SQ)",
          desc: "Cultivate self-awareness, empathy, emotional equilibrium, timeless wisdom, and enduring ethical clarity."
        },
        {
          title: "Leadership",
          desc: "Gain real-world leadership experience by organizing campus events, mentorship circles, and retreats."
        }
      ]
    }
  },

  // ── Kondhwa Campus Routing & Quiz Configuration ───────────────────
  campusAccess: {
    blockedMessage: "Kondhwa campus registrations are handled through a dedicated Kondhwa assessment route. Please proceed to the Kondhwa assessment below.",
    supportNote: "Please use the official Kondhwa pathway shared by the club coordinators.",
    KONDHWA_QUIZ_URL: "kondhwa.html",
    kondhwaQuizUrl: "kondhwa.html",
    BIBWEWADI_QUIZ_URL: "index.html",
    bibwewadiQuizUrl: "index.html",
    kondhwaLogoPath: "assets/kondhwa-logo.svg",
    collections: {
      bibwewadi: "pdc_bibwewadi_submissions",
      kondhwa: "pdc_kondhwa_submissions",
      legacy: "pdc_test_submissions"
    }
  },

  // ── WhatsApp Official Community Link ──────────────────────────────
  // Unified single CTA — no boys/girls distinction visible to users
  whatsappLinks: {
    COMMUNITY_URL: "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl",
    default: "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl",
    BOYS_WHATSAPP_LINK: "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl",
    GIRLS_WHATSAPP_LINK: "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl",
    male: "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl",
    female: "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl"
  },

  // ── Firebase Configuration Placeholder for PDC Project ───────────
  firebase: {
    apiKey: "AIzaSy_PDC_OFFICIAL_FIREBASE_KEY_PLACEHOLDER",
    authDomain: "pdc-club-assessment.firebaseapp.com",
    projectId: "pdc-club-assessment",
    storageBucket: "pdc-club-assessment.firebasestorage.app",
    messagingSenderId: "102938475612",
    appId: "1:102938475612:web:pdc9876543210abcdef"
  },

  // ── 5 Core PDC Activities with Direct Quality Mappings ────────────
  activities: [
    {
      id: "activity_stw",
      image: "Stories/iitstw.png",
      title: "Software Training Workshops (STWs) at IIT Bombay",
      subtitle: "Technical Masterclasses & Hands-On Engineering Skills",
      desc: "High-impact technical workshops in collaboration with premier institutes like IIT Bombay, covering modern development tools, system architecture, and industry problem-solving.",
      qualityKey: "iq",
      relevantQuality: "Intellectual Quotient (IQ)",
      howItHelps: "Sharpens structured logic, analytical problem-solving, and translates aptitude into high-level engineering competence."
    },
    {
      id: "activity_pdw",
      image: "Stories/pdw.png",
      title: "Personality Development Workshops (PDWs)",
      subtitle: "Public Speaking, Presence & Interpersonal Mastery",
      desc: "Dynamic live sessions focused on eliminating stage fright, mastering expressive speech, body language, assertiveness, and commanding boardroom communication.",
      qualityKey: "pq",
      relevantQuality: "Personality Quotient (PQ)",
      howItHelps: "Transforms natural thoughts into articulate, persuasive communication and builds grounded social confidence in group settings."
    },
    {
      id: "activity_mmc",
      image: "Stories/mmc.png",
      title: "Personalized Mentor Meets",
      subtitle: "One-on-One Mentorship Circles & Emotional Guidance",
      desc: "Small-group and 1-on-1 mentorship circles with experienced seniors and faculty mentors, providing a confidential environment to navigate college stress, habits, and career paths.",
      qualityKey: "sq",
      relevantQuality: "Spiritual Quotient (SQ)",
      howItHelps: "Builds deep self-awareness, emotional resilience under pressure, and provides actionable personal habit frameworks."
    },
    {
      id: "activity_camps",
      image: "Stories/camps.png",
      title: "Edutainment Outings & Camps",
      subtitle: "Adventure Obstacles, Team Synergy & Practical Leadership",
      desc: "Expedition retreats featuring adventure high-ropes, outdoor problem-solving challenges, team bonfire discussions, and collaborative games.",
      qualityKey: "pq",
      relevantQuality: "Personality Quotient (PQ) & Team Leadership",
      howItHelps: "Tests character, adaptability, teamwork, and calm decision-making outside academic comfort zones."
    },
    {
      id: "activity_wisdom",
      image: "Stories/wisdom.png",
      title: "Timeless Wisdom Sessions",
      subtitle: "Universal Principles for Modern Mental Mastery & Purpose",
      desc: "Engaging interactive dialogues extracting timeless principles for managing overthinking, maintaining inner composure, resolving ethical dilemmas, and discovering long-term purpose.",
      qualityKey: "sq",
      relevantQuality: "Spiritual Quotient (SQ)",
      howItHelps: "Provides profound mental clarity, empathy, and emotional equilibrium that keeps you grounded regardless of external circumstances."
    }
  ],

  // ── Multi-Step Assessment Form (20 Questions: 7 PQ + 6 IQ + 7 SQ) ──
  steps: [
    {
      id: "personal_details",
      title: "Student Profile & Registration",
      subtitle: "Please provide your basic details to personalize your PDC assessment report.",
      isPersonalDetails: true,
      fields: [
        {
          name: "fullName",
          label: "Full Name",
          type: "text",
          placeholder: "Enter your full name",
          required: true
        },
        {
          name: "whatsappNumber",
          label: "Phone / WhatsApp Number",
          type: "tel",
          placeholder: "10-digit mobile number (e.g. 9876543210)",
          required: true,
          pattern: "^[0-9]{10}$"
        },
        {
          name: "email",
          label: "Email Address",
          type: "email",
          placeholder: "name@example.com",
          required: true
        },
        {
          name: "gender",
          label: "Gender",
          type: "radio",
          required: true,
          options: ["Male", "Female"]
        },
        {
          name: "homeTown",
          label: "Home Town / Native City",
          type: "text",
          placeholder: "e.g. Pune, Mumbai, Nashik, etc.",
          required: true
        },
        {
          name: "branch",
          label: "Engineering Branch",
          type: "select",
          required: true,
          hasOtherInput: true,
          otherPlaceholder: "e.g. Chemical, Civil, Robotics, Instrumentation, etc.",
          options: [
            "Computer Engineering",
            "Information Technology",
            "Electronics and Telecommunication Engineering",
            "Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
            "Computer Science and Engineering (Artificial Intelligence)",
            "Artificial Intelligence and Data Science",
            "Mechanical Engineering",
            "Chemical Engineering",
            "Instrumentation and Control Engineering",
            "Other"
          ]
        },
        {
          name: "campus",
          label: "Campus",
          type: "select",
          required: true,
          options: ["Bibwewadi", "Kondhwa"]
        },
        {
          name: "division",
          label: "Division",
          type: "select",
          required: true,
          options: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "SEDA"]
        },
        {
          name: "year",
          label: "Current Year",
          type: "select",
          required: true,
          options: [
            "FY",
            "SY",
            "TY",
            "Final Year"
          ]
        }
      ]
    },
    {
      id: "section_pq",
      dimension: "pq",
      section: "PQ",
      title: "Section 1 — Personality Quotient (PQ)",
      subtitle: "7 Questions · Maximum 35 Marks. Choose the option closest to how you would normally respond.",
      category: "Personality Quotient (PQ)",
      questions: [
        {
          id: "PQ1",
          section: "PQ",
          dimension: "pq",
          question: "Someone points out your mistake in front of others. You:",
          options: [
            { id: "A", text: "Accept it and learn from it.", marks: 5 },
            { id: "B", text: "Feel hurt and upset.", marks: 4 },
            { id: "C", text: "Think about it later.", marks: 3.5 },
            { id: "D", text: "Defend yourself immediately.", marks: 3 },
            { id: "E", text: "Ignore what they say.", marks: 2.5 }
          ]
        },
        {
          id: "PQ2",
          section: "PQ",
          dimension: "pq",
          question: "You work hard but fail. You:",
          options: [
            { id: "A", text: "Blame the circumstances.", marks: 2.5 },
            { id: "B", text: "Learn and try again.", marks: 5 },
            { id: "C", text: "Think about what went wrong.", marks: 4 },
            { id: "D", text: "Move on without thinking much.", marks: 3.5 },
            { id: "E", text: "Lose motivation.", marks: 3 }
          ]
        },
        {
          id: "PQ3",
          section: "PQ",
          dimension: "pq",
          question: "You have a heated disagreement with someone close. You:",
          options: [
            { id: "A", text: "Avoid the person afterward.", marks: 3 },
            { id: "B", text: "Say things you may regret.", marks: 2.5 },
            { id: "C", text: "Listen and explain your point calmly.", marks: 5 },
            { id: "D", text: "Take a break and return later.", marks: 4 },
            { id: "E", text: "Keep arguing.", marks: 3.5 }
          ]
        },
        {
          id: "PQ4",
          section: "PQ",
          dimension: "pq",
          question: "Someone achieves what you wanted. You:",
          options: [
            { id: "A", text: "Feel inspired to work harder.", marks: 3.5 },
            { id: "B", text: "Feel genuinely happy for them.", marks: 3 },
            { id: "C", text: "Look for reasons their success isn't impressive.", marks: 2.5 },
            { id: "D", text: "Compare yourself with them.", marks: 5 },
            { id: "E", text: "Feel uncomfortable about your own progress.", marks: 4 }
          ]
        },
        {
          id: "PQ5",
          section: "PQ",
          dimension: "pq",
          question: "An important plan suddenly gets cancelled. You:",
          options: [
            { id: "A", text: "Look for another option.", marks: 4 },
            { id: "B", text: "Feel frustrated.", marks: 3 },
            { id: "C", text: "Blame whoever caused the change.", marks: 2.5 },
            { id: "D", text: "Accept the change and decide what to do next.", marks: 3.5 },
            { id: "E", text: "Complain but eventually accept it.", marks: 5 }
          ]
        },
        {
          id: "PQ8",
          section: "PQ",
          dimension: "pq",
          question: "You realise that your decision hurt someone. You:",
          options: [
            { id: "A", text: "Explain why you did it.", marks: 3 },
            { id: "B", text: "Accept your mistake and apologise.", marks: 5 },
            { id: "C", text: "Try to correct the situation first.", marks: 4 },
            { id: "D", text: "Avoid discussing it.", marks: 2.5 },
            { id: "E", text: "Apologise if they were reasonable.", marks: 3.5 }
          ]
        },
        {
          id: "PQ10",
          section: "PQ",
          dimension: "pq",
          question: "Someone behaves rudely toward you for no obvious reason. You:",
          options: [
            { id: "A", text: "Respond firmly.", marks: 3 },
            { id: "B", text: "Feel upset about it.", marks: 2.5 },
            { id: "C", text: "Avoid them afterward.", marks: 3.5 },
            { id: "D", text: "Consider that something may be troubling them.", marks: 4 },
            { id: "E", text: "Ask if something is bothering them.", marks: 5 }
          ]
        }
      ]
    },
    {
      id: "section_iq",
      dimension: "iq",
      section: "IQ",
      title: "Section 2 — Intellectual Quotient (IQ)",
      subtitle: "6 Questions · Maximum 30 Marks. Choose the best answer for each problem.",
      category: "Intellectual Quotient (IQ)",
      questions: [
        {
          id: "IQ1",
          section: "IQ",
          dimension: "iq",
          question: "What comes next in the sequence?\n3, 7, 15, 31, 63, ?",
          options: [
            { id: "A", text: "95", marks: 3 },
            { id: "B", text: "111", marks: 3.5 },
            { id: "C", text: "125", marks: 4 },
            { id: "D", text: "127", marks: 5 },
            { id: "E", text: "129", marks: 2.5 }
          ]
        },
        {
          id: "IQ2",
          section: "IQ",
          dimension: "iq",
          question: "A product is marked 25% above its cost price and then sold at a 10% discount. What is the profit percentage?",
          options: [
            { id: "A", text: "10%", marks: 3 },
            { id: "B", text: "12.5%", marks: 5 },
            { id: "C", text: "15%", marks: 3.5 },
            { id: "D", text: "17.5%", marks: 4 },
            { id: "E", text: "20%", marks: 2.5 }
          ]
        },
        {
          id: "IQ3",
          section: "IQ",
          dimension: "iq",
          question: "All doctors are educated. Some educated people are writers. Which statement must be true?",
          options: [
            { id: "A", text: "Some doctors are writers.", marks: 3.5 },
            { id: "B", text: "All writers are doctors.", marks: 2.5 },
            { id: "C", text: "Some writers are doctors.", marks: 4 },
            { id: "D", text: "All doctors are educated.", marks: 5 },
            { id: "E", text: "No doctors are writers.", marks: 3 }
          ]
        },
        {
          id: "IQ4",
          section: "IQ",
          dimension: "iq",
          question: "A can complete a job in 12 days and B in 18 days. How long will they take together?",
          options: [
            { id: "A", text: "7.2 days", marks: 5 },
            { id: "B", text: "8 days", marks: 3 },
            { id: "C", text: "9 days", marks: 3.5 },
            { id: "D", text: "10 days", marks: 2.5 },
            { id: "E", text: "12 days", marks: 4 }
          ]
        },
        {
          id: "IQ7",
          section: "IQ",
          dimension: "iq",
          question: "Five people are standing in a line. Ravi is ahead of Amit. Sameer is behind Amit. Neha is ahead of Ravi. Who must be ahead of Sameer?",
          options: [
            { id: "A", text: "Only Amit", marks: 3 },
            { id: "B", text: "Only Ravi", marks: 3.5 },
            { id: "C", text: "Both Ravi and Amit", marks: 5 },
            { id: "D", text: "Neha only", marks: 4 },
            { id: "E", text: "Cannot be determined", marks: 2.5 }
          ]
        },
        {
          id: "IQ9",
          section: "IQ",
          dimension: "iq",
          question: "If BOOK is coded as CPPL, how is MIND coded?",
          options: [
            { id: "A", text: "NJPE", marks: 3 },
            { id: "B", text: "NJOE", marks: 5 },
            { id: "C", text: "NHMC", marks: 2.5 },
            { id: "D", text: "OJPF", marks: 4 },
            { id: "E", text: "NJPD", marks: 3.5 }
          ]
        }
      ]
    },
    {
      id: "section_sq",
      dimension: "sq",
      section: "SQ",
      title: "Section 3 — Spiritual Quotient (SQ)",
      subtitle: "7 Questions · Maximum 35 Marks. Choose the option that most closely reflects your approach.",
      category: "Spiritual Quotient (SQ)",
      questions: [
        {
          id: "SQ1",
          section: "SQ",
          dimension: "sq",
          question: "When something difficult happens unexpectedly, what is the most constructive approach?",
          options: [
            { id: "A", text: "Look at what the situation can teach me.", marks: 5 },
            { id: "B", text: "Accept that some things are simply beyond my control.", marks: 4 },
            { id: "C", text: "Focus on getting through it as quickly as possible.", marks: 3.5 },
            { id: "D", text: "Look for someone or something to blame.", marks: 3 },
            { id: "E", text: "Assume that life is generally unfair.", marks: 2.5 }
          ]
        },
        {
          id: "SQ2",
          section: "SQ",
          dimension: "sq",
          question: "Two people perform the same action, but with very different intentions. What matters more?",
          options: [
            { id: "A", text: "The action itself.", marks: 2.5 },
            { id: "B", text: "Both the action and the intention behind it.", marks: 5 },
            { id: "C", text: "The result that follows.", marks: 4 },
            { id: "D", text: "Whether other people approve of it.", marks: 3.5 },
            { id: "E", text: "Whether the person benefits from it.", marks: 3 }
          ]
        },
        {
          id: "SQ4",
          section: "SQ",
          dimension: "sq",
          question: "Someone hurts you deeply but later sincerely regrets it. What is the wiser response?",
          options: [
            { id: "A", text: "Forgive immediately and forget everything.", marks: 3.5 },
            { id: "B", text: "Continue holding the hurt so that you don't get hurt again.", marks: 3 },
            { id: "C", text: "Make sure they experience the same pain.", marks: 2.5 },
            { id: "D", text: "Forgive while still learning from what happened and maintaining appropriate boundaries.", marks: 5 },
            { id: "E", text: "Completely remove the person from your life regardless of their change.", marks: 4 }
          ]
        },
        {
          id: "SQ5",
          section: "SQ",
          dimension: "sq",
          question: "Which statement comes closest to your understanding of happiness?",
          options: [
            { id: "A", text: "Happiness mainly comes from achieving what I want.", marks: 4 },
            { id: "B", text: "Happiness depends largely on favourable circumstances.", marks: 3.5 },
            { id: "C", text: "Happiness comes from having fewer problems.", marks: 3 },
            { id: "D", text: "Happiness is mainly about having good relationships.", marks: 2.5 },
            { id: "E", text: "Lasting happiness depends more on inner understanding than on external circumstances.", marks: 5 }
          ]
        },
        {
          id: "SQ6",
          section: "SQ",
          dimension: "sq",
          question: "If a person keeps repeating the same harmful behaviour despite knowing its consequences, what is most likely missing?",
          options: [
            { id: "A", text: "Better circumstances.", marks: 2.5 },
            { id: "B", text: "Greater self-awareness and inner discipline.", marks: 5 },
            { id: "C", text: "More appreciation from others.", marks: 4 },
            { id: "D", text: "Better luck.", marks: 3.5 },
            { id: "E", text: "More material success.", marks: 3 }
          ]
        },
        {
          id: "SQ8",
          section: "SQ",
          dimension: "sq",
          question: "If our body, roles and circumstances keep changing throughout life, what might this suggest?",
          options: [
            { id: "A", text: "Nothing meaningful can be concluded from change.", marks: 3.5 },
            { id: "B", text: "Our identity is completely determined by our circumstances.", marks: 3 },
            { id: "C", text: "We should avoid thinking about such questions.", marks: 2.5 },
            { id: "D", text: "There may be a deeper aspect of identity beyond our changing roles and circumstances.", marks: 5 },
            { id: "E", text: "Our identity is simply whatever we currently feel it is.", marks: 4 }
          ]
        },
        {
          id: "SQ9",
          section: "SQ",
          dimension: "sq",
          question: "If a person believes that actions have deeper, long-term impacts beyond immediate outcomes, what would that view most strongly encourage?",
          options: [
            { id: "A", text: "Focusing mainly on the present life.", marks: 4 },
            { id: "B", text: "Trying to enjoy life as much as possible.", marks: 3 },
            { id: "C", text: "Avoiding all worldly responsibilities.", marks: 3.5 },
            { id: "D", text: "Believing that present actions have little importance.", marks: 2.5 },
            { id: "E", text: "Taking greater responsibility for one's actions and their longer-term consequences.", marks: 5 }
          ]
        }
      ]
    },
    {
      id: "community_step",
      title: "Join Official PDC WhatsApp Community",
      subtitle: "Connect with PDC coordinators, mentors, and fellow engineering students to receive your workshop assignments and event schedules.",
      isCommunityStep: true,
      category: "WhatsApp Community"
    }
  ],

  // ── Result Page Configuration ─────────────────────────────────────
  resultPage: {
    title: "Assessment Successfully Submitted!",
    badge: "Official PDC Evaluation",
    greeting: "Here is your personalized PQ · IQ · EQ score analysis.",
    instruction: "Join the official PDC WhatsApp Community below to receive mentor guidance and workshop updates:",
    buttonText: "Join WhatsApp Community"
  },

  // ── Actionable Score Insights & Personalized Guidance ─────────────
  scoreInsights: {
    pq: {
      name: "Personality Quotient (PQ)",
      shortName: "PQ",
      tag: "Character, Resilience & Communication",
      icon: "⚡",
      color: "#F96340",
      description: "Measures social confidence, composure under pressure, and how you articulate ideas in group settings.",
      strongActivity: "Personality Development Workshops (PDWs) & Outings",
      improveActivity: "Personality Development Workshops (PDWs)",
      tiers: [
        {
          min: 80, max: 100,
          label: "Strong Personal Presence",
          observation: "Your responses demonstrate solid self-awareness, composure under scrutiny, and constructive resilience.",
          strengthAction: "You naturally treat setbacks as feedback and maintain composure during disagreements.",
          pdcHelpStrength: "Taking responsibility in PDC event teams and coordinating student initiatives will turn your natural composure into high-impact leadership.",
          activityStrength: "Edutainment Outings & Event Coordination",
          growthArea: "Refining nuanced communication and public speaking under large-audience pressure.",
          pdcHelpImprove: "Participating in advanced PDW presentation rounds gives you safe, repeated practice speaking before 200+ students.",
          activityImprove: "Personality Development Workshops (PDWs)"
        },
        {
          min: 60, max: 79,
          label: "Growing with Awareness",
          observation: "You have developed positive interpersonal awareness and show genuine willingness to learn from setbacks.",
          strengthAction: "You care about mutual understanding and adapt when situations demand flexibility.",
          pdcHelpStrength: "Engaging in PDC group discussions will help you articulate your perspectives with greater consistency.",
          activityStrength: "Personality Development Workshops (PDWs)",
          growthArea: "Expressing thoughts with confident clarity without self-doubt in unfamiliar groups.",
          pdcHelpImprove: "PDC's structured speaking drills and supportive peer feedback help you overcome hesitation and speak with authority.",
          activityImprove: "Personality Development Workshops (PDWs) & Camps"
        },
        {
          min: 0, max: 59,
          label: "Building Your Foundation",
          observation: "You are becoming more conscious of your social reactions and how external stress influences your decisions.",
          strengthAction: "You show empathy toward others and recognise when an environment demands patience.",
          pdcHelpStrength: "Small PDC mentorship circles provide an encouraging forum to practice expressing your thoughts without judgement.",
          activityStrength: "Personalized Mentor Meets",
          growthArea: "Building steady resilience so constructive criticism does not feel discouraging.",
          pdcHelpImprove: "Step-by-step roleplay exercises and supportive mentor feedback in PDC gradually build confident emotional armor.",
          activityImprove: "Personality Development Workshops (PDWs)"
        }
      ]
    },
    iq: {
      name: "Intellectual Quotient (IQ)",
      shortName: "IQ",
      tag: "Logic, Aptitude & Critical Thinking",
      icon: "💡",
      color: "#2563EB",
      description: "Evaluates pattern recognition, mathematical reasoning, and structured problem-solving under time constraints.",
      strongActivity: "Software Training Workshops (STWs) at IIT Bombay",
      improveActivity: "Software Training Workshops (STWs) & Aptitude Circles",
      tiers: [
        {
          min: 80, max: 100,
          label: "Advanced Analytical Thinker",
          observation: "You quickly identify underlying patterns and solve multi-step problems with structured logical precision.",
          strengthAction: "You break complex data into clear parts and avoid superficial shortcuts.",
          pdcHelpStrength: "Applying your analytical sharpness to real-world engineering projects and technical workshops at IIT Bombay.",
          activityStrength: "Software Training Workshops (STWs) at IIT Bombay",
          growthArea: "Explaining intricate logical solutions simply so team members can follow easily.",
          pdcHelpImprove: "Leading technical discussions and peer code-reviews in PDC software tracks sharpens your technical communication.",
          activityImprove: "Technical Team Coordination & STWs"
        },
        {
          min: 60, max: 79,
          label: "Structured Problem Solver",
          observation: "You possess a workable analytical foundation and follow logical deductions effectively when paths are clear.",
          strengthAction: "You understand common quantitative relationships and reason through structured questions well.",
          pdcHelpStrength: "Collaborating with high-performing engineering peers in PDC expands your speed and problem-solving flexibility.",
          activityStrength: "Software Training Workshops (STWs)",
          growthArea: "Solving non-standard problems with multiple valid approaches without getting stuck.",
          pdcHelpImprove: "PDC's aptitude masterclasses and software bootcamps expose you to diverse algorithmic patterns and competitive problem solving.",
          activityImprove: "Software Training Workshops (STWs)"
        },
        {
          min: 0, max: 59,
          label: "Developing Fundamentals",
          observation: "Your analytical abilities are developing and improve significantly with methodical, step-by-step practice.",
          strengthAction: "You make honest attempts at numerical reasoning and show potential to recognize patterns.",
          pdcHelpStrength: "Structured study groups and senior guidance help you master fundamental problem-solving frameworks.",
          activityStrength: "Mentor-guided Aptitude Sessions",
          growthArea: "Verifying reasoning systematically before committing to conclusions.",
          pdcHelpImprove: "PDC software training workshops break complex problems into intuitive building blocks, giving you confidence.",
          activityImprove: "Software Training Workshops (STWs)"
        }
      ]
    },
    sq: {
      name: "Spiritual Quotient (SQ)",
      shortName: "SQ",
      tag: "Self-Awareness, Empathy & Inner Resilience",
      icon: "🌿",
      color: "#D97706",
      description: "Measures emotional regulation, empathy, mindfulness, and your ability to maintain purpose and inner balance during adversity.",
      strongActivity: "Personalized Mentor Meets & Wisdom Sessions",
      improveActivity: "Timeless Wisdom Sessions & Mentor Meets",
      tiers: [
        {
          min: 80, max: 100,
          label: "Mature Spiritual Poise",
          observation: "You maintain deep composure, evaluate intentions rather than surface reactions, and stay anchored in purpose.",
          strengthAction: "You look for deeper lessons in setbacks and maintain healthy boundaries with empathy.",
          pdcHelpStrength: "Serving as a mentor in student circles and leading meaningful campus initiatives through your natural stability.",
          activityStrength: "Personalized Mentor Meets & Student Mentoring",
          growthArea: "Consistently applying your calm inner perspective during intense deadline crunches.",
          pdcHelpImprove: "PDC's advanced wisdom retreats provide quiet spaces to deepen self-mastery and align long-term priorities.",
          activityImprove: "Timeless Wisdom Sessions"
        },
        {
          min: 60, max: 79,
          label: "Growing in Self-Awareness",
          observation: "You understand that choices carry deeper consequences and value genuine empathy and ethical responsibility.",
          strengthAction: "You consider others' feelings and recognize that lasting fulfilment requires inner balance.",
          pdcHelpStrength: "Regular participation in PDC discussions provides constant reinforcement of positive mental habits.",
          activityStrength: "Timeless Wisdom Sessions",
          growthArea: "Preventing momentary frustration or peer pressure from clouding long-term goals.",
          pdcHelpImprove: "Interactive mentor meets in PDC offer actionable mental models to manage academic stress and peer comparison.",
          activityImprove: "Personalized Mentor Meets"
        },
        {
          min: 0, max: 59,
          label: "Beginning Inner Awareness",
          observation: "You are beginning to reflect on how daily pressures affect your mood, relationships, and focus.",
          strengthAction: "You are open to honest reflection and recognise that personal growth starts from within.",
          pdcHelpStrength: "Having dedicated mentors in PDC provides an anchor to discuss personal dilemmas and emotional challenges safely.",
          activityStrength: "Personalized Mentor Meets",
          growthArea: "Pausing before reacting emotionally to difficult people or sudden setbacks.",
          pdcHelpImprove: "PDC wisdom sessions offer timeless philosophical tools to steady the mind, conquer anxiety, and build clarity.",
          activityImprove: "Timeless Wisdom Sessions & Mentor Meets"
        }
      ]
    }
  }
};

// Aliases for backward compatibility
window.PDC_CONFIG.scoreInsights.eq = window.PDC_CONFIG.scoreInsights.sq;
window.DHRUVA_CONFIG = window.PDC_CONFIG;

if (typeof module !== "undefined" && module.exports) {
  module.exports = window.PDC_CONFIG;
}
