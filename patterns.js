// patterns.js — Shared scoring engine for IncluPost & PostCheck
// Based on LMIC (2024), Davies et al. (2023), Zurich UK (2024), Markel & Elia (2016)

const PATTERNS = [
  {
    category: "Excessive Soft Skills",
    icon: "👥",
    regex: /\b(outgoing|bubbly|energetic personality|people person|team player|thrives? in a fast[- ]paced|like a family|socially confident|extrovert|strong interpersonal|excellent communication skills|highly motivated individual|passionate about|go-getter|self-starter|proactive mindset|entrepreneurial spirit|natural leader)\b/gi,
    severity: "red",
    explanation: "Neurodivergent candidates interpret personality requirements literally and self-exclude when they don't match. These describe who someone IS, not what they can DO.",
    source: "LMIC/auticon Canada, 2024",
    suggestions: {
      "thrives in a fast-paced": "can manage varying workloads with appropriate support",
      "thrives in a fast paced": "can manage varying workloads with appropriate support",
      "outgoing": "communicates clearly with team members",
      "bubbly": "positive and collaborative",
      "people person": "works well with colleagues",
      "team player": "collaborates effectively on shared tasks",
      "like a family": "supportive and respectful work environment",
      "socially confident": "comfortable communicating in your preferred format",
      "energetic personality": "motivated and engaged",
      "extrovert": "comfortable interacting with colleagues as needed",
      "strong interpersonal": "able to work with others",
      "excellent communication skills": "can communicate clearly in writing or conversation",
      "highly motivated individual": "takes responsibility for assigned tasks",
      "passionate about": "interested in",
      "go-getter": "takes initiative on tasks",
      "self-starter": "can work independently when given clear direction",
      "proactive mindset": "identifies and communicates potential issues early",
      "entrepreneurial spirit": "comfortable proposing new approaches",
      "natural leader": "can coordinate tasks when needed"
    }
  },
  {
    category: "Jargon & Ambiguity",
    icon: "🔤",
    regex: /\b(synergy|leverage|dynamic environment|wear many hats|hit the ground running|rock star|ninja|guru|bandwidth|circle back|move the needle|deep dive|low-hanging fruit|boil the ocean|drink the Kool-Aid|think outside the box|navigate ambiguity|fast[- ]moving environment|lean environment)\b/gi,
    severity: "yellow",
    explanation: "53% of job postings contain jargon. Vague language makes it impossible for neurodivergent candidates to assess whether the role matches their skills.",
    source: "LMIC, 2024",
    suggestions: {
      "dynamic environment": "work priorities may shift based on project needs",
      "wear many hats": "this role includes varied responsibilities",
      "hit the ground running": "begin contributing within the first weeks with onboarding support",
      "rock star": "highly skilled",
      "ninja": "expert",
      "guru": "specialist",
      "synergy": "collaboration",
      "bandwidth": "capacity",
      "circle back": "follow up",
      "move the needle": "make measurable progress",
      "deep dive": "detailed analysis",
      "low-hanging fruit": "quick improvements",
      "think outside the box": "propose creative solutions",
      "navigate ambiguity": "work effectively when requirements are still being defined",
      "fast-moving environment": "priorities can change; we communicate changes clearly",
      "fast moving environment": "priorities can change; we communicate changes clearly",
      "lean environment": "small team with shared responsibilities",
      "boil the ocean": "take on too much at once",
      "drink the Kool-Aid": "align with company values"
    }
  },
  {
    category: "Over-Specificity",
    icon: "📏",
    regex: /\b(must have exactly \d+|minimum \d+ years|at least \d+ years|required:? \d+\+ years)\b/gi,
    severity: "yellow",
    explanation: "Neurodivergent candidates interpret requirements literally. If they meet 9 of 10 listed criteria, they often won't apply. Neurotypical candidates typically apply at ~60% match.",
    source: "Markel & Elia, 2016",
    suggestions: {
      "must have exactly": "ideally has around",
      "minimum": "typically"
    }
  },
  {
    category: "Complex Application",
    icon: "📋",
    regex: /\b(video introduction|cover letter required|personality test|multiple rounds|assessment centre|group exercise|presentation required|portfolio required|\d+ references|submit .{0,20} and .{0,20} and .{0,20})\b/gi,
    severity: "yellow",
    explanation: "42% of postings include complex application processes. Each additional step creates executive function overload for ADHD and autistic candidates.",
    source: "LMIC, 2024; Zurich UK, 2024",
    suggestions: {
      "video introduction": "optional: short written note about your interest in the role",
      "cover letter required": "optional: brief statement on why you're interested (max 200 words)",
      "personality test": "skills-based assessment relevant to the role",
      "assessment centre": "structured interview with a practical task",
      "group exercise": "individual task demonstrating your approach",
      "presentation required": "option to present or submit a written summary",
      "portfolio required": "share examples of previous work in any format you prefer"
    }
  },
  {
    category: "Sensory & Social Demands",
    icon: "🔊",
    regex: /\b(open plan office|open-plan|mandatory team socials|regular networking events?|client[- ]facing at all times|constant collaboration|always[- ]on|high[- ]energy environment|must attend .{0,20} events?|weekly team drinks)\b/gi,
    severity: "red",
    explanation: "Sensory overload and mandatory socialising are significant barriers for autistic candidates. Stating these without alternatives signals an inflexible environment.",
    source: "Davies et al., 2023",
    suggestions: {
      "open plan office": "office environment with quiet spaces available",
      "open-plan": "office with quiet zones available",
      "mandatory team socials": "optional team activities",
      "regular networking events": "opportunities to connect with colleagues in varied formats",
      "client-facing at all times": "client interaction is part of the role (preparation time provided)",
      "constant collaboration": "mix of collaborative and independent work",
      "always-on": "responsive during core hours",
      "always on": "responsive during core hours",
      "high-energy environment": "engaged and focused work environment",
      "high energy environment": "engaged and focused work environment",
      "weekly team drinks": "optional team social time"
    }
  }
];

