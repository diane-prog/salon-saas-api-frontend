export const site = {
  name: "LEEGI Group",
  tagline: "Digital communication agency based in Dakar. We turn your ambitions into digital success.",
  phone: "+221 78 122 93 05",
  phoneRaw: "tel:+221781229305",
  email: "contact@leegigroup.com",
  address: "Dakar, Senegal",
  hours: "Mon–Fri, 9am–6pm",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/leegi-group/" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61579376777474" },
    { label: "X", href: "https://x.com/Leegigroup" },
    { label: "TikTok", href: "https://www.tiktok.com/@leegigroup" },
    { label: "Instagram", href: "https://www.instagram.com/leegigroup/" },
  ],
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/a-propos" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/realisations" },
  { label: "Contact", href: "/contact" },
];

export type Service = {
  slug: string;
  title: string;
  short: string;
  heroTitle: string;
  heroSubtitle: string;
  whyTitle: string;
  whyBody: string;
  offerings: string[];
  processLabel: string;
  processIntro: string;
  steps: { title: string; body: string }[];
  ctaTitle: string;
  ctaBody: string;
  image: string;
};

export const services: Service[] = [
  {
    slug: "branding",
    title: "Branding",
    short: "Logos, brand guidelines and memorable brand identities that stick in people's minds.",
    heroTitle: "Branding",
    heroSubtitle: "Build a strong, memorable identity",
    whyTitle: "Why branding?",
    whyBody:
      "Your brand is far more than a logo. We create complete visual identities that tell your story and captivate your audience. From logo design to a full brand guideline, every element is crafted to express who you are, inspire trust and win a place in your customers' minds.",
    offerings: [
      "Logo design",
      "Complete brand guidelines",
      "Visual identity",
      "Mockups & adaptations",
      "Brand guide",
    ],
    processLabel: "How it works",
    processIntro: "A proven process for guaranteed results.",
    steps: [
      { title: "Discovery", body: "Analysis of your market, your values and your goals" },
      { title: "Creation", body: "Design of original, creative concepts" },
      { title: "Refinement", body: "Adjustments and fine-tuning of the chosen design" },
      { title: "Delivery", body: "Final files and complete brand guidelines" },
    ],
    ctaTitle: "Ready to level up your branding?",
    ctaBody:
      "Let's talk about your project and build together a brand identity that looks like you and sets you apart.",
    image: "/img/projet-setna.jpg",
  },
  {
    slug: "site-web",
    title: "Website Development",
    short:
      "Responsive, high-performance websites optimised to convert your visitors.",
    heroTitle: "Websites",
    heroSubtitle: "Your high-performance digital storefront",
    whyTitle: "Why a website?",
    whyBody:
      "Your website is your best salesperson. We build modern, fast websites optimised to turn visitors into customers. Responsive, SEO-friendly and engineered to perform.",
    offerings: [
      "Showcase websites",
      "E-commerce",
      "Responsive design",
      "Performance optimisation",
      "Maintenance & support",
    ],
    processLabel: "How it works",
    processIntro: "A proven process for guaranteed results.",
    steps: [
      { title: "Wireframes", body: "Architecture and information structure" },
      { title: "Design", body: "Creation of modern, ergonomic mockups" },
      { title: "Development", body: "Technical integration and development" },
      { title: "Launch", body: "Testing, optimisation and go-live" },
    ],
    ctaTitle: "Ready to boost your website?",
    ctaBody:
      "Let's talk about your project and build together a website that works for you around the clock.",
    image: "/img/projet-emf.jpg",
  },
  {
    slug: "seo",
    title: "SEO",
    short: "Audit, optimisation and strategy to dominate search results.",
    heroTitle: "SEO",
    heroSubtitle: "Dominate search results",
    whyTitle: "Why SEO?",
    whyBody:
      "Being invisible on Google is like not existing. Our SEO expertise pushes you to the top of search results, bringing a steady stream of qualified leads to your website. We optimise your site, your content and your strategy to improve your positioning durably. The result: more visibility, more traffic and more opportunities for your business.",
    offerings: [
      "Full SEO audit",
      "Keyword research",
      "On-page optimisation",
      "Strategic link building",
      "Local SEO",
      "Tracking & reporting",
    ],
    processLabel: "How it works",
    processIntro: "A proven process for guaranteed results.",
    steps: [
      { title: "Audit", body: "Technical and semantic analysis of your site" },
      { title: "Strategy", body: "Personalised, prioritised action plan" },
      { title: "Optimisation", body: "Implementation of technical and content recommendations" },
      { title: "Tracking", body: "Monthly reports and continuous adjustments" },
    ],
    ctaTitle: "Ready to boost your SEO?",
    ctaBody: "Let's talk about your project and make Google your best salesperson.",
    image: "/img/projet-comprint.jpg",
  },
  {
    slug: "contenu-reels-spots",
    title: "Content, Reels & Ads",
    short:
      "Punchy visuals, articles and videos designed to capture attention and engage your audience.",
    heroTitle: "Content, Reels & Ad Spots",
    heroSubtitle: "Engage and make an impact",
    whyTitle: "Why content, Reels and ad spots?",
    whyBody:
      "Capturing attention is no longer enough: you need to make an impact. At LEEGI Group, we create visual content and videos designed to attract, engage and convince your audience. From social media content to dynamic Reels and impactful ad spots, every creation elevates your brand and delivers your message with force.",
    offerings: [
      "Social media visuals",
      "Editorial strategy",
      "Blog articles",
      "Post-production",
      "Motion design",
      "Storyboarding",
      "Corporate videos",
    ],
    processLabel: "How it works",
    processIntro: "A proven process for guaranteed results.",
    steps: [
      { title: "Strategy", body: "Definition of your editorial line and content planning" },
      { title: "Creation", body: "Production of visuals, Reels and impactful ad spots" },
      { title: "Distribution", body: "Scheduling and publication optimised for each platform" },
      { title: "Analysis", body: "Performance measurement and continuous optimisation" },
    ],
    ctaTitle: "Ready to captivate your audience?",
    ctaBody:
      "Let's talk about your project and create content that attracts, engages and converts.",
    image: "/img/projet-etincelles.jpg",
  },
  {
    slug: "evenementiel",
    title: "Events",
    short: "Planning and coordination of events that make an impact.",
    heroTitle: "Events",
    heroSubtitle: "Create unforgettable experiences",
    whyTitle: "Why events?",
    whyBody:
      "A successful event can transform your image and create lasting connections. We design and organise bespoke events that make an impact and strengthen your reputation.",
    offerings: [
      "Seminars & conferences",
      "Product launches",
      "Corporate evenings",
      "Team building",
      "Digital events",
    ],
    processLabel: "How it works",
    processIntro: "A proven process for guaranteed results.",
    steps: [
      { title: "Brief", body: "Understanding of your goals and your audience" },
      { title: "Concept", body: "Concept creation and detailed planning" },
      { title: "Production", body: "Vendor coordination and logistics" },
      { title: "Showtime", body: "Event management and hosting" },
    ],
    ctaTitle: "Ready to boost your events?",
    ctaBody:
      "Let's talk about your project and build together an event that will make an impact",
    image: "/img/projet-escda.jpg",
  },
  {
    slug: "strategie-communication",
    title: "Strategy & Marketing",
    short:
      "Analysis, positioning and action plan to grow your visibility and strengthen your communication.",
    heroTitle: "Communication & Marketing Strategy",
    heroSubtitle: "Turn your communication into results",
    whyTitle: "Why a communication and marketing strategy?",
    whyBody:
      "Communication without strategy is like talking into the void. We build clear, effective strategies that attract the right customers, position your brand and turn your actions into measurable results.",
    offerings: [
      "Audit & analysis",
      "Strategic positioning",
      "Marketing action plan",
      "Content & campaigns",
      "Optimisation",
      "Reporting",
    ],
    processLabel: "How it works",
    processIntro: "A proven process for guaranteed results.",
    steps: [
      { title: "Analysis", body: "Understanding of your brand, your goals and your audience" },
      { title: "Strategy", body: "Definition of positioning, messaging and marketing plan" },
      { title: "Execution", body: "Rollout of content, campaigns and marketing actions" },
      { title: "Optimisation", body: "Performance tracking and adjustments to maximise impact" },
    ],
    ctaTitle: "Ready to boost your communication?",
    ctaBody:
      "Let's talk about your project and build together a strategy that turns your communication into concrete results.",
    image: "/img/projet-comprint.jpg",
  },
];

