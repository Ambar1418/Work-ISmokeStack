export interface RootPhilosophy {
  id: string;
  code: string;
  title: string;
  statement: string;
  explanation: string;
  sourceNote: string;
  side: "left" | "right" | "center";
}

export interface TrunkDimension {
  id: string;
  label: string;
  summary: string;
  interpretationNote: string;
  angleDeg: number;
  connectedTo: string[];
}

export interface CareerRole {
  title: string;
  period: string;
}

export interface CareerCompany {
  id: string;
  company: string;
  chapterId:
    | "foundations"
    | "growth"
    | "strategy"
    | "advisory";
  track: "chronological" | "parallel";
  overallSpan: string;
  roles: CareerRole[];
  highlights: string[];
  fruitOutcome?: string;
  dimensions: string[];
  branchSide: "left" | "right";
}

export interface CareerChapter {
  id: "foundations" | "growth" | "strategy" | "advisory";
  label: string;
  period: string;
  subtitle: string;
  description: string;
}

export interface ExpertiseCluster {
  id: string;
  label: string;
  category: "strategy" | "demand" | "execution" | "leadership";
  description: string;
  examples: string[];
  companyIds: string[];
}

export interface PhilosophyStatement {
  id: string;
  quote: string;
  context: string;
}

export interface SceneMeta {
  id: string;
  number: string;
  label: string;
}

export const SONIA_IDENTITY = {
  name: "SONIA",
  title: "THE ARCHITECT OF CLARITY",
  coreQuote: "I notice what others don't.",
  mainStatement: "See the unseen. Connect the dots. Make things simpler.",
  supportingLine:
    "A mind that finds the gaps, connects the dots and turns complexity into clarity.",
  scrollCue: "EXPLORE THE THINKING",
  closingStatementLine1: "Growth isn't just about going further.",
  closingStatementLine2: "It's about understanding what connects everything.",
  closingTagline: "Building. Learning. Growing.",
  // Supply verified LinkedIn URL here when available. Null avoids fabricated or broken links.
  linkedinUrl: "https://www.linkedin.com/in/soniaspecialist/" as string | null,
};

export const SCENES: SceneMeta[] = [
  { id: "scene-seed", number: "01", label: "The Seed" },
  { id: "scene-roots", number: "02", label: "The Roots" },
  { id: "scene-trunk", number: "03", label: "The Trunk" },
  { id: "scene-branches", number: "04", label: "The Branches" },
  { id: "scene-leaves", number: "05", label: "The Leaves" },
  { id: "scene-philosophy", number: "06", label: "Philosophy" },
  { id: "scene-connection", number: "07", label: "Connection" },
];

export const ROOTS_DATA: RootPhilosophy[] = [
  {
    id: "observe",
    code: "ROOT 01",
    title: "OBSERVE",
    statement: "I notice what others don't.",
    explanation:
      "She pays attention to gaps, confusion and unspoken stories that others overlook before jumping to solutions.",
    sourceNote: "Core mindset",
    side: "left",
  },
  {
    id: "understand",
    code: "ROOT 02",
    title: "UNDERSTAND",
    statement: "I like to understand things deeply.",
    explanation:
      "She looks beyond surface-level symptoms and investigates the underlying root cause of a business or communication challenge.",
    sourceNote: "Root-cause orientation",
    side: "left",
  },
  {
    id: "simplify",
    code: "ROOT 03",
    title: "SIMPLIFY",
    statement: "I don't believe in complicating things.",
    explanation:
      "She strips away noise to focus on what the business truly needs and what genuinely moves work forward.",
    sourceNote: "Direct philosophy statement",
    side: "center",
  },
  {
    id: "connect",
    code: "ROOT 04",
    title: "CONNECT",
    statement: "Seeing the whole picture.",
    explanation:
      "She bridges brand, revenue, messaging, conversion, operations and people into one coherent system.",
    sourceNote: "Systems perspective",
    side: "right",
  },
  {
    id: "align",
    code: "ROOT 05",
    title: "ALIGN",
    statement: "Structure without chaos.",
    explanation:
      "She creates frameworks and clarity that help teams work with confidence, cohesion and shared purpose.",
    sourceNote: "Leadership philosophy",
    side: "right",
  },
];

