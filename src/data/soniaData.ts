export interface RootQuality {
  id: string;
  code: string;
  title: string;
  quote: string;
  explanation: string;
}

export interface TrunkPillar {
  id: string;
  label: string;
  summary: string;
}

export interface StrategyBranch {
  id: "brand" | "revenue" | "marketing" | "operations" | "product" | "people";
  label: string;
  essence: string;
  description: string;
  featuredCompanyId: string;
  companyIds: string[];
}

export interface CareerRole {
  title: string;
  period: string;
}

export interface CareerMilestone {
  id: string;
  company: string;
  chapterLabel: string;
  track: "chronological" | "parallel";
  overallSpan: string;
  roles: CareerRole[];
  highlights: string[];
  fruitOutcome?: string;
  branchIds: StrategyBranch["id"][];
  isFeaturedLeaf?: boolean;
}

export interface ImpactFruit {
  id: string;
  companyId: string;
  company: string;
  period: string;
  headline: string;
  summary: string;
  context: string;
  branchIds: StrategyBranch["id"][];
}

export interface SeedInitiative {
  id: string;
  title: string;
  organization: string;
  period: string;
  role: string;
  focus: string;
}

export interface ClarityKnot {
  id: string;
  knot: string;
  rootUsed: string;
  branchUsed: StrategyBranch["id"];
  approach: string;
  suggestedSubject: string;
}

export interface KnowledgeEntrySeed {
  id: string;
  category:
    | "biography"
    | "career"
    | "expertise"
    | "achievement"
    | "insight"
    | "faq";
  title: string;
  content: string;
  branchId?: StrategyBranch["id"];
  published: boolean;
}

export interface DiagnosticPromptOption {
  id: string;
  challengeCategory: string;
  prompt: string;
  branchId: StrategyBranch["id"];
  followUpQuestions: string[];
  recommendedActions: string[];
  relevantExpertise: string[];
}

export const SONIA_IDENTITY = {
  name: "SONIA",
  title: "THE ARCHITECT OF CLARITY",
  coreQuote: "I notice what others don't.",
  mainStatement: "See the unseen. Connect the dots. Make things simpler.",
  supportingLine:
    "A strategic marketing and operations leader who finds the gaps, connects brand to revenue, and turns organizational complexity into calm clarity.",
  closingStatementLine1: "Growth isn't just about going further.",
  closingStatementLine2: "It's about understanding what connects everything.",
  closingTagline: "Building. Learning. Growing.",
  // Verified LinkedIn URL (update here if profile URL changes)
  linkedinUrl: "https://www.linkedin.com/in/soniaspecialist/" as string | null,
};

// Six Roots: Professional qualities and philosophy
export const ROOTS_DATA: RootQuality[] = [
  {
    id: "observe",
    code: "01",
    title: "Observe",
    quote: "I notice what others don't.",
    explanation:
      "Paying close attention to gaps, confusion, and unspoken stories before jumping to conclusions.",
  },
  {
    id: "understand",
    code: "02",
    title: "Understand",
    quote: "I like to understand things deeply.",
    explanation:
      "Looking beneath surface symptoms to diagnose the root cause of a market, product, or team challenge.",
  },
  {
    id: "simplify",
    code: "03",
    title: "Simplify",
    quote: "I don't believe in complicating things.",
    explanation:
      "Focusing strictly on what the business truly needs and what genuinely moves work forward.",
  },
  {
    id: "connect",
    code: "04",
    title: "Connect",
    quote: "My strength is seeing the whole picture.",
    explanation:
      "Uniting brand, revenue, messaging, conversion, operations, and people into one coherent system.",
  },
  {
    id: "align",
    code: "05",
    title: "Align",
    quote: "I bring structure without chaos.",
    explanation:
      "Designing frameworks and processes that help teams feel confident, connected, and able to execute.",
  },
  {
    id: "humanize",
    code: "06",
    title: "Purpose",
    quote: "Marketing should feel clear, meaningful and human.",
    explanation:
      "Ensuring communication respects the intelligence of buyers and builds durable trust.",
  },
];