export const hero = {
  keywords: ["Branding", "SEO", "Websites", "Content", "Events", "Ad Spots"],
  lead: "Make your brand shine.",
  body: "LEEGI GROUP turns your visibility into customers, credibility and growth. Through strategy, creativity and digital expertise, your communication becomes a powerful lever to attract, convince and retain your customers.",
};

export const stats = [
  { value: 120, suffix: "+", label: "Projects delivered" },
  { value: 40, suffix: "+", label: "Satisfied clients" },
  { value: 98, suffix: "%", label: "Client satisfaction" },
  { value: 10, suffix: "+", label: "Years of experience" },
  { value: 60, suffix: "+", label: "Partners" },
];

export const about = {
  title: "About",
  heading: "Your trusted digital partner",
  body: "Based in Senegal, Leegi Group is a digital communication agency passionate about the digital transformation of African businesses. We combine creativity, technical expertise and deep knowledge of African markets to deliver exceptional results.",
  points: [
    "A strategic, tailored approach",
    "A team 100% dedicated to your projects",
    "Measurable, transparent results",
    "Constant innovation and tech monitoring",
  ],
};

export const projects = [
  {
    title: "ESCDA 2025 event visual identity",
    body: "Design and production of visual assets to strengthen the event's impact.",
    category: "Events",
    image: "/img/projet-escda.jpg",
  },
  {
    title: "EMF website design",
    body: "A modern, well-structured website to strengthen EMF's digital presence.",
    category: "Websites",
    image: "/img/projet-emf.jpg",
  },
  {
    title: "Comprint ad mockups",
    body: "Visuals created to capture attention and maximise campaign impact.",
    category: "Digital content",
    image: "/img/projet-comprint.jpg",
  },
  {
    title: "Setna Services",
    body: "Logo presented in real-world settings through professional mockups.",
    category: "Branding",
    image: "/img/projet-setna.jpg",
  },
  {
    title: "Social media content",
    body: "Visual created for the 8 March digital campaign for Étincelles des Marques.",
    category: "Digital content",
    image: "/img/projet-etincelles.jpg",
  },
  {
    title: "ESCDA first edition coverage",
    body: "Photo and video coverage to showcase the event's key moments.",
    category: "Events",
    image: "/img/projet-emf.jpg",
  },
];