export const TRUNK_DIMENSIONS: TrunkDimension[] = [
  {
    id: "brand",
    label: "Brand",
    summary: "Creating clarity in how a business presents itself.",
    interpretationNote: "Editorial synthesis of her positioning & brand initiatives",
    angleDeg: -90,
    connectedTo: ["communication", "demand", "people"],
  },
  {
    id: "demand",
    label: "Demand",
    summary: "Connecting marketing activities with business growth.",
    interpretationNote: "Editorial synthesis of her demand generation & revenue focus",
    angleDeg: -18,
    connectedTo: ["brand", "operations", "communication"],
  },
  {
    id: "communication",
    label: "Communication",
    summary: "Making messaging meaningful and aligned.",
    interpretationNote: "Editorial synthesis of her regional & product communication work",
    angleDeg: 54,
    connectedTo: ["brand", "demand", "people"],
  },
  {
    id: "operations",
    label: "Operations",
    summary: "Creating structures and processes that help teams execute.",
    interpretationNote: "Editorial synthesis of her marketing & sales operations leadership",
    angleDeg: 126,
    connectedTo: ["demand", "people", "brand"],
  },
  {
    id: "people",
    label: "People",
    summary: "Building confidence, collaboration and alignment.",
    interpretationNote: "Editorial synthesis of her team-building & leadership philosophy",
    angleDeg: 198,
    connectedTo: ["operations", "communication", "brand"],
  },
];

export const CAREER_CHAPTERS: CareerChapter[] = [
  {
    id: "foundations",
    label: "EARLY FOUNDATIONS",
    period: "2006–2010",
    subtitle: "Product intuition, market intelligence & regional voice",
    description:
      "Rooted in product launches, competitive research, and cross-regional communication across India and Asia.",
  },
  {
    id: "growth",
    label: "GROWTH AND DEMAND",
    period: "2010–2016",
    subtitle: "Engines of conversion, automation & operational scale",
    description:
      "Connecting marketing systems with measurable pipeline, CRM discipline, and high-performing marketing centers.",
  },
  {
    id: "strategy",
    label: "STRATEGY AND LEADERSHIP",
    period: "2016–2020+",
    subtitle: "Frameworks, global teams & executive alignment",
    description:
      "Stepping into VP and CMO leadership to unite brand, product marketing, digital strategy, and operations.",
  },
  {
    id: "advisory",
    label: "ADVISORY AND MULTI-BUSINESS LEADERSHIP",
    period: "2023–PRESENT",
    subtitle: "Parallel branches of fractional leadership & advisory impact",
    description:
      "Concurrent advisory, fractional CMO, and independent consulting engagements spanning 2013 through today.",
  },
];