// Trunk: Leadership, Clarity, Structure, Alignment
export const TRUNK_PILLARS: TrunkPillar[] = [
  {
    id: "leadership",
    label: "Leadership",
    summary:
      "Guiding global teams, marketing centers, and founders with calm direction.",
  },
  {
    id: "clarity",
    label: "Clarity",
    summary:
      "Distilling complex products and scattered efforts into focused positioning.",
  },
  {
    id: "structure",
    label: "Structure",
    summary:
      "Building repeatable frameworks, CRM discipline, and marketing operations without bureaucracy.",
  },
  {
    id: "alignment",
    label: "Alignment",
    summary:
      "Connecting marketing strategy directly with sales, product, and business outcomes.",
  },
];

// Six Strategic Branches
export const STRATEGY_BRANCHES: StrategyBranch[] = [
  {
    id: "brand",
    label: "Brand",
    essence: "Clarity in how a business presents itself",
    description:
      "Shaping product positioning, regional messaging, and buyer-aligned brand experiences across global markets.",
    featuredCompanyId: "ayu-lifescience",
    companyIds: [
      "bosch",
      "faro",
      "roundglass",
      "ismokestack",
      "datt-mediproducts",
      "ayu-lifescience",
      "brand-tadkaa",
    ],
  },
  {
    id: "revenue",
    label: "Revenue",
    essence: "Connecting marketing directly to pipeline",
    description:
      "Turning demand engines, lead scoring, and sales enablement into measurable pipeline and closed business.",
    featuredCompanyId: "showmeleads",
    companyIds: ["creaform", "showmeleads", "appirio", "lasersec", "faro"],
  },
  {
    id: "marketing",
    label: "Marketing",
    essence: "Integrated digital & regional strategy",
    description:
      "Unifying SEO, email, automation, market insights, and digital execution around measurable outcomes.",
    featuredCompanyId: "roundglass",
    companyIds: [
      "faro",
      "creaform",
      "showmeleads",
      "roundglass",
      "sonia-specialist",
      "datt-mediproducts",
    ],
  },
  {
    id: "operations",
    label: "Operations",
    essence: "Structure without chaos",
    description:
      "Architecting Marketo, Salesforce CRM, data optimization, and repeatable operational frameworks.",
    featuredCompanyId: "appirio",
    companyIds: [
      "showmeleads",
      "appirio",
      "lasersec",
      "ismokestack",
      "ayu-usa",
      "celestial-ai",
    ],
  },
  {
    id: "product",
    label: "Product",
    essence: "Translating capability into market value",
    description:
      "Partnering from product development and competitive SWOT analysis to global product launches.",
    featuredCompanyId: "bosch",
    companyIds: ["bosch", "lasersec", "ayu-lifescience"],
  },
  {
    id: "people",
    label: "People",
    essence: "Confidence, mentorship, and shared purpose",
    description:
      "Hiring, training, and aligning marketing teams of 15 to 20+ professionals as well as startup founders.",
    featuredCompanyId: "ismokestack",
    companyIds: [
      "appirio",
      "lasersec",
      "roundglass",
      "ismokestack",
      "sonia-specialist",
      "celestial-ai",
    ],
  },
];