export const filters = ["All", "Branding", "Websites", "Events", "Digital content"];

export const testimonials = [
  {
    name: "Lamine SECK",
    role: "Managing Director",
    company: "Com&print Multiservices",
    quote:
      "Very professional and highly impactful. A high-quality job with very convincing results. If you want to talk about marketing and improve your brand image, trust Leegi Group.",
    image: "/img/temoignage-lamine.jpg",
  },
  {
    name: "Nestor DIATTA",
    role: "Managing Director",
    company: "SENTRAS SARL",
    quote:
      "I highly recommend Leegi Group. Professional, rigorous and adaptable, the team delivers high-quality results and brings real added value to every ambitious project.",
    image: "/img/temoignage-nestor.jpg",
  },
  {
    name: "Hamidou DIALLO",
    role: "Managing Director",
    company: "Houda Ingénierie BTP",
    quote:
      "I highly recommend Leegi Group. Professional and effective, the team supports businesses and brings real value to every project",
    image: "/img/temoignage-hamidou.jpg",
  },
  {
    name: "Seydina A. GAYE",
    role: "Project Manager",
    company: "Project Manager, community & eco development",
    quote:
      "I highly recommend Leegi Group. Creative and dynamic, the team delivers effective digital marketing solutions ",
    image: "/img/temoignage-seydina.jpg",
  },
];