export const CAREER_COMPANIES: CareerCompany[] = [
  // CHAPTER 1: EARLY FOUNDATIONS — 2006–2010
  {
    id: "bosch",
    company: "Bosch",
    chapterId: "foundations",
    track: "chronological",
    overallSpan: "May 2006 – May 2008",
    roles: [
      {
        title: "Marketing Management Trainee",
        period: "May 2006 – October 2006",
      },
      {
        title: "Marketing Specialist",
        period: "November 2006 – May 2008",
      },
    ],
    highlights: [
      "Worked on product development, marketing, market trends, customer reports, product launches and positioning.",
      "Collaborated with Carnegie Mellon University on competitive SWOT analysis.",
    ],
    fruitOutcome:
      "Collaborated with Carnegie Mellon University on competitive SWOT analysis.",
    dimensions: ["Brand", "Communication"],
    branchSide: "left",
  },
  {
    id: "faro",
    company: "FARO Technologies",
    chapterId: "foundations",
    track: "chronological",
    overallSpan: "May 2008 – August 2010",
    roles: [
      {
        title: "Marketing and Communication Manager, India",
        period: "May 2008 – March 2009",
      },
      {
        title: "Marketing and Communication Manager, Asia",
        period: "April 2009 – August 2010",
      },
    ],
    highlights: [
      "Worked on regional marketing strategy, customer insights, communication and sales enablement.",
    ],
    fruitOutcome: "Expanded scope from India leadership to Asia-wide marketing & communication.",
    dimensions: ["Communication", "Brand", "Demand"],
    branchSide: "right",
  },

  // CHAPTER 2: GROWTH AND DEMAND — 2010–2016
  {
    id: "creaform",
    company: "Creaform",
    chapterId: "growth",
    track: "chronological",
    overallSpan: "September 2010 – June 2013",
    roles: [
      {
        title: "Head of Marketing and Sales",
        period: "September 2010 – June 2013",
      },
    ],
    highlights: [
      "Worked on lead nurturing, marketing campaigns, SEO, email marketing and sales coordination.",
    ],
    dimensions: ["Demand", "Communication", "Operations"],
    branchSide: "left",
  },
  {
    id: "showmeleads",
    company: "ShowMeLeads",
    chapterId: "growth",
    track: "chronological",
    overallSpan: "August 2013 – July 2014",
    roles: [
      {
        title: "Manager, Demand Generation Services",
        period: "August 2013 – December 2013",
      },
      {
        title: "Senior Manager, Demand Generation and Marketing Automation",
        period: "January 2014 – July 2014",
      },
    ],
    highlights: [
      "Worked on lead nurturing, Marketo, Salesforce CRM, lead scoring and marketing automation.",
      "Profile reports 1,200 new opportunities and 100 closed deals in 2014.",
    ],
    fruitOutcome: "1,200 new opportunities and 100 closed deals reported in 2014.",
    dimensions: ["Demand", "Operations"],
    branchSide: "right",
  },
  {
    id: "appirio",
    company: "Appirio",
    chapterId: "growth",
    track: "chronological",
    overallSpan: "July 2014 – December 2015",
    roles: [
      {
        title: "Senior Demand Generation Manager",
        period: "July 2014 – December 2014",
      },
      {
        title: "Director, Demand Generation, Marketing and Sales Operations",
        period: "January 2015 – December 2015",
      },
    ],
    highlights: [
      "Promoted to director within six months.",
      "Built Jaipur Marketing Center with a 15-member team and oversaw hiring and training.",
      "Her profile describes a major contribution to company growth through demand generation and data optimization.",
    ],
    fruitOutcome:
      "Promoted to director within 6 months; built 15-member Jaipur Marketing Center.",
    dimensions: ["Demand", "Operations", "People"],
    branchSide: "left",
  },

  // CHAPTER 3: STRATEGY AND LEADERSHIP — 2016–2020 (with continuing roles noted accurately)
  {
    id: "lasersec",
    company: "Lasersec Technologies",
    chapterId: "strategy",
    track: "chronological",
    overallSpan: "January 2016 – July 2018 · February 2021 – Present",
    roles: [
      {
        title: "Director, Demand Generation and Sales",
        period: "January 2016 – December 2016",
      },
      {
        title: "Vice President, Global Sales Marketing",
        period: "December 2016 – July 2018",
      },
      {
        title: "Vice President, Product Marketing",
        period: "February 2021 – Present",
      },
    ],
    highlights: [
      "Led demand generation and marketing operations.",
      "Led a team of more than 20 marketing professionals in the global sales marketing role.",
      "Developed marketing frameworks and improved alignment.",
    ],
    fruitOutcome: "Led a team of 20+ marketing professionals in global sales marketing.",
    dimensions: ["Demand", "Operations", "People", "Brand"],
    branchSide: "right",
  },
  {
    id: "roundglass",
    company: "RoundGlass",
    chapterId: "strategy",
    track: "chronological",
    overallSpan: "May 2018 – April 2020",
    roles: [
      {
        title: "Leader, Digital Marketing",
        period: "May 2018 – March 2019",
      },
      {
        title: "Digital Marketing Director",
        period: "April 2019 – April 2020",
      },
    ],
    highlights: [
      "Focused on marketing strategy, communications, team alignment and measurable outcomes.",
    ],
    dimensions: ["Brand", "Communication", "People"],
    branchSide: "left",
  },
  {
    id: "ismokestack",
    company: "i-SmokeStack",
    chapterId: "strategy",
    track: "chronological",
    overallSpan: "March 2020 – Present",
    roles: [
      {
        title: "Chief Marketing Officer",
        period: "March 2020 – Present",
      },
    ],
    highlights: [
      "Led marketing and brand initiatives for early-stage startups and global teams.",
      "Built frameworks and processes to align teams.",
      "Focused on growth, operational efficiency, marketing strategy and leadership.",
    ],
    fruitOutcome:
      "Built frameworks & processes aligning early-stage startups and global teams.",
    dimensions: ["Brand", "Operations", "People", "Demand"],
    branchSide: "right",
  },

  // PARALLEL BRANCHES: ADVISORY AND MULTI-BUSINESS LEADERSHIP (Overlapping spans preserved)
  {
    id: "brand-tadkaa",
    company: "Brand Tadkaa",
    chapterId: "advisory",
    track: "parallel",
    overallSpan: "January 2013 – December 2019",
    roles: [
      {
        title: "Founder and CEO",
        period: "January 2013 – April 2014",
      },
      {
        title: "Advisory Board Member",
        period: "May 2014 – December 2019",
      },
    ],
    highlights: [
      "Founded and led Brand Tadkaa before continuing as an Advisory Board Member alongside full-time growth roles.",
    ],
    dimensions: ["Brand", "People"],
    branchSide: "left",
  },
  {
    id: "sonia-specialist",
    company: "Sonia Specialist",
    chapterId: "advisory",
    track: "parallel",
    overallSpan: "October 2013 – Present",
    roles: [
      {
        title: "Digital Consultant",
        period: "October 2013 – September 2016",
      },
      {
        title: "Consulting Specialist",
        period: "October 2016 – Present",
      },
    ],
    highlights: [
      "Independent marketing consultancy and free guidance for startups and entrepreneurs.",
    ],
    fruitOutcome: "Over a decade of ongoing independent guidance for startups & entrepreneurs.",
    dimensions: ["Brand", "Demand", "Communication", "People"],
    branchSide: "right",
  },
  {
    id: "datt-mediproducts",
    company: "Datt Mediproducts",
    chapterId: "advisory",
    track: "parallel",
    overallSpan: "April 2020 – Present",
    roles: [
      {
        title: "Fractional CMO",
        period: "April 2020 – Present",
      },
    ],
    highlights: [
      "Marketing strategy, brand initiatives, market insights and team alignment.",
    ],
    dimensions: ["Brand", "Communication", "People"],
    branchSide: "left",
  },
  {
    id: "ayu-usa",
    company: "AYU Inc USA",
    chapterId: "advisory",
    track: "parallel",
    overallSpan: "January 2023 – Present",
    roles: [
      {
        title: "Chief Marketing and Operations Advisor",
        period: "January 2023 – Present",
      },
    ],
    highlights: ["Supports marketing and operational strategy."],
    dimensions: ["Operations", "Brand", "Demand"],
    branchSide: "right",
  },
  {
    id: "ayu-lifescience",
    company: "AYU Lifescience",
    chapterId: "advisory",
    track: "parallel",
    overallSpan: "April 2025 – Present",
    roles: [
      {
        title: "Fractional Marketing Lead",
        period: "April 2025 – Present",
      },
    ],
    highlights: [
      "Product communication, website development, strategic alignment and coordination.",
      "Focus on a TGA-aligned brand experience for UAE medical buyers.",
    ],
    fruitOutcome: "TGA-aligned brand experience tailored for UAE medical buyers.",
    dimensions: ["Brand", "Communication", "Operations"],
    branchSide: "left",
  },
  {
    id: "celestial-ai",
    company: "Celestial AI",
    chapterId: "advisory",
    track: "parallel",
    overallSpan: "May 2025 – Present",
    roles: [
      {
        title: "Chief Marketing and Operations Advisor",
        period: "May 2025 – Present",
      },
    ],
    highlights: [
      "Strategy, frameworks, startup operations and leadership alignment.",
    ],
    dimensions: ["Operations", "People", "Demand"],
    branchSide: "right",
  },
];