// Complete Career Milestones (Leaves — curated featured leaves + full 14-engagement record)
export const CAREER_MILESTONES: CareerMilestone[] = [
  {
    id: "bosch",
    company: "Bosch",
    chapterLabel: "Early Foundations · 2006–2008",
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
    branchIds: ["product", "brand"],
    isFeaturedLeaf: true,
  },
  {
    id: "faro",
    company: "FARO Technologies",
    chapterLabel: "Early Foundations · 2008–2010",
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
    fruitOutcome:
      "Expanded regional leadership from India to Asia-wide marketing and communication.",
    branchIds: ["brand", "marketing", "revenue"],
  },
  {
    id: "creaform",
    company: "Creaform",
    chapterLabel: "Growth & Demand · 2010–2013",
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
    branchIds: ["revenue", "marketing"],
  },
  {
    id: "showmeleads",
    company: "ShowMeLeads",
    chapterLabel: "Growth & Demand · 2013–2014",
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
    fruitOutcome:
      "Profile reports 1,200 new opportunities and 100 closed deals in 2014.",
    branchIds: ["revenue", "operations", "marketing"],
    isFeaturedLeaf: true,
  },
  {
    id: "appirio",
    company: "Appirio",
    chapterLabel: "Growth & Demand · 2014–2015",
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
      "Promoted to director within six months; built 15-member Jaipur Marketing Center.",
    branchIds: ["operations", "revenue", "people"],
    isFeaturedLeaf: true,
  },
  {
    id: "lasersec",
    company: "Lasersec Technologies",
    chapterLabel: "Strategy & Leadership · 2016–Present",
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
    fruitOutcome:
      "Led a team of more than 20 marketing professionals in the global sales marketing role.",
    branchIds: ["product", "revenue", "operations", "people"],
  },
  {
    id: "roundglass",
    company: "RoundGlass",
    chapterLabel: "Strategy & Leadership · 2018–2020",
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
    branchIds: ["marketing", "brand", "people"],
    isFeaturedLeaf: true,
  },
  {
    id: "ismokestack",
    company: "i-SmokeStack",
    chapterLabel: "Strategy & Leadership · 2020–Present",
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
      "Built frameworks and processes aligning early-stage startups and global teams.",
    branchIds: ["people", "brand", "operations"],
    isFeaturedLeaf: true,
  },
  {
    id: "brand-tadkaa",
    company: "Brand Tadkaa",
    chapterLabel: "Parallel Advisory · 2013–2019",
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
    branchIds: ["brand", "people"],
  },
  {
    id: "sonia-specialist",
    company: "Sonia Specialist",
    chapterLabel: "Parallel Consultancy · 2013–Present",
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
    fruitOutcome:
      "Ongoing independent marketing consultancy and free guidance for startups and entrepreneurs.",
    branchIds: ["marketing", "people"],
  },
  {
    id: "datt-mediproducts",
    company: "Datt Mediproducts",
    chapterLabel: "Parallel Fractional CMO · 2020–Present",
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
    branchIds: ["brand", "marketing"],
  },
  {
    id: "ayu-usa",
    company: "AYU Inc USA",
    chapterLabel: "Parallel Advisory · 2023–Present",
    track: "parallel",
    overallSpan: "January 2023 – Present",
    roles: [
      {
        title: "Chief Marketing and Operations Advisor",
        period: "January 2023 – Present",
      },
    ],
    highlights: ["Supports marketing and operational strategy."],
    branchIds: ["operations", "marketing"],
  },
  {
    id: "ayu-lifescience",
    company: "AYU Lifescience",
    chapterLabel: "Parallel Fractional Lead · 2025–Present",
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
    fruitOutcome:
      "Focus on a TGA-aligned brand experience for UAE medical buyers.",
    branchIds: ["brand", "product"],
    isFeaturedLeaf: true,
  },
  {
    id: "celestial-ai",
    company: "Celestial AI",
    chapterLabel: "Parallel Advisory · 2025–Present",
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
    branchIds: ["operations", "people"],
  },
];