export const aboutPage = {
  title: "Who are we?",
  lead: "LEEGI Group boosts your visibility through targeted strategy and impactful creativity.",
  body: "We support brands to capture attention, win over their audience and grow their influence.",
  pillars: [
    { title: "Targeted strategy", body: "Precise actions for maximum impact." },
    { title: "Impactful creativity", body: "Content that attracts and stays in people's minds." },
    { title: "Concrete results", body: "Increased visibility and stronger credibility." },
  ],
  whyEyebrow: "Why work with us",
  whyStatements: [
    "Your strategy is designed around you",
    "Your content captures and stays in minds",
    "You work with a dedicated team",
    "Your results are measured, not promised",
    "You gain visibility that lasts",
  ],
  whyImage: "/img/partenaires.jpg",
  whyBadge: "Team available",
  whyOpenings: [
    { label: "Brand strategy", detail: "Positioning, platform and messaging" },
    { label: "Digital campaign", detail: "Content, reels and ad spots" },
  ],
  mission: {
    title: "Our mission",
    body: "To help businesses become visible, credible and impactful. We believe every brand deserves a strategy that matches its ambitions.",
  },
  vision: {
    title: "Our vision",
    body: "To build strong, lasting brands. We aim to be the go-to partner for any company that wants to stand out.",
  },
  initiatives: {
    title: "Our initiatives",
    body: "Among our actions, we lead Étincelles des Marques, a Leegi Group initiative dedicated to revealing, celebrating and amplifying the voice of African talent, brands and businesses.",
    body2:
      "Through authentic portraits, in-depth interviews and immersive podcasts, we tell real, inspiring stories that spotlight the careers driving innovation and impact across the African continent.",
  },
  valuesTitle: "Our values",
  values: [
    {
      title: "Innovation",
      body: "We develop original ideas and impactful solutions to make your brand shine.",
    },
    {
      title: "Clarity",
      body: "Every action is thought through to hit a precise goal and maximise the impact of your communication.",
    },
    {
      title: "Excellence",
      body: "We create memorable brand experiences that capture your audience's attention.",
    },
    {
      title: "Commitment",
      body: "We support every project with rigour, seriousness and a real sense of results.",
    },
  ],
  teamLabel: "Our team",
  teamIntro: "A multidisciplinary team serving your digital ambition.",
  team: [
    {
      name: "Mareme SYLLA",
      role: "Managing Director & Co-founder – LEEGI Group",
      image: "/img/equipe-mareme.jpg",
      bio: [
        "Mareme SYLLA is Managing Director and co-founder of LEEGI Group.",
        "Passionate about marketing and strategic communication, she supports local and international companies in developing their brand image, digital visibility and positioning.",
        "Her expertise was built across a wide range of sectors, notably construction, real estate, automotive, furniture, oil and gas industries, as well as services, hospitality, printing and training, with strong market knowledge and mastery.",
        "Through her career in marketing, sales and digital communication, she works on structuring brands, from set-up to the implementation of strategies adapted to market realities.",
        "Convinced that a brand is built on clarity, consistency and impact, she defends a results-oriented strategic approach.",
        "She is also behind the Étincelles des Marques project, dedicated to promoting African entrepreneurs and brands.",
      ],
    },
    {
      name: "Ndeye Anta Ndiaye",
      role: "Graphic Designer | Web Developer & Digital Content Officer",
      image: "/img/equipe-ndeye.jpg",
      bio: [],
    },
    {
      name: "Cheikh Bamba Bâ",
      role: "Graphic Designer & Digital Content Officer",
      image: "/img/equipe-cheikh.jpg",
      bio: [],
    },
  ],
  why: {
    title: "Why choose us?",
    items: [
      {
        title: "Proven experience",
        body: "More than 10 years supporting brands across every sector..",
      },
      {
        title: "Concrete results",
        body: "We don't sell dreams, we sell numbers and growth.",
      },
      {
        title: "End-to-end support",
        body: "From strategy to execution, we're by your side.",
      },
    ],
  },
};

