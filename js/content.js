/**
 * ===================================================================
 * PDC (PERSONALITY DEVELOPMENT CLUB) — MASTER CONTENT CONFIGURATION
 * ===================================================================
 * Single source of truth for:
 * - PDC Branding, Logo & Theme Details
 * - WhatsApp Official Community URL
 * - Kondhwa Campus Routing & Quiz URL
 * - Supabase Database Credentials
 * - Assessment Structure (PQ, IQ, EQ)
 * - Activity Data & Direct Quality Linkages
 * - Concise, Actionable Evaluation Report Content
 * ===================================================================
 */

if (typeof window === "undefined") {
  global.window = {};
}

window.PDC_CONFIG = {
  // ── Supabase Configuration ──────────────────────────────────────
  supabase: {
    url: "https://newtaeknlmkugqmhcyxg.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ld3RhZWtubG1rdWdxbWhjeXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzM4MzUsImV4cCI6MjEwNjc0OTgzNX0.MeDqtah3UBb8TjMldOl-wMeTFdvtPqU1GjFfQhbhdOU",
    tables: {
      CONFIRMATION_STST: "confirmation_stst",
      BIBWEWADI: "pdc_bibwewadi_submissions"
    }
  },

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

  // ── Central Branch to Campus Mapping (Official Single Source of Truth) ──
  campusMapping: {
    CAMPUSES: {
      BIBWEWADI: "Bibwewadi",
      KONDHWA: "Kondhwa"
    },
    BIBWEWADI_BRANCHES: [
      "Computer Engineering",
      "Information Technology",
      "CSE (Artificial Intelligence)",
      "CSE (Artificial Intelligence & Machine Learning)"
    ],
    KONDHWA_BRANCHES: [
      "CSE (Data Science)",
      "Computer Engineering (Software Engineering)",
      "CSE (IoT & Cyber Security including Blockchain)",
      "Electronics & Telecommunication",
      "Instrumentation & Control",
      "Mechanical Engineering",
      "Civil Engineering",
      "Artificial Intelligence & Data Science"
    ],
    BRANCH_CAMPUS_MAP: {
      "Computer Engineering": "Bibwewadi",
      "Information Technology": "Bibwewadi",
      "CSE (Artificial Intelligence)": "Bibwewadi",
      "CSE (Artificial Intelligence & Machine Learning)": "Bibwewadi",

      "CSE (Data Science)": "Kondhwa",
      "Computer Engineering (Software Engineering)": "Kondhwa",
      "CSE (IoT & Cyber Security including Blockchain)": "Kondhwa",
      "Electronics & Telecommunication": "Kondhwa",
      "Instrumentation & Control": "Kondhwa",
      "Mechanical Engineering": "Kondhwa",
      "Civil Engineering": "Kondhwa",
      "Artificial Intelligence & Data Science": "Kondhwa"
    },
    KONDHWA_WEBSITE_URL: "https://c-cube-vit-pune.vercel.app/"
  },

  /**
   * Authoritative centralized helper to derive Campus from Branch.
   * Returns 'Bibwewadi', 'Kondhwa', or null if unmapped.
   */
  getCampusFromBranch: function(branch) {
    if (!branch || typeof branch !== "string") return null;
    const clean = branch.trim();
    const map = window.PDC_CONFIG?.campusMapping?.BRANCH_CAMPUS_MAP || {
      "Computer Engineering": "Bibwewadi",
      "Information Technology": "Bibwewadi",
      "CSE (Artificial Intelligence)": "Bibwewadi",
      "CSE (Artificial Intelligence & Machine Learning)": "Bibwewadi",
      "CSE (Data Science)": "Kondhwa",
      "Computer Engineering (Software Engineering)": "Kondhwa",
      "CSE (IoT & Cyber Security including Blockchain)": "Kondhwa",
      "Electronics & Telecommunication": "Kondhwa",
      "Instrumentation & Control": "Kondhwa",
      "Mechanical Engineering": "Kondhwa",
      "Civil Engineering": "Kondhwa",
      "Artificial Intelligence & Data Science": "Kondhwa"
    };
    if (map[clean]) return map[clean];
    const lower = clean.toLowerCase();
    for (const [b, c] of Object.entries(map)) {
      if (b.toLowerCase() === lower) return c;
    }
    return null;
  },

  // ── Kondhwa Campus Routing & Quiz Configuration ───────────────────
  campusAccess: {
    blockedMessage: "Kondhwa campus registrations are handled through a dedicated Kondhwa assessment route. Please proceed to the Kondhwa assessment below.",
    supportNote: "Please use the official Kondhwa pathway shared by the club coordinators.",
    KONDHWA_QUIZ_URL: "https://c-cube-vit-pune.vercel.app/",
    kondhwaQuizUrl: "https://c-cube-vit-pune.vercel.app/",
    BIBWEWADI_QUIZ_URL: "index.html",
    bibwewadiQuizUrl: "index.html",
    kondhwaLogoPath: "assets/kondhwa-logo.svg",
    collections: {
      bibwewadi: "pdc_bibwewadi_submissions",
      kondhwa: "pdc_kondhwa_submissions",
      legacy: "pdc_test_submissions"
    }
  },

  // ── WhatsApp Official Community Links ─────────────────────────────
  whatsappLinks: {
    COMMUNITY_URL: "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl",
    default: "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl",
    BOYS_WHATSAPP_LINK: "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl",
    GIRLS_WHATSAPP_LINK: "https://chat.whatsapp.com/K26ctdpLyC85tutbp93kxu",
    male: "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl",
    female: "https://chat.whatsapp.com/K26ctdpLyC85tutbp93kxu"
  },

  getWhatsAppCommunityLink: function(gender) {
    const normalizedGender = String(gender || "").trim().toLowerCase();
    const links = window.PDC_CONFIG?.whatsappLinks || {};

    if (normalizedGender === "female" || normalizedGender === "girl" || normalizedGender === "girls") {
      return links.GIRLS_WHATSAPP_LINK || links.female || links.COMMUNITY_URL || links.default;
    }
    if (normalizedGender === "male" || normalizedGender === "boy" || normalizedGender === "boys") {
      return links.BOYS_WHATSAPP_LINK || links.male || links.COMMUNITY_URL || links.default;
    }
    return links.COMMUNITY_URL || links.default || links.BOYS_WHATSAPP_LINK || "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl";
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
          options: [
            "Computer Engineering",
            "Information Technology",
            "CSE (Artificial Intelligence)",
            "CSE (Artificial Intelligence & Machine Learning)"
          ]
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
      subtitle: "7 Questions · Choose the option closest to how you would normally respond.",
      category: "Personality Quotient (PQ)",
      questions: [
        {
          id: "PQ1",
          section: "PQ",
          dimension: "pq",
          question: "Someone points out your mistake in front of others. You:",
          options: [
            { id: "A", text: "Accept it and learn from it.", personalityPoints: { RG: 4, ER: 3, AR: 4 }, marks: 5 },
            { id: "B", text: "Feel hurt and upset.", personalityPoints: { ER: 1 }, marks: 2.5 },
            { id: "C", text: "Think about it later.", personalityPoints: { RG: 2, PS: 3 }, marks: 4 },
            { id: "D", text: "Defend yourself immediately.", personalityPoints: { ER: 1, AR: 1 }, marks: 3 },
            { id: "E", text: "Ignore what they say.", personalityPoints: { RG: 1, PS: 1 }, marks: 3.5 }
          ]
        },
        {
          id: "PQ2",
          section: "PQ",
          dimension: "pq",
          question: "You work hard but fail. You:",
          options: [
            { id: "A", text: "Blame the circumstances.", personalityPoints: { AP: 1 }, marks: 2.5 },
            { id: "B", text: "Learn and try again.", personalityPoints: { RG: 4, AP: 3 }, marks: 5 },
            { id: "C", text: "Think about what went wrong.", personalityPoints: { RG: 2, PS: 3 }, marks: 4 },
            { id: "D", text: "Move on without thinking much.", personalityPoints: { RG: 1, AP: 1 }, marks: 3 },
            { id: "E", text: "Lose motivation.", personalityPoints: {}, marks: 2.5 }
          ]
        },
        {
          id: "PQ3",
          section: "PQ",
          dimension: "pq",
          question: "You have a heated disagreement with someone close. You:",
          options: [
            { id: "A", text: "Avoid the person afterward.", personalityPoints: { ER: 1, IA: 1 }, marks: 3 },
            { id: "B", text: "Say things you may regret.", personalityPoints: {}, marks: 2.5 },
            { id: "C", text: "Listen and explain your point calmly.", personalityPoints: { ER: 4, IA: 4 }, marks: 5 },
            { id: "D", text: "Take a break and return later.", personalityPoints: { ER: 4, IA: 2 }, marks: 4 },
            { id: "E", text: "Keep arguing.", personalityPoints: { ER: 1, IA: 1 }, marks: 3.5 }
          ]
        },
        {
          id: "PQ5",
          section: "PQ",
          dimension: "pq",
          question: "An important plan suddenly gets cancelled. You:",
          options: [
            { id: "A", text: "Look for another option.", personalityPoints: { RG: 3, AP: 4 }, marks: 4 },
            { id: "B", text: "Feel frustrated.", personalityPoints: { ER: 1 }, marks: 3 },
            { id: "C", text: "Blame whoever caused the change.", personalityPoints: {}, marks: 2.5 },
            { id: "D", text: "Accept the change and decide what to do next.", personalityPoints: { ER: 3, AP: 4 }, marks: 5 },
            { id: "E", text: "Complain but eventually accept it.", personalityPoints: { ER: 1, AP: 2 }, marks: 3.5 }
          ]
        },
        {
          id: "PQ7",
          section: "PQ",
          dimension: "pq",
          question: "You receive an angry message. You:",
          options: [
            { id: "A", text: "Write a reply but wait before sending.", personalityPoints: { ER: 4, IA: 3 }, marks: 4 },
            { id: "B", text: "Ignore it.", personalityPoints: { ER: 2, IA: 1 }, marks: 3 },
            { id: "C", text: "Ask someone else what to do.", personalityPoints: { PS: 1 }, marks: 3.5 },
            { id: "D", text: "Calm down and respond thoughtfully.", personalityPoints: { ER: 4, IA: 4 }, marks: 5 },
            { id: "E", text: "Reply immediately.", personalityPoints: {}, marks: 2.5 }
          ]
        },
        {
          id: "PQ8",
          section: "PQ",
          dimension: "pq",
          question: "You realise that your decision hurt someone. You:",
          options: [
            { id: "A", text: "Explain why you did it.", personalityPoints: { AR: 1 }, marks: 3 },
            { id: "B", text: "Accept your mistake and apologise.", personalityPoints: { IA: 4, AR: 4 }, marks: 5 },
            { id: "C", text: "Try to correct the situation first.", personalityPoints: { AR: 4, AP: 3 }, marks: 4 },
            { id: "D", text: "Avoid discussing it.", personalityPoints: {}, marks: 2.5 },
            { id: "E", text: "Apologise if they were reasonable.", personalityPoints: { IA: 1, AR: 2 }, marks: 3.5 }
          ]
        },
        {
          id: "PQ10",
          section: "PQ",
          dimension: "pq",
          question: "Someone behaves rudely toward you for no obvious reason. You:",
          options: [
            { id: "A", text: "Respond firmly.", personalityPoints: { ER: 2, IA: 2 }, marks: 3.5 },
            { id: "B", text: "Feel upset about it.", personalityPoints: { ER: 1 }, marks: 2.5 },
            { id: "C", text: "Avoid them afterward.", personalityPoints: { ER: 1, IA: 1 }, marks: 3 },
            { id: "D", text: "Consider that something may be troubling them.", personalityPoints: { IA: 4, PS: 2 }, marks: 4.5 },
            { id: "E", text: "Ask if something is bothering them.", personalityPoints: { ER: 3, IA: 4 }, marks: 5 }
          ]
        }
      ]
    },
    {
      id: "section_iq",
      dimension: "iq",
      section: "IQ",
      title: "Section 2 — Intellectual Quotient (IQ)",
      subtitle: "6 Questions · Correct = 5 marks, Incorrect = 0 marks · Maximum = 30 marks.",
      category: "Intellectual Quotient (IQ)",
      questions: [
        {
          id: "IQ1",
          section: "IQ",
          dimension: "iq",
          question: "What comes next?\n\n3, 7, 15, 31, 63, ?",
          correctAnswer: "D",
          category: "Pattern Recognition",
          options: [
            { id: "A", text: "95", marks: 0 },
            { id: "B", text: "111", marks: 0 },
            { id: "C", text: "125", marks: 0 },
            { id: "D", text: "127", marks: 5 },
            { id: "E", text: "129", marks: 0 }
          ]
        },
        {
          id: "IQ2",
          section: "IQ",
          dimension: "iq",
          question: "A product is marked 25% above its cost price and then sold at a 10% discount. What is the profit percentage?",
          correctAnswer: "B",
          category: "Quantitative Reasoning",
          options: [
            { id: "A", text: "10%", marks: 0 },
            { id: "B", text: "12.5%", marks: 5 },
            { id: "C", text: "15%", marks: 0 },
            { id: "D", text: "17.5%", marks: 0 },
            { id: "E", text: "20%", marks: 0 }
          ]
        },
        {
          id: "IQ3",
          section: "IQ",
          dimension: "iq",
          question: "All doctors are educated. Some educated people are writers. Which statement must be true?",
          correctAnswer: "D",
          category: "Logical Reasoning",
          options: [
            { id: "A", text: "Some doctors are writers.", marks: 0 },
            { id: "B", text: "All writers are doctors.", marks: 0 },
            { id: "C", text: "Some writers are doctors.", marks: 0 },
            { id: "D", text: "All doctors are educated.", marks: 5 },
            { id: "E", text: "No doctors are writers.", marks: 0 }
          ]
        },
        {
          id: "IQ5",
          section: "IQ",
          dimension: "iq",
          question: "2, 6, 12, 20, 30, ?",
          correctAnswer: "C",
          category: "Pattern Recognition",
          options: [
            { id: "A", text: "36", marks: 0 },
            { id: "B", text: "40", marks: 0 },
            { id: "C", text: "42", marks: 5 },
            { id: "D", text: "44", marks: 0 },
            { id: "E", text: "48", marks: 0 }
          ]
        },
        {
          id: "IQ7",
          section: "IQ",
          dimension: "iq",
          question: "Five people are standing in a line. Ravi is ahead of Amit. Sameer is behind Amit. Neha is ahead of Ravi. Who must be ahead of Sameer?",
          correctAnswer: "C",
          category: "Logical Reasoning",
          options: [
            { id: "A", text: "Only Amit", marks: 0 },
            { id: "B", text: "Only Ravi", marks: 0 },
            { id: "C", text: "Both Ravi and Amit", marks: 5 },
            { id: "D", text: "Neha only", marks: 0 },
            { id: "E", text: "Cannot be determined", marks: 0 }
          ]
        },
        {
          id: "IQ9",
          section: "IQ",
          dimension: "iq",
          question: "If BOOK is coded as CPPL, how is MIND coded?",
          correctAnswer: "B",
          category: "Structured Problem Solving",
          options: [
            { id: "A", text: "NJPE", marks: 0 },
            { id: "B", text: "NJOE", marks: 5 },
            { id: "C", text: "NHMC", marks: 0 },
            { id: "D", text: "OJPF", marks: 0 },
            { id: "E", text: "NJPD", marks: 0 }
          ]
        }
      ]
    },
    {
      id: "section_sq",
      dimension: "sq",
      section: "SQ",
      title: "Section 3 — Spiritual Quotient (SQ)",
      subtitle: "7 Questions · Choose the option that most closely reflects your approach to life.",
      category: "Spiritual Quotient (SQ)",
      questions: [
        {
          id: "SQ1",
          section: "SQ",
          dimension: "sq",
          question: "When something difficult happens unexpectedly, what is the most constructive approach?",
          options: [
            { id: "A", text: "Look at what the situation can teach me.", spiritualPoints: { SE: 3, PE: 4, HP: 2, GR: 1, SA: 4 }, marks: 5 },
            { id: "B", text: "Accept that some things are simply beyond my control.", spiritualPoints: { SE: 2, PE: 2, HP: 3, GR: 1, SA: 3 }, marks: 4 },
            { id: "C", text: "Focus on getting through it as quickly as possible.", spiritualPoints: { SA: 1 }, marks: 3 },
            { id: "D", text: "Look for someone or something to blame.", spiritualPoints: {}, marks: 2.5 },
            { id: "E", text: "Assume that life is generally unfair.", spiritualPoints: {}, marks: 2.5 }
          ]
        },
        {
          id: "SQ2",
          section: "SQ",
          dimension: "sq",
          question: "Two people perform the same action, but with very different intentions. What matters more?",
          options: [
            { id: "A", text: "The action itself.", spiritualPoints: { SA: 1 }, marks: 3 },
            { id: "B", text: "Both the action and the intention behind it.", spiritualPoints: { SE: 2, PE: 3, HP: 2, GR: 2, SA: 4 }, marks: 5 },
            { id: "C", text: "The result that follows.", spiritualPoints: { PE: 1, SA: 2 }, marks: 3.5 },
            { id: "D", text: "Whether other people approve of it.", spiritualPoints: { SA: 1 }, marks: 3 },
            { id: "E", text: "Whether the person benefits from it.", spiritualPoints: { SA: 1 }, marks: 2.5 }
          ]
        },
        {
          id: "SQ4",
          section: "SQ",
          dimension: "sq",
          question: "Someone hurts you deeply but later sincerely regrets it. What is the wiser response?",
          options: [
            { id: "A", text: "Forgive immediately and forget everything.", spiritualPoints: { SE: 1, PE: 1, HP: 1, GR: 3, SA: 2 }, marks: 3.5 },
            { id: "B", text: "Continue holding the hurt so that you don't get hurt again.", spiritualPoints: {}, marks: 2.5 },
            { id: "C", text: "Make sure they experience the same pain.", spiritualPoints: {}, marks: 2.5 },
            { id: "D", text: "Forgive while still learning from what happened and maintaining appropriate boundaries.", spiritualPoints: { SE: 3, PE: 3, HP: 3, GR: 5, SA: 5 }, marks: 5 },
            { id: "E", text: "Completely remove the person from your life regardless of their change.", spiritualPoints: { GR: 1, SA: 1 }, marks: 3 }
          ]
        },
        {
          id: "SQ5",
          section: "SQ",
          dimension: "sq",
          question: "Which statement comes closest to your understanding of happiness?",
          options: [
            { id: "A", text: "Happiness mainly comes from achieving what I want.", spiritualPoints: { PE: 1, SA: 1 }, marks: 3 },
            { id: "B", text: "Happiness depends largely on favourable circumstances.", spiritualPoints: {}, marks: 2.5 },
            { id: "C", text: "Happiness comes from having fewer problems.", spiritualPoints: {}, marks: 2.5 },
            { id: "D", text: "Happiness is mainly about having good relationships.", spiritualPoints: { SE: 1, PE: 1, GR: 1, SA: 2 }, marks: 3.5 },
            { id: "E", text: "Lasting happiness depends more on inner understanding than on external circumstances.", spiritualPoints: { SE: 4, PE: 5, HP: 3, GR: 3, SA: 5 }, marks: 5 }
          ]
        },
        {
          id: "SQ6",
          section: "SQ",
          dimension: "sq",
          question: "If a person keeps repeating the same harmful behaviour despite knowing its consequences, what is most likely missing?",
          options: [
            { id: "A", text: "Better circumstances.", spiritualPoints: {}, marks: 2.5 },
            { id: "B", text: "Greater self-awareness and inner discipline.", spiritualPoints: { SE: 4, PE: 4, HP: 2, GR: 2, SA: 5 }, marks: 5 },
            { id: "C", text: "More appreciation from others.", spiritualPoints: { SA: 1 }, marks: 3 },
            { id: "D", text: "Better luck.", spiritualPoints: {}, marks: 2.5 },
            { id: "E", text: "More material success.", spiritualPoints: {}, marks: 2.5 }
          ]
        },
        {
          id: "SQ7",
          section: "SQ",
          dimension: "sq",
          question: "What does genuine personal growth most often involve?",
          options: [
            { id: "A", text: "Understanding myself more deeply and changing my patterns.", spiritualPoints: { SE: 5, PE: 4, HP: 3, GR: 2, SA: 5 }, marks: 5 },
            { id: "B", text: "Becoming successful and respected.", spiritualPoints: { PE: 1, SA: 1 }, marks: 3 },
            { id: "C", text: "Avoiding difficult situations.", spiritualPoints: {}, marks: 2.5 },
            { id: "D", text: "Getting more control over other people or circumstances.", spiritualPoints: {}, marks: 2.5 },
            { id: "E", text: "Proving my beliefs correct.", spiritualPoints: {}, marks: 2.5 }
          ]
        },
        {
          id: "SQ9",
          section: "SQ",
          dimension: "sq",
          question: "If a person believes that actions have deeper, long-term impacts beyond immediate outcomes, what would that view most strongly encourage?",
          options: [
            { id: "A", text: "Focusing mainly on the present life.", spiritualPoints: { SA: 1 }, marks: 3 },
            { id: "B", text: "Trying to enjoy life as much as possible.", spiritualPoints: {}, marks: 2.5 },
            { id: "C", text: "Avoiding all worldly responsibilities.", spiritualPoints: {}, marks: 2.5 },
            { id: "D", text: "Believing that present actions have little importance.", spiritualPoints: {}, marks: 2.5 },
            { id: "E", text: "Taking greater responsibility for one's actions and their longer-term consequences.", spiritualPoints: { SE: 3, PE: 5, HP: 4, GR: 4, SA: 5 }, marks: 5 }
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
    greeting: "Here is your personalized PDC developmental assessment report.",
    instruction: "Join the official PDC WhatsApp Community below to receive mentor guidance and workshop updates:",
    buttonText: "Join WhatsApp Community"
  },

  // ── Registration Counter & Display Threshold Configuration ───────
  stats: {
    minDisplayThreshold: 50,
    defaultBaselineCount: 0
  },

  // ── 6 Hidden Personality Dimensions (PQ) ───────────────────────────
  personalityDimensions: {
    RG: { key: "RG", name: "Resilience & Growth", shortName: "Resilience", icon: "🌱" },
    ER: { key: "ER", name: "Emotional Regulation", shortName: "Regulation", icon: "⚖️" },
    IA: { key: "IA", name: "Interpersonal Awareness", shortName: "Empathy", icon: "🤝" },
    AR: { key: "AR", name: "Accountability & Responsibility", shortName: "Ownership", icon: "🛡️" },
    AP: { key: "AP", name: "Adaptability & Problem Orientation", shortName: "Adaptability", icon: "🔄" },
    PS: { key: "PS", name: "Purpose & Self-Reflection", shortName: "Purpose", icon: "🧭" }
  },

  // ── 8 PDC Custom Developmental Profiles ───────────────────────────
  personalityProfiles: [
    {
      id: "reflective_achiever",
      name: "Reflective Achiever",
      weights: { RG: 20, ER: 10, IA: 10, AR: 25, AP: 5, PS: 30 },
      description: "You combine a strong desire for growth with thoughtful self-reflection. You tend to value both achievement and understanding rather than pursuing results without considering their purpose."
    },
    {
      id: "resilient_builder",
      name: "Resilient Builder",
      weights: { RG: 35, ER: 10, IA: 5, AR: 15, AP: 30, PS: 5 },
      description: "You tend to respond to challenges by learning from setbacks and continuing toward your goals. You are generally willing to adapt your approach rather than allowing failure to stop your progress."
    },
    {
      id: "empathetic_harmonizer",
      name: "Empathetic Harmonizer",
      weights: { RG: 5, ER: 25, IA: 40, AR: 15, AP: 5, PS: 10 },
      description: "You naturally pay attention to how others feel and try to maintain healthy relationships. You tend to value understanding, thoughtful communication and harmony."
    },
    {
      id: "responsible_leader",
      name: "Responsible Leader",
      weights: { RG: 15, ER: 25, IA: 20, AR: 35, AP: 0, PS: 5 },
      description: "You show a strong tendency to take ownership of your actions and responsibilities. You have the potential to become someone others can rely on when situations require maturity and accountability."
    },
    {
      id: "purpose_driven_thinker",
      name: "Purpose-Driven Thinker",
      weights: { RG: 10, ER: 10, IA: 5, AR: 20, AP: 5, PS: 50 },
      description: "You naturally look beyond immediate results and ask why something matters, what you can learn from it and where it is taking you. You tend to value meaning, purpose and long-term direction."
    },
    {
      id: "adaptive_problem_solver",
      name: "Adaptive Problem Solver",
      weights: { RG: 30, ER: 10, IA: 5, AR: 10, AP: 45, PS: 0 },
      description: "You tend to look for practical ways forward when situations change or become difficult. You are comfortable adjusting your approach and focusing on what can be done next."
    },
    {
      id: "compassionate_thinker",
      name: "Compassionate Thinker",
      weights: { RG: 10, ER: 15, IA: 35, AR: 10, AP: 10, PS: 20 },
      description: "You combine reflection with strong consideration for other people's perspectives and experiences. You tend to think carefully about both situations and the people involved."
    },
    {
      id: "strategic_achiever",
      name: "Strategic Achiever",
      weights: { RG: 20, ER: 10, IA: 5, AR: 30, AP: 25, PS: 10 },
      description: "You combine responsibility, practical thinking and a focus on results. You tend to approach goals with structure while looking for effective ways to move forward."
    }
  ],

  // ── Cognitive Profile Labels & Explanations (IQ) ───────────────────
  cognitiveProfiles: {
    "Analytical & Pattern-Oriented Thinker": {
      name: "Analytical & Pattern-Oriented Thinker",
      description: "You demonstrate strong natural aptitude for recognizing mathematical progressions, spatial patterns, and deductive structures."
    },
    "Logical Problem Solver": {
      name: "Logical Problem Solver",
      description: "You apply methodical, deductive reasoning to evaluate relationships and navigate complex problem constraints."
    },
    "Quantitative Reasoner": {
      name: "Quantitative Reasoner",
      description: "You show precision in analyzing arithmetic relationships, percentages, and structured numerical problem solving."
    },
    "Balanced Analytical Thinker": {
      name: "Balanced Analytical Thinker",
      description: "You display an adaptable analytical balance across numerical deduction, pattern synthesis, and logical sequencing."
    },
    "Developing Analytical Thinker": {
      name: "Developing Analytical Thinker",
      description: "You are building a systematic approach to analytical questions, with significant room to expand deduction speed and pattern confidence through structured practice."
    }
  },

  // ── 5 Spiritual Dimensions (SQ) ────────────────────────────────────
  spiritualDimensions: {
    SE: { key: "SE", name: "Self & Existence", description: "Understanding the nature of the self beyond changing roles and external circumstances." },
    PE: { key: "PE", name: "Purpose of Existence", description: "Understanding life purpose and meaning beyond immediate outcomes." },
    HP: { key: "HP", name: "Higher Power Awareness", description: "Awareness of higher order, transcendence, and universal principles." },
    GR: { key: "GR", name: "God & Relationship", description: "Understanding God, divine connection, and spiritual values." },
    SA: { key: "SA", name: "Spiritual Application", description: "Connecting spiritual principles to real-world behaviour, decisions, and ethical responsibility." }
  },

  // ── 5 Spiritual Profile Levels ──────────────────────────────────────
  spiritualProfiles: {
    "Deep Spiritual Orientation": {
      level: "Deep Spiritual Orientation",
      description: "Strong engagement with the nature of the self, purpose of existence, higher reality and God, with an inclination to connect spirituality with life and actions."
    },
    "Purposeful Spiritual Orientation": {
      level: "Purposeful Spiritual Orientation",
      description: "Good understanding of purpose and spiritual questions, with growing awareness of higher realities and their implications."
    },
    "Developing Spiritual Understanding": {
      level: "Developing Spiritual Understanding",
      description: "Some awareness of deeper questions about life and purpose, with room to explore spiritual concepts more deeply."
    },
    "Beginning Spiritual Exploration": {
      level: "Beginning Spiritual Exploration",
      description: "Current responses are more focused on immediate/practical aspects of life, while deeper questions of existence, purpose, higher reality and God are still developing."
    },
    "Open to Spiritual Exploration": {
      level: "Open to Spiritual Exploration",
      description: "Limited evidence of developed spiritual understanding in the responses, leaving considerable scope to explore questions of existence, purpose, higher reality and God."
    }
  },

  // ── Actionable Score Insights for Backward Compatibility ──────────
  scoreInsights: {
    pq: {
      name: "Personality Quotient (PQ)",
      shortName: "PQ",
      tag: "Character, Resilience & Communication",
      icon: "⚡",
      color: "#F96340"
    },
    iq: {
      name: "Intellectual Quotient (IQ)",
      shortName: "IQ",
      tag: "Logic, Aptitude & Critical Thinking",
      icon: "💡",
      color: "#2563EB"
    },
    sq: {
      name: "Spiritual Quotient (SQ)",
      shortName: "SQ",
      tag: "Self-Awareness, Purpose & Ethical Clarity",
      icon: "🌿",
    }
  }
};

// Backward compatibility alias for scoreInsights eq/sq
window.PDC_CONFIG.scoreInsights.eq = window.PDC_CONFIG.scoreInsights.sq;

// ===================================================================
// PDC ASSESSMENT & REPORT ENGINE
// Deterministic generation:
// answers → scoring → dimensions → profiles → predefined content blocks → dynamic selection
// ===================================================================
(function () {
  const config = window.PDC_CONFIG;

  /**
   * 1. Calculate PQ Hidden Dimensions (RG, ER, IA, AR, AP, PS)
   * Normalized 0–100 using dynamic maximum possible points
   */
  function calculatePersonalityDimensions(answers) {
    const pqStep = config.steps.find(s => s.dimension === "pq");
    const dimensions = ["RG", "ER", "IA", "AR", "AP", "PS"];
    const raw = { RG: 0, ER: 0, IA: 0, AR: 0, AP: 0, PS: 0 };
    const max = { RG: 0, ER: 0, IA: 0, AR: 0, AP: 0, PS: 0 };

    if (pqStep && pqStep.questions) {
      // Calculate dynamic maximums per question
      pqStep.questions.forEach(q => {
        dimensions.forEach(dim => {
          let maxInQ = 0;
          q.options.forEach(opt => {
            const pts = (opt.personalityPoints && opt.personalityPoints[dim]) || 0;
            if (pts > maxInQ) maxInQ = pts;
          });
          max[dim] += maxInQ;
        });

        // Add obtained points
        const userChoice = answers[q.id];
        if (userChoice) {
          const chosenOpt = q.options.find(o => o.id === userChoice);
          if (chosenOpt && chosenOpt.personalityPoints) {
            dimensions.forEach(dim => {
              raw[dim] += (chosenOpt.personalityPoints[dim] || 0);
            });
          }
        }
      });
    }

    const scores = {};
    dimensions.forEach(dim => {
      scores[dim] = max[dim] > 0 ? Math.round((raw[dim] / max[dim]) * 100) : 0;
    });

    return { raw, max, scores };
  }

  /**
   * 2. Calculate Personality Profiles Fit (8 PDC Profiles)
   * Highest = Primary Profile, Second Highest = Secondary Profile
   */
  function calculatePersonalityProfiles(dimScores) {
    const profiles = config.personalityProfiles || [];
    const scoredProfiles = profiles.map((p, index) => {
      const fit = (
        (dimScores.RG || 0) * (p.weights.RG || 0) +
        (dimScores.ER || 0) * (p.weights.ER || 0) +
        (dimScores.IA || 0) * (p.weights.IA || 0) +
        (dimScores.AR || 0) * (p.weights.AR || 0) +
        (dimScores.AP || 0) * (p.weights.AP || 0) +
        (dimScores.PS || 0) * (p.weights.PS || 0)
      ) / 100;

      return {
        ...p,
        fit: Math.round(fit * 10) / 10,
        index
      };
    });

    // Sort descending by fit with deterministic tie-breaking by original index
    scoredProfiles.sort((a, b) => {
      if (b.fit !== a.fit) return b.fit - a.fit;
      return a.index - b.index;
    });

    const primary = scoredProfiles[0] || profiles[0];
    const secondary = scoredProfiles[1] || profiles[1];

    return {
      primaryProfile: {
        id: primary.id,
        name: primary.name,
        fit: primary.fit,
        description: primary.description
      },
      secondaryProfile: {
        id: secondary.id,
        name: secondary.name,
        fit: secondary.fit,
        description: secondary.description
      },
      allFits: scoredProfiles
    };
  }

  /**
   * 3. Calculate Cognitive Profile (IQ)
   * Correct = 5 marks, Incorrect = 0 marks (Max = 30)
   */
  function calculateCognitiveProfile(answers) {
    const iqStep = config.steps.find(s => s.dimension === "iq");
    let correctCount = 0;
    const correctMap = {};

    if (iqStep && iqStep.questions) {
      iqStep.questions.forEach(q => {
        const userChoice = answers[q.id];
        const isCorrect = userChoice && userChoice === q.correctAnswer;
        correctMap[q.id] = isCorrect;
        if (isCorrect) correctCount++;
      });
    }

    const totalMarks = correctCount * 5;
    const percentage = Math.round((correctCount / 6) * 100);
    const performanceText = `IQ Performance: ${correctCount} / 6`;

    // Determine deterministic label
    let label = "Developing Analytical Thinker";
    if (correctCount >= 5) {
      if (correctMap["IQ1"] && correctMap["IQ5"]) {
        label = "Analytical & Pattern-Oriented Thinker";
      } else if (correctMap["IQ3"] && correctMap["IQ7"]) {
        label = "Logical Problem Solver";
      } else {
        label = "Balanced Analytical Thinker";
      }
    } else if (correctCount >= 3) {
      if (correctMap["IQ2"] && (correctMap["IQ1"] || correctMap["IQ5"])) {
        label = "Quantitative Reasoner";
      } else if (correctMap["IQ3"] || correctMap["IQ7"]) {
        label = "Logical Problem Solver";
      } else if (correctMap["IQ1"] && correctMap["IQ5"]) {
        label = "Analytical & Pattern-Oriented Thinker";
      } else {
        label = "Balanced Analytical Thinker";
      }
    } else {
      label = "Developing Analytical Thinker";
    }

    const explanation = config.cognitiveProfiles[label]?.description ||
      "You demonstrate analytical potential with opportunities to sharpen your structured problem-solving approach.";

    return {
      correctAnswers: correctCount,
      totalMarks,
      percentage,
      performanceText,
      label,
      explanation
    };
  }

  /**
   * 4. Calculate Spiritual Profile (SQ)
   * Dimensions: SE, PE, HP, GR, SA
   */
  function calculateSpiritualProfile(answers) {
    const sqStep = config.steps.find(s => s.dimension === "sq");
    const dimensions = ["SE", "PE", "HP", "GR", "SA"];
    const raw = { SE: 0, PE: 0, HP: 0, GR: 0, SA: 0 };
    const max = { SE: 0, PE: 0, HP: 0, GR: 0, SA: 0 };

    if (sqStep && sqStep.questions) {
      sqStep.questions.forEach(q => {
        dimensions.forEach(dim => {
          let maxInQ = 0;
          q.options.forEach(opt => {
            const pts = (opt.spiritualPoints && opt.spiritualPoints[dim]) || 0;
            if (pts > maxInQ) maxInQ = pts;
          });
          max[dim] += maxInQ;
        });

        const userChoice = answers[q.id];
        if (userChoice) {
          const chosenOpt = q.options.find(o => o.id === userChoice);
          if (chosenOpt && chosenOpt.spiritualPoints) {
            dimensions.forEach(dim => {
              raw[dim] += (chosenOpt.spiritualPoints[dim] || 0);
            });
          }
        }
      });
    }

    const scores = {};
    dimensions.forEach(dim => {
      scores[dim] = max[dim] > 0 ? Math.round((raw[dim] / max[dim]) * 100) : 0;
    });

    const overallScore = Math.round((scores.SE + scores.PE + scores.HP + scores.GR + scores.SA) / 5);

    let level = "Open to Spiritual Exploration";
    if (overallScore >= 80) {
      level = "Deep Spiritual Orientation";
    } else if (overallScore >= 60) {
      level = "Purposeful Spiritual Orientation";
    } else if (overallScore >= 40) {
      level = "Developing Spiritual Understanding";
    } else if (overallScore >= 20) {
      level = "Beginning Spiritual Exploration";
    } else {
      level = "Open to Spiritual Exploration";
    }

    const levelData = config.spiritualProfiles[level] || config.spiritualProfiles["Developing Spiritual Understanding"];

    // Explicit spiritual explanation paragraph
    let explanationParagraph = "";
    if (level === "Deep Spiritual Orientation") {
      explanationParagraph = "Your responses demonstrate an active inquiry into the nature of the self and human existence, recognizing that actions carry deeper consequences. You show strong awareness of higher powers and God, with an inclination to apply spiritual principles directly to daily decisions and personal ethics.";
    } else if (level === "Purposeful Spiritual Orientation") {
      explanationParagraph = "You show a thoughtful orientation toward the purpose of existence and recognize that life holds meaning beyond immediate material outcomes. Your responses reflect growing awareness of higher reality and God, with genuine interest in grounding daily choices in deeper principles.";
    } else if (level === "Developing Spiritual Understanding") {
      explanationParagraph = "Your responses indicate an emerging awareness of the deeper questions regarding self, life purpose, and ethical responsibility. While current choices are often pragmatic, you show genuine receptivity toward exploring the nature of transcendence, higher powers, and relationship with God.";
    } else if (level === "Beginning Spiritual Exploration") {
      explanationParagraph = "Your current focus centers predominantly on immediate, practical responsibilities and everyday problem solving. Deeper questions concerning the nature of the self, purpose of existence, higher powers, and relationship with God are in initial stages of exploration.";
    } else {
      explanationParagraph = "Your responses reflect an exploratory stance where spiritual concepts and questions of higher reality, purpose of existence, and relationship with God remain open for future inquiry and deeper reflection.";
    }

    // Determine weakest dimension for personalized suggestion
    let weakestDim = "PE";
    let lowestScore = 999;
    // Tie break priority: PE, SE, HP, GR, SA
    dimensions.forEach(dim => {
      if (scores[dim] < lowestScore) {
        lowestScore = scores[dim];
        weakestDim = dim;
      }
    });

    const suggestions = {
      PE: "Suggest exploring the purpose of human life and long-term fulfillment through PDC structured wisdom sessions and guided spiritual discussions.",
      SE: "Suggest exploring the nature of the self and conscious identity beyond changing external roles through PDC reflective discussions and study sessions.",
      HP: "Suggest exploring concepts of higher reality and universal order through interactive wisdom dialogues and mentor conversations.",
      GR: "Suggest opportunities to explore the concept of God and relationship with the divine through PDC guided spiritual discussions and study sessions.",
      SA: "Suggest connecting spiritual understanding with everyday decisions, behaviour, and responsibility through PDC mentor meets and reflective discussions."
    };

    const personalizedSuggestion = suggestions[weakestDim] || suggestions.PE;

    return {
      dimensions: scores,
      raw,
      max,
      overallScore,
      level,
      description: levelData.description,
      explanationParagraph,
      weakestDimension: weakestDim,
      personalizedSuggestion
    };
  }

  /**
   * 5. Generate Strengths (4–5 items)
   * Exact format:
   * Title
   * 1–2 concise sentences.
   * PDC can strengthen this: 1 concise sentence.
   */
  function generateStrengths(primary, secondary, cognitive, spiritual, pDims) {
    const pool = [];

    // Strength from Primary Profile
    const primaryStrengths = {
      "Reflective Achiever": {
        title: "Purpose-Driven Learning & Reflection",
        description: "You actively reflect on your decisions and seek to understand the deeper purpose behind your goals rather than blindly chasing outcomes.",
        pdcSupport: "PDC can strengthen this: Guided mentorship circles and reflective forums give you safe avenues to turn deep reflection into decisive action."
      },
      "Resilient Builder": {
        title: "Persistent Constructive Resilience",
        description: "You demonstrate strong determination to learn from setbacks and maintain momentum toward your objectives despite unexpected obstacles.",
        pdcSupport: "PDC can strengthen this: Outdoor leadership challenges and student initiative teams give you tangible platforms to lead projects through adversity."
      },
      "Empathetic Harmonizer": {
        title: "Interpersonal Attunement & Harmony",
        description: "You naturally discern interpersonal dynamics and prioritize respectful, considerate communication in group settings.",
        pdcSupport: "PDC can strengthen this: Peer coordination roles and group debriefs in PDC provide structured channels to harness your natural harmony."
      },
      "Responsible Leader": {
        title: "Ownership & Dependable Accountability",
        description: "You demonstrate a mature readiness to take ownership of your actions and stand accountable when situations demand responsibility.",
        pdcSupport: "PDC can strengthen this: Event coordination responsibilities and campus batch leadership provide practical crucibles to exercise reliable leadership."
      },
      "Purpose-Driven Thinker": {
        title: "Big-Picture Clarity & Meaning",
        description: "You look past superficial rewards to evaluate long-term significance, ensuring that your endeavors stay grounded in genuine value.",
        pdcSupport: "PDC can strengthen this: Timeless wisdom sessions offer deep philosophical frameworks to align your big-picture vision with everyday college priorities."
      },
      "Adaptive Problem Solver": {
        title: "Flexible Practical Problem Solving",
        description: "You adjust quickly when circumstances shift, maintaining a solution-oriented focus on actionable next steps.",
        pdcSupport: "PDC can strengthen this: Fast-paced workshop hackathons and camp problem-solving modules will sharpen your ability to innovate under pressure."
      },
      "Compassionate Thinker": {
        title: "Thoughtful Perspective-Taking",
        description: "You carefully weigh both interpersonal feelings and situational facts before drawing conclusions or responding to conflict.",
        pdcSupport: "PDC can strengthen this: One-on-one mentor meets and reflective dialogue circles provide enriching environments to practice compassionate discernment."
      },
      "Strategic Achiever": {
        title: "Structured Execution & Goal Focus",
        description: "You combine disciplined responsibility with methodical planning to move effectively toward measurable progress.",
        pdcSupport: "PDC can strengthen this: Organizing flagship club workshops and campus projects gives you real-world scope to practice strategic execution."
      }
    };

    if (primaryStrengths[primary.name]) {
      pool.push(primaryStrengths[primary.name]);
    }

    // Strength from Secondary Profile
    const secondaryStrengths = {
      "Reflective Achiever": {
        title: "Self-Aware Decision Making",
        description: "You evaluate your personal choices with honest self-awareness, ensuring that your achievements align with your values.",
        pdcSupport: "PDC can strengthen this: Confidential mentor meets provide structured guidance to deepen self-honesty into unwavering personal confidence."
      },
      "Resilient Builder": {
        title: "Adaptable Tenacity Under Pressure",
        description: "You treat failure as an informative milestone, adjusting your approach rather than abandoning your aspirations.",
        pdcSupport: "PDC can strengthen this: Edutainment camps and experiential obstacle modules reinforce your capacity to stay composed during high-stress situations."
      },
      "Empathetic Harmonizer": {
        title: "Constructive Conflict Resolution",
        description: "You show natural inclination to listen attentively and diffuse heated disagreements with calm, measured words.",
        pdcSupport: "PDC can strengthen this: Personality development workshops offer live roleplay drills to translate your empathy into articulate diplomacy."
      },
      "Responsible Leader": {
        title: "Maturity & Ethical Consistency",
        description: "You hold yourself to steady ethical standards, building trust and respect among your peers.",
        pdcSupport: "PDC can strengthen this: Campus coordination tracks allow you to model integrity while organizing large-scale student cohorts."
      },
      "Purpose-Driven Thinker": {
        title: "Value-Centered Motivation",
        description: "You are driven by authentic meaning and principles rather than temporary external validation or peer pressure.",
        pdcSupport: "PDC can strengthen this: Advanced wisdom study circles connect your search for meaning with timeless universal literature and discussions."
      },
      "Adaptive Problem Solver": {
        title: "Practical Resourcefulness",
        description: "You focus pragmatically on what is controllable, turning sudden disruptions into productive alternatives.",
        pdcSupport: "PDC can strengthen this: Team problem-solving drills in PDC challenge you to find creative paths forward when standard resources are constrained."
      },
      "Compassionate Thinker": {
        title: "Empathetic Consideration in Teams",
        description: "You ensure group members feel heard and respected, strengthening mutual trust in collaborative efforts.",
        pdcSupport: "PDC can strengthen this: Small-group mentorship leadership lets you cultivate supportive peer environments where everyone thrives."
      },
      "Strategic Achiever": {
        title: "Organized Pragmatism",
        description: "You break complex goals into structured, actionable steps, keeping teams oriented toward results.",
        pdcSupport: "PDC can strengthen this: PDC core team planning sessions expose you to end-to-end event management and operational strategy."
      }
    };

    if (secondaryStrengths[secondary.name] && secondary.name !== primary.name) {
      pool.push(secondaryStrengths[secondary.name]);
    }

    // Strength from Cognitive Profile
    if (cognitive.correctAnswers >= 3) {
      pool.push({
        title: "Structured Analytical Thinking",
        description: "You demonstrate solid aptitude in breaking down abstract patterns and reasoning through multi-step deductions.",
        pdcSupport: "PDC can strengthen this: Software training workshops at IIT Bombay provide challenging technical environments to channel your logical acumen into real engineering capabilities."
      });
    } else {
      pool.push({
        title: "Foundational Inquiry & Growth",
        description: "You show openness to methodical problem-solving and an eagerness to verify logic step by step.",
        pdcSupport: "PDC can strengthen this: Interactive aptitude sessions and structured study circles help you master foundational analytical frameworks with confidence."
      });
    }

    // Strength from Spiritual Profile
    if (spiritual.overallScore >= 50) {
      pool.push({
        title: "Grounded Ethical & Spiritual Perspective",
        description: "You recognize that actions carry deeper consequences and value inner composure as the true anchor of lasting stability.",
        pdcSupport: "PDC can strengthen this: Timeless wisdom sessions and guided dialogues provide a supportive community to anchor your spiritual insights into daily habits."
      });
    } else {
      pool.push({
        title: "Receptivity to Deeper Principles",
        description: "You possess a practical orientation while remaining receptive to understanding how deeper values influence life and relationships.",
        pdcSupport: "PDC can strengthen this: Interactive mentor meets offer a welcoming, open forum to explore foundational questions of purpose and self-mastery."
      });
    }

    // Dimension-based 5th strength
    if (pDims.scores.AR >= 60) {
      pool.push({
        title: "Accountable Follow-Through",
        description: "You acknowledge personal mistakes quickly and prioritize rectifying commitments over deflecting responsibility.",
        pdcSupport: "PDC can strengthen this: Managing campus initiatives in PDC gives you ownership of tangible outcomes that build demonstrable credibility."
      });
    } else if (pDims.scores.ER >= 60) {
      pool.push({
        title: "Calm Emotional Equilibrium",
        description: "You demonstrate deliberate restraint when faced with unexpected provocations or tense conversations.",
        pdcSupport: "PDC can strengthen this: Stage-presentation drills and debate modules in PDWs give you safe practice maintaining poise before large audiences."
      });
    } else if (pDims.scores.RG >= 60) {
      pool.push({
        title: "Growth Mindset Under Stress",
        description: "You perceive unexpected criticism and failure as valuable feedback rather than personal defeat.",
        pdcSupport: "PDC can strengthen this: PDC adventure retreats and high-stakes team simulations offer experiential learning to test and reinforce your resilience."
      });
    } else {
      pool.push({
        title: "Authentic Willingness to Grow",
        description: "You approach new situations with an honest desire to learn, reflect, and cultivate greater self-discipline.",
        pdcSupport: "PDC can strengthen this: Personalized mentor meets provide steady, individualized frameworks to help you develop your chosen strengths."
      });
    }

    // Return exactly 4–5 strengths with both pdcStrengthen and pdcSupport
    return pool.slice(0, 5).map(s => ({
      title: s.title,
      description: s.description,
      pdcStrengthen: s.pdcStrengthen || s.pdcSupport,
      pdcSupport: s.pdcSupport || s.pdcStrengthen
    }));
  }

  /**
   * 6. Generate Development Areas (2–3 items)
   * Exact format:
   * Title
   * 1–2 concise sentences.
   * PDC can help: 1 concise sentence.
   */
  function generateDevelopmentAreas(primary, secondary, cognitive, spiritual, pDims) {
    const areas = [];

    // Find lowest personality dimensions
    const sortedDims = Object.entries(pDims.scores).sort((a, b) => a[1] - b[1]);
    const lowestDim = sortedDims[0];
    const secondLowestDim = sortedDims[1];

    const dimDevMap = {
      RG: {
        title: "Deepening Resilience During Setbacks",
        description: "When results fall short of expectations, you may occasionally experience lingering self-doubt before regrouping.",
        pdcHelp: "PDC can help: Experiential outdoor challenges and reflective debriefs build grounded resilience so failure becomes a catalyst for growth."
      },
      ER: {
        title: "Refining Emotional Composure in Provocative Moments",
        description: "Under sudden provocation or tense disagreements, taking a conscious pause before responding can prevent impulsive reactions.",
        pdcHelp: "PDC can help: Personality development workshops offer roleplay drills to practice pausing, evaluating intent, and responding with composed authority."
      },
      IA: {
        title: "Elevating Interpersonal Nuance in Diverse Groups",
        description: "Active listening and verifying the other person's perspective before asserting conclusions will enrich your collaborative communication.",
        pdcHelp: "PDC can help: Small-group mentorship circles provide a collaborative space to hone deep listening and articulate diplomacy."
      },
      AR: {
        title: "Consistent Accountability in Ambiguous Scenarios",
        description: "Developing consistent readiness to take ownership without hesitating over external circumstances will sharpen your leadership presence.",
        pdcHelp: "PDC can help: Taking coordination ownership in student events gives you guided practice in accountable decision-making."
      },
      AP: {
        title: "Flexibility When Established Plans Change",
        description: "When carefully prepared plans are disrupted, shifting focus rapidly to workable alternatives will reduce friction.",
        pdcHelp: "PDC can help: Interactive team hackathons and adventure camp modules train you to adapt your approach swiftly without frustration."
      },
      PS: {
        title: "Connecting Daily Actions to Long-Term Purpose",
        description: "Taking regular quiet time to reflect on why your goals matter will prevent routine burnout and maintain deep motivation.",
        pdcHelp: "PDC can help: Timeless wisdom sessions and reflective journaling exercises help you align daily efforts with lasting life purpose."
      }
    };

    if (dimDevMap[lowestDim[0]]) {
      areas.push(dimDevMap[lowestDim[0]]);
    }

    if (dimDevMap[secondLowestDim[0]] && areas.length < 2) {
      areas.push(dimDevMap[secondLowestDim[0]]);
    }

    // Cognitive growth area if applicable
    if (cognitive.correctAnswers < 4) {
      areas.push({
        title: "Systematic Verification in Analytical Problem Solving",
        description: "Practicing deliberate step-by-step verification before committing to conclusions will boost speed and consistency on complex problems.",
        pdcHelp: "PDC can help: Software training workshops at IIT Bombay and peer study groups break down non-standard problems into intuitive, repeatable steps."
      });
    } else {
      // Spiritual application growth area
      areas.push({
        title: "Translating Core Principles into Everyday Habits",
        description: "Bridging the gap between conceptual understanding and daily habitual practice creates steady, unshakeable character.",
        pdcHelp: "PDC can help: Confidential mentor meets and regular study circles offer practical habit-tracking tools to live your principles consistently."
      });
    }

    return areas.slice(0, 3);
  }

  /**
   * 7. Generate Overall Profile Synthesis
   * Short synthesis combining primary, secondary, cognitive, and spiritual profiles.
   */
  function generateOverallProfile(primary, secondary, cognitive, spiritual) {
    return `Your responses suggest a foundational blend of a ${primary.name} with secondary traits of a ${secondary.name}. Cognitively, you approach challenges as a ${cognitive.label}, while spiritually your perspective is characterized by a ${spiritual.level}. By intentionally connecting your reflective strengths with structured problem solving and grounded spiritual purpose, you have the potential to build an inspiring, balanced personality equipped for leadership in both academic and professional life.`;
  }

  /**
   * Master Assessment Evaluation Runner
   */
  function evaluateAssessment(answers) {
    const pDims = calculatePersonalityDimensions(answers);
    const pProfiles = calculatePersonalityProfiles(pDims.scores);
    const cognitive = calculateCognitiveProfile(answers);
    const spiritual = calculateSpiritualProfile(answers);

    const strengths = generateStrengths(
      pProfiles.primaryProfile,
      pProfiles.secondaryProfile,
      cognitive,
      spiritual,
      pDims
    );

    const developmentAreas = generateDevelopmentAreas(
      pProfiles.primaryProfile,
      pProfiles.secondaryProfile,
      cognitive,
      spiritual,
      pDims
    );

    const overallSynthesis = generateOverallProfile(
      pProfiles.primaryProfile,
      pProfiles.secondaryProfile,
      cognitive,
      spiritual
    );

    // Calculate legacy-compatible PQ, IQ, SQ scores (0-35, 0-30, 0-35)
    // To ensure 100% strict compliance with Firestore security rules:
    // scores.pq <= 35, scores.iq <= 30, scores.sq <= 35, totalScore <= 100
    const rawPqAvg = Object.values(pDims.scores).reduce((a, b) => a + b, 0) / 6;
    const legacyPq = Math.min(35, Math.round((rawPqAvg / 100) * 35 * 10) / 10);
    const legacyIq = cognitive.totalMarks; // exactly 0 to 30
    const legacySq = Math.min(35, Math.round((spiritual.overallScore / 100) * 35 * 10) / 10);
    const legacyTotal = Math.round((legacyPq + legacyIq + legacySq) * 10) / 10;

    return {
      scores: {
        pq: legacyPq,
        iq: legacyIq,
        sq: legacySq,
        eq: legacySq
      },
      totalScore: legacyTotal,
      personalityDimensions: pDims.scores,
      personalityRaw: pDims.raw,
      personalityMax: pDims.max,
      primaryProfile: pProfiles.primaryProfile,
      secondaryProfile: pProfiles.secondaryProfile,
      allProfileFits: pProfiles.allFits,
      cognitiveScore: {
        points: cognitive.totalMarks,
        correct: cognitive.correctAnswers,
        percentage: cognitive.percentage,
        performanceText: cognitive.performanceText
      },
      cognitiveProfile: {
        label: cognitive.label,
        explanation: cognitive.explanation,
        correctAnswers: cognitive.correctAnswers,
        performanceText: cognitive.performanceText,
        totalMarks: cognitive.totalMarks,
        percentage: cognitive.percentage
      },
      spiritualDimensions: spiritual.dimensions,
      spiritualProfile: {
        name: spiritual.level,
        level: spiritual.level,
        overallScore: spiritual.overallScore,
        dimensions: spiritual.dimensions,
        explanationParagraph: spiritual.explanationParagraph,
        weakestDimension: spiritual.weakestDimension,
        personalizedSuggestion: spiritual.personalizedSuggestion
      },
      report: {
        primaryProfile: pProfiles.primaryProfile,
        secondaryProfile: pProfiles.secondaryProfile,
        cognitiveProfile: cognitive,
        spiritualProfile: {
          sectionTitle: "Spiritual Profile",
          name: spiritual.level,
          explanationParagraph: spiritual.explanationParagraph,
          personalizedSuggestion: spiritual.personalizedSuggestion
        },
        strengths,
        developmentAreas,
        overallSynthesis
      }
    };
  }

  // Attach to window and PDC_CONFIG
  window.PDCAssessmentEngine = {
    calculatePersonalityDimensions,
    calculatePersonalityProfiles,
    calculateCognitiveProfile,
    calculateSpiritualProfile,
    generateStrengths,
    generateDevelopmentAreas,
    generateOverallProfile,
    evaluateAssessment
  };

  window.PDC_CONFIG.engine = window.PDCAssessmentEngine;
  window.getCampusFromBranch = window.PDC_CONFIG.getCampusFromBranch;
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = window.PDC_CONFIG;
}