// Fruits: Documented Achievements & Impact Case Studies
export const IMPACT_FRUITS: ImpactFruit[] = [
  {
    id: "fruit-showmeleads",
    companyId: "showmeleads",
    company: "ShowMeLeads",
    period: "2013 – 2014",
    headline: "1,200 new opportunities & 100 closed deals in 2014",
    summary:
      "Combined Marketo, Salesforce CRM, lead scoring, and structured lead nurturing to turn demand generation into measurable pipeline.",
    context:
      "Senior Manager, Demand Generation and Marketing Automation (Jan 2014 – Jul 2014)",
    branchIds: ["revenue", "operations", "marketing"],
  },
  {
    id: "fruit-appirio",
    companyId: "appirio",
    company: "Appirio",
    period: "2014 – 2015",
    headline: "Built 15-member Jaipur Marketing Center & promoted in 6 months",
    summary:
      "Oversaw hiring, training, demand generation, and data optimization—contributing significantly to company growth and earning promotion to Director within six months.",
    context:
      "Director, Demand Generation, Marketing and Sales Operations (Jan 2015 – Dec 2015)",
    branchIds: ["operations", "people", "revenue"],
  },
  {
    id: "fruit-lasersec",
    companyId: "lasersec",
    company: "Lasersec Technologies",
    period: "2016 – Present",
    headline: "Led 20+ marketing professionals & global sales alignment",
    summary:
      "Developed marketing frameworks and improved sales-marketing alignment while leading demand generation, marketing operations, and later product marketing.",
    context:
      "VP, Global Sales Marketing (2016–2018) & VP, Product Marketing (2021–Present)",
    branchIds: ["people", "product", "operations"],
  },
  {
    id: "fruit-ayu-lifescience",
    companyId: "ayu-lifescience",
    company: "AYU Lifescience",
    period: "2025 – Present",
    headline: "TGA-aligned brand experience for UAE medical buyers",
    summary:
      "Directed product communication, website development, and cross-team strategic alignment tailored specifically to regulated medical buyers in the UAE.",
    context: "Fractional Marketing Lead (April 2025 – Present)",
    branchIds: ["brand", "product"],
  },
  {
    id: "fruit-bosch",
    companyId: "bosch",
    company: "Bosch",
    period: "2006 – 2008",
    headline: "Competitive SWOT collaboration with Carnegie Mellon University",
    summary:
      "Anchored product launches and positioning in market trends, customer insights, and rigorous academic-industry competitive SWOT analysis.",
    context: "Marketing Specialist (November 2006 – May 2008)",
    branchIds: ["product", "brand"],
  },
];

// Seeds: Knowledge Sharing, Consultancy, and Future Growth
export const SEEDS_DATA: SeedInitiative[] = [
  {
    id: "seed-sonia-specialist",
    title: "Free Startup & Founder Guidance",
    organization: "Sonia Specialist",
    period: "October 2013 – Present",
    role: "Consulting Specialist",
    focus:
      "Over a decade of independent marketing consultancy and pro-bono guidance helping startups and entrepreneurs find clarity early.",
  },
  {
    id: "seed-ismokestack",
    title: "Startup & Global Team Alignment",
    organization: "i-SmokeStack",
    period: "March 2020 – Present",
    role: "Chief Marketing Officer",
    focus:
      "Building practical growth frameworks and brand foundations for early-stage ventures and distributed teams.",
  },
  {
    id: "seed-multi-advisory",
    title: "Multi-Business Advisory & Fractional Leadership",
    organization: "AYU Inc USA · AYU Lifescience · Celestial AI · Datt Mediproducts",
    period: "2020 – Present",
    role: "Advisor & Fractional Marketing Lead",
    focus:
      "Bringing senior marketing and operational architecture across healthcare, SaaS, and emerging AI ventures simultaneously.",
  },
];

export const CLARITY_KNOTS: ClarityKnot[] = [
  {
    id: "knot-positioning",
    knot: "Our positioning or messaging feels scattered",
    rootUsed: "Observe + Simplify",
    branchUsed: "brand",
    approach:
      "Strip away surface noise, listen for unspoken buyer confusion, and rebuild a clear narrative buyers immediately trust.",
    suggestedSubject: "Clarity on brand positioning & messaging",
  },
  {
    id: "knot-pipeline",
    knot: "Marketing activity isn't turning into pipeline",
    rootUsed: "Understand + Connect",
    branchUsed: "revenue",
    approach:
      "Connect CRM, lead scoring, nurturing, and sales enablement so demand efforts map directly to revenue.",
    suggestedSubject: "Connecting demand generation to revenue",
  },
  {
    id: "knot-chaos",
    knot: "The team is growing faster than our structure",
    rootUsed: "Align",
    branchUsed: "operations",
    approach:
      "Introduce lightweight frameworks and operational clarity that help teams move with confidence instead of chaos.",
    suggestedSubject: "Marketing operations & team alignment",
  },
  {
    id: "knot-launch",
    knot: "Launching a new product or early-stage venture",
    rootUsed: "Connect + Purpose",
    branchUsed: "product",
    approach:
      "Anchor product launches in market intelligence, competitive SWOT insight, and a cohesive go-to-market rhythm.",
    suggestedSubject: "Product launch or startup advisory",
  },
];