export const servicesPage = {
  title: "Our services",
  lead: "A complete offer to grow your brand online. Every service is designed to deliver concrete results.",
};

export const contactPage = {
  title: "Contact",
  lead: "A question? A project in mind? Get in touch and we'll reply fast.",
  info: [
    { label: "Email", value: "contact@leegigroup.com", href: "mailto:contact@leegigroup.com" },
    { label: "Phone", value: "221 78 122 93 05", href: "tel:+221781229305" },
    { label: "Address", value: "Dakar, Senegal", href: null },
    { label: "Opening hours", value: "Mon–Fri, 9am–6pm", href: null },
  ],
  jsNote: "Please enable JavaScript in your browser to fill in this form.",
  submit: "Send message",
  formTitle: "Write to us",
  formBody: "Fill in the form below and we'll get back to you as soon as possible.",
  formPoints: [
    "Fast response within 48h",
    "A dedicated point of contact",
    "Free quote, no commitment",
  ],
  locationTitle: "Find us in Dakar, Senegal",
  locationBody: "Come and visit us from Monday to Friday, 9am–6pm.",
};

export const devisPage = {
  title: "Tell us about your project",
  lead: "Get a proposal tailored to your goals.",
  jsNote: "Please enable JavaScript in your browser to fill in this form.",
  servicePlaceholder: "Select a service",
  serviceOptions: [
    "Branding",
    "Websites",
    "SEO",
    "Content, Reels & Ads",
    "Events",
    "Strategy & Marketing",
  ],
  submit: "Get my quote",
  formTitle: "Your project in a few fields",
  formBody: "The more precise your information, the more tailored our proposal.",
  includeTitle: "What's included",
  includes: [
    "A response within 48 business hours",
    "A tailored, costed proposal",
    "A free discovery call",
    "A single point of contact from quote to delivery",
  ],
};

export const finalCta = {
  title: "Ready to make your brand indispensable?",
  body: "Get in touch to discuss your project and receive a tailored proposal.",
  primary: "Request a quote",
  secondary: "Contact us",
};

export const clients = [
  "EMF Consulting",
  "Comprint",
  "SENTRAS",
  "Houda Ingénierie",
  "Setna Services",
  "ESCDA",
];

export const ui = {
  viewDetails: "View details",
  discover: "Discover",
  learnMore: "Learn more about us",
  viewAllProjects: "View all our work",
  viewAllServices: "View all services",
  discussProject: "Let's discuss your project",
  presentation: "Overview",
  ourOffer: "Our offer",
  portfolio: "Portfolio",
  projectsHeading: "Projects that transformed our clients' presence",
  projectsBody:
    "From brand identity to websites, every project is a tailor-made answer to a precise goal.",
  references: "References",
  testimonialTitle: "Testimonials",
  testimonialBody: "See what our clients say about working with LEEGI Group.",
  clientsTitle: "Our clients",
  clientsLink: "Discover our clients' projects",
  methodology: "Method",
  expertise: "Expertise",
  agency: "Digital communication agency — Dakar",
  freeQuote: "Free quote",
  talkToUs: "Let's talk",
  teamEyebrow: "Our team",
  whatDrivesUs: "What drives us",
  ourStrengths: "Our strengths",
  top: "Top",
  bottom: "Bottom",
  footerQuickLinks: "Quick links",
  footerService: "Service",
  rights: "All rights reserved.",
  notFoundTitle: "Oops! This page could not be found.",
  notFoundBody: "It looks like nothing was found here. Head back home to keep browsing.",
  backHome: "Back to home",
  languageLabel: "Language",
  searchLabel: "Search the site",
  searchPlaceholder: "Search a service, a project…",
  searchNoResults: "No results",
};
const dictionary = {
  site, nav, services, hero, stats, about, projects, filters,
  testimonials, aboutPage, servicesPage, contactPage, devisPage, finalCta, clients, ui,
};

export default dictionary;