const INCLUSION_SIGNALS = [
  { regex: /\b(flexible|remote|hybrid|work from home|WFH)\b/gi, label: "Flexibility mentioned", icon: "🏠" },
  { regex: /\b(accommodat|adjustment|accessibility|support available|reasonable adjustment)\b/gi, label: "Accommodations mentioned", icon: "♿" },
  { regex: /\b(diversity|inclusion|equity|neurodiversity|disability confident|equal opportunity)\b/gi, label: "DEI commitment mentioned", icon: "🌍" },
  { regex: /\b(part[- ]time option|reduced hours|flexible schedule|flexible hours|flexitime)\b/gi, label: "Schedule flexibility", icon: "⏰" },
];

// Scoring engine
function analyzePosting(text) {
  let score = 100;
  const flags = [];

  PATTERNS.forEach(pattern => {
    const matches = [...text.matchAll(pattern.regex)];
    const seen = new Set();
    matches.forEach(match => {
      const phrase = match[0].toLowerCase();
      if (seen.has(phrase)) return;
      seen.add(phrase);
      
      const deduction = pattern.severity === "red" ? 8 : 5;
      score -= deduction;

      const suggestionKey = Object.keys(pattern.suggestions || {})
        .find(k => phrase.includes(k.toLowerCase()));

      flags.push({
        phrase: match[0],
        category: pattern.category,
        icon: pattern.icon,
        severity: pattern.severity,
        explanation: pattern.explanation,
        source: pattern.source,
        suggestion: pattern.suggestions?.[suggestionKey] || "Consider rephrasing to describe specific job tasks rather than personality traits"
      });
    });
  });

  // Check inclusion signals
  const inclusionResults = INCLUSION_SIGNALS.map(signal => ({
    label: signal.label,
    icon: signal.icon,
    present: signal.regex.test(text)
  }));

  // Penalise missing inclusion signals
  const missing = inclusionResults.filter(s => !s.present).length;
  score -= missing * 5;

  score = Math.max(0, Math.min(100, score));

  return { score, flags, inclusionResults };
}

function generateRevised(text, flags) {
  let revised = text;
  flags.forEach(flag => {
    if (flag.suggestion && !flag.suggestion.startsWith("Consider")) {
      const escaped = flag.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      revised = revised.replace(new RegExp(escaped, 'gi'), flag.suggestion);
    }
  });
  return revised;
}