export const PHILOSOPHY_STATEMENTS = [
  "I don't believe in complicating things.",
  "I focus on what the business truly needs.",
  "My strength is seeing the whole picture.",
  "I bring structure without chaos.",
  "I help teams feel more confident and connected.",
  "Marketing should feel clear, meaningful and human.",
];

export const DIAGNOSTIC_PROMPTS: DiagnosticPromptOption[] = [
  {
    id: "diag-leads",
    challengeCategory: "Lead Generation & Pipeline",
    prompt: "I need more qualified leads.",
    branchId: "revenue",
    followUpQuestions: [
      "Is lead volume low, or are existing leads failing to convert?",
      "Are CRM lead scoring and nurturing automated today?",
    ],
    recommendedActions: [
      "Audit funnel drop-offs between inquiry and sales qualification.",
      "Introduce structured lead scoring and Marketo/CRM nurturing sequences.",
      "Align campaign messaging directly with buyer intent signals.",
    ],
    relevantExpertise: [
      "Demand Generation",
      "Marketing Automation",
      "Lead Scoring",
    ],
  },
  {
    id: "diag-alignment",
    challengeCategory: "Sales & Marketing Alignment",
    prompt: "My marketing and sales teams are disconnected.",
    branchId: "people",
    followUpQuestions: [
      "Do marketing and sales share one definition of a qualified opportunity?",
      "Are sales teams equipped with clear product and buyer insights?",
    ],
    recommendedActions: [
      "Establish shared pipeline KPIs and weekly feedback loops.",
      "Connect sales enablement directly to regional/buyer insights.",
      "Create clear handoff SLAs inside Salesforce or your CRM.",
    ],
    relevantExpertise: [
      "Sales Alignment",
      "Team Leadership",
      "Sales Enablement",
    ],
  },
  {
    id: "diag-positioning",
    challengeCategory: "Product & Brand Positioning",
    prompt: "My product positioning is unclear.",
    branchId: "brand",
    followUpQuestions: [
      "Can buyers understand your core value in under ten seconds?",
      "Is your narrative backed by competitive SWOT and customer research?",
    ],
    recommendedActions: [
      "Conduct structured competitive SWOT and customer insight interviews.",
      "Simplify messaging around the single highest-trust buyer outcome.",
      "Align website experience and product communication to target buyer standards.",
    ],
    relevantExpertise: [
      "Brand Strategy",
      "Product Marketing",
      "Market Research",
    ],
  },
  {
    id: "diag-ops",
    challengeCategory: "Marketing Operations & Structure",
    prompt: "I need better marketing operations.",
    branchId: "operations",
    followUpQuestions: [
      "Are teams spending time on manual reporting or fragmented tools?",
      "Do you have repeatable frameworks as the team scales?",
    ],
    recommendedActions: [
      "Build lightweight operating frameworks and clean CRM data hygiene.",
      "Standardize campaign workflows so teams execute with confidence.",
      "Connect operational metrics directly to growth efficiency.",
    ],
    relevantExpertise: [
      "Marketing Operations",
      "Growth Strategy",
      "Strategic Consulting",
    ],
  },
];