export const EXPERTISE_LEAVES: ExpertiseCluster[] = [
  {
    id: "brand-strategy",
    label: "Brand Strategy",
    category: "strategy",
    description:
      "Shaping how organizations articulate their identity, market positioning, and buyer trust.",
    examples: [
      "Product launches & positioning at Bosch",
      "TGA-aligned brand experience for UAE medical buyers at AYU Lifescience",
      "Brand initiatives at i-SmokeStack & Datt Mediproducts",
    ],
    companyIds: ["bosch", "ayu-lifescience", "ismokestack", "datt-mediproducts"],
  },
  {
    id: "demand-generation",
    label: "Demand Generation",
    category: "demand",
    description:
      "Turning fragmented campaigns into repeatable, measurable pipeline and conversion.",
    examples: [
      "1,200 new opportunities & 100 closed deals reported in 2014 at ShowMeLeads",
      "Demand generation & data optimization growth contribution at Appirio",
      "Director of Demand Generation and Sales at Lasersec Technologies",
    ],
    companyIds: ["showmeleads", "appirio", "lasersec", "creaform"],
  },
  {
    id: "digital-marketing",
    label: "Digital Marketing",
    category: "execution",
    description:
      "Unifying SEO, email, web presence, and digital channels around real business goals.",
    examples: [
      "Digital Marketing Director at RoundGlass",
      "SEO, email marketing & campaigns at Creaform",
      "Website development & digital consulting at AYU Lifescience and Sonia Specialist",
    ],
    companyIds: ["roundglass", "creaform", "ayu-lifescience", "sonia-specialist"],
  },
  {
    id: "marketing-automation",
    label: "Marketing Automation",
    category: "demand",
    description:
      "Designing lead scoring, nurturing journeys, and CRM workflows that eliminate friction.",
    examples: [
      "Marketo, Salesforce CRM & lead scoring at ShowMeLeads",
      "Lead nurturing architecture at Creaform",
    ],
    companyIds: ["showmeleads", "creaform"],
  },
  {
    id: "product-marketing",
    label: "Product Marketing",
    category: "strategy",
    description:
      "Translating technical capabilities into clear product positioning and buyer narratives.",
    examples: [
      "VP, Product Marketing at Lasersec Technologies",
      "Product development & launches at Bosch",
      "Product communication at AYU Lifescience",
    ],
    companyIds: ["lasersec", "bosch", "ayu-lifescience"],
  },
  {
    id: "marketing-operations",
    label: "Marketing Operations",
    category: "execution",
    description:
      "Building repeatable processes, data hygiene, and operational frameworks behind growth.",
    examples: [
      "Director, Demand Generation, Marketing & Sales Operations at Appirio",
      "Chief Marketing & Operations Advisor at AYU Inc USA & Celestial AI",
      "Marketing operations leadership at Lasersec Technologies",
    ],
    companyIds: ["appirio", "ayu-usa", "celestial-ai", "lasersec"],
  },
  {
    id: "sales-alignment",
    label: "Sales Alignment",
    category: "demand",
    description:
      "Connecting marketing signals directly to sales enablement and closed revenue.",
    examples: [
      "Head of Marketing and Sales at Creaform",
      "Sales enablement across India & Asia at FARO Technologies",
      "VP, Global Sales Marketing at Lasersec Technologies",
    ],
    companyIds: ["creaform", "faro", "lasersec"],
  },
  {
    id: "communication",
    label: "Communication",
    category: "execution",
    description:
      "Replacing confusion with meaningful, consistent messaging across regions and buyers.",
    examples: [
      "Marketing & Communication Manager (India & Asia) at FARO Technologies",
      "Strategic communications at RoundGlass",
      "Product communication at AYU Lifescience",
    ],
    companyIds: ["faro", "roundglass", "ayu-lifescience"],
  },
  {
    id: "market-research",
    label: "Market Research",
    category: "strategy",
    description:
      "Grounding decisions in customer insights, competitive intelligence, and market trends.",
    examples: [
      "Competitive SWOT analysis with Carnegie Mellon University at Bosch",
      "Customer reports & market trends at Bosch",
      "Customer insights & market insights at FARO Technologies & Datt Mediproducts",
    ],
    companyIds: ["bosch", "faro", "datt-mediproducts"],
  },
  {
    id: "team-leadership",
    label: "Team Leadership",
    category: "leadership",
    description:
      "Hiring, mentoring, and empowering teams with clarity and shared purpose.",
    examples: [
      "Built 15-member Jaipur Marketing Center at Appirio",
      "Led 20+ marketing professionals at Lasersec Technologies",
      "Aligned global teams and startups at i-SmokeStack",
    ],
    companyIds: ["appirio", "lasersec", "ismokestack"],
  },
  {
    id: "strategic-consulting",
    label: "Strategic Consulting",
    category: "leadership",
    description:
      "Guiding founders and multi-business leadership teams through complexity with clarity.",
    examples: [
      "Consulting Specialist & free guidance for startups at Sonia Specialist",
      "Advisory Board Member at Brand Tadkaa",
      "Executive advisory at AYU Inc USA & Celestial AI",
    ],
    companyIds: ["sonia-specialist", "brand-tadkaa", "ayu-usa", "celestial-ai"],
  },
  {
    id: "growth-strategy",
    label: "Growth Strategy",
    category: "leadership",
    description:
      "Aligning brand, demand, operations, and people so companies scale without chaos.",
    examples: [
      "Chief Marketing Officer at i-SmokeStack",
      "Fractional CMO at Datt Mediproducts",
      "Strategy & startup operations at Celestial AI",
    ],
    companyIds: ["ismokestack", "datt-mediproducts", "celestial-ai"],
  },
];

export const PHILOSOPHY_STATEMENTS: PhilosophyStatement[] = [
  {
    id: "p1",
    quote: "I don't believe in complicating things.",
    context: "Clarity over noise",
  },
  {
    id: "p2",
    quote: "I focus on what the business truly needs.",
    context: "Substance over vanity",
  },
  {
    id: "p3",
    quote: "My strength is seeing the whole picture.",
    context: "Systems over silos",
  },
  {
    id: "p4",
    quote: "I bring structure without chaos.",
    context: "Frameworks with agility",
  },
  {
    id: "p5",
    quote: "I help teams feel more confident and connected.",
    context: "Alignment through people",
  },
  {
    id: "p6",
    quote: "Marketing should feel clear, meaningful and human.",
    context: "Purpose in every message",
  },
];