export const AI_KNOWLEDGE_SEED: KnowledgeEntrySeed[] = [
  {
    id: "kb-bio",
    category: "biography",
    title: "Core Professional Identity",
    content:
      "Sonia is a marketing, demand generation, product marketing, and operations leader known as 'The Architect of Clarity'. Since May 2006, she has built marketing systems, brand experiences, and high-performing teams across India, Asia, UAE, and US markets. Her core approach is: See the unseen. Connect the dots. Make things simpler.",
    branchId: "brand",
    published: true,
  },
  {
    id: "kb-philosophy",
    category: "insight",
    title: "Leadership & Working Philosophy",
    content:
      "Sonia's stated principles: 'I notice what others don't.' 'I like to understand things deeply.' 'I don't believe in complicating things.' 'I focus on what the business truly needs.' 'My strength is seeing the whole picture.' 'I bring structure without chaos.' 'I help teams feel more confident and connected.' 'Marketing should feel clear, meaningful and human.'",
    branchId: "people",
    published: true,
  },
  {
    id: "kb-showmeleads",
    category: "achievement",
    title: "ShowMeLeads — Demand Generation & Automation (2013–2014)",
    content:
      "At ShowMeLeads (Aug 2013 – Jul 2014), Sonia progressed from Manager, Demand Generation Services to Senior Manager, Demand Generation and Marketing Automation. She worked on lead nurturing, Marketo, Salesforce CRM, lead scoring, and marketing automation. Her profile reports 1,200 new opportunities and 100 closed deals in 2014.",
    branchId: "revenue",
    published: true,
  },
  {
    id: "kb-appirio",
    category: "achievement",
    title: "Appirio — Jaipur Marketing Center & Operations Scale (2014–2015)",
    content:
      "At Appirio (Jul 2014 – Dec 2015), Sonia joined as Senior Demand Generation Manager and was promoted to Director, Demand Generation, Marketing and Sales Operations within six months. She built the Jaipur Marketing Center with a 15-member team, oversaw hiring and training, and contributed significantly to company growth through demand generation and data optimization.",
    branchId: "operations",
    published: true,
  },
  {
    id: "kb-lasersec",
    category: "career",
    title: "Lasersec Technologies — Global Sales & Product Marketing (2016–Present)",
    content:
      "At Lasersec Technologies, Sonia served as Director, Demand Generation and Sales (Jan 2016 – Dec 2016), Vice President, Global Sales Marketing (Dec 2016 – Jul 2018) leading a team of more than 20 marketing professionals, and Vice President, Product Marketing (Feb 2021 – Present). She developed marketing frameworks and improved sales-marketing alignment.",
    branchId: "product",
    published: true,
  },
  {
    id: "kb-bosch-faro-creaform",
    category: "career",
    title: "Early Foundations & Sales Coordination (2006–2013)",
    content:
      "At Bosch (May 2006 – May 2008), Sonia worked on product development, product launches, positioning, market trends, customer reports, and collaborated with Carnegie Mellon University on competitive SWOT analysis. At FARO Technologies (May 2008 – Aug 2010), she led regional marketing and communication across India and Asia with a focus on sales enablement. At Creaform (Sep 2010 – Jun 2013), she served as Head of Marketing and Sales leading SEO, email marketing, lead nurturing, and sales coordination.",
    branchId: "product",
    published: true,
  },
  {
    id: "kb-roundglass-ismokestack",
    category: "career",
    title: "RoundGlass & i-SmokeStack Executive Leadership (2018–Present)",
    content:
      "At RoundGlass (May 2018 – Apr 2020), Sonia grew from Leader, Digital Marketing to Digital Marketing Director, focusing on strategy, communications, team alignment, and measurable outcomes. Since March 2020, she has served as Chief Marketing Officer at i-SmokeStack, leading marketing and brand initiatives for early-stage startups and global teams while building operational frameworks.",
    branchId: "marketing",
    published: true,
  },
  {
    id: "kb-advisory",
    category: "expertise",
    title: "Advisory, Fractional CMO & Startup Consultancy (2013–Present)",
    content:
      "Alongside primary executive roles, Sonia runs Sonia Specialist (Oct 2013 – Present) offering independent marketing consultancy and free guidance for startups and entrepreneurs. She has served as Founder & CEO and Advisory Board Member at Brand Tadkaa (2013–2019), Fractional CMO at Datt Mediproducts (Apr 2020 – Present), Chief Marketing and Operations Advisor at AYU Inc USA (Jan 2023 – Present) and Celestial AI (May 2025 – Present), and Fractional Marketing Lead at AYU Lifescience (Apr 2025 – Present) focused on a TGA-aligned brand experience for UAE medical buyers.",
    branchId: "brand",
    published: true,
  },
];
