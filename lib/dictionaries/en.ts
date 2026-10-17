export const site = {
  /* The PRODUCT's name and promise.

     ⚠️ The contact block just below (phone, email, address, socials) still belongs
     to the former agency identity: it must be replaced with Belora's real details,
     which cannot be invented. Until then the footer and the structured data
     announce a contact that is not the right one. */
  name: "Belora",
  tagline:
    "The software for salons: calendar, online booking, clients, till and team, in one place.",
  phone: "+221 78 122 93 05",
  phoneRaw: "tel:+221781229305",
  /* WhatsApp: a single address across the whole site (footer, fan, assistant), derived from
     the phone number — so changing the number happens in one place only. */
  whatsapp: "https://wa.me/221781229305",
  /* Product contact address. Replace with the real mailbox before launch; no social
     profiles are listed until Belora accounts exist. WhatsApp is derived from the phone
     number (`components/SocialIcons`). */
  email: "bonjour@belora.app",
  address: "Dakar, Senegal",
  hours: "Mon–Fri, 9am–6pm",
  socials: [] as { label: string; href: string }[],
};

/* Navigation: real routes only — never a link to a page that does not exist.
   The `/services` entry is what opens the mega menu (the Header keys off that
   exact href). */
export const nav = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/services" },
  { label: "Pricing", href: "/tarifs" },
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
};

export const services: Service[] = [
  {
    slug: "agenda",
    title: "Calendar & appointments",
    short:
      "The salon's whole day at a glance: booked slots, availability, statuses and reschedules.",
    heroTitle: "Calendar & appointments",
    heroSubtitle: "Your salon's day, in a single look",
    whyTitle: "Why a calendar?",
    whyBody:
      "A forgotten appointment, an empty slot, a client waiting: the day is decided here. Belora shows who does what, where and for how long, moves every appointment from booked to completed, and frees the slot the moment something is rescheduled. Front desk only has to read the screen.",
    offerings: [
      "Day, week and month views",
      "Occupied slots and open availability",
      "Rescheduling without losing anything",
      "Statuses: pending, confirmed, completed, cancelled, no-show",
      "Notes visible to the whole team",
    ],
    processLabel: "How it works",
    processIntro: "From the first call to the client walking out.",
    steps: [
      {
        title: "Booking",
        body: "The client books online, or the desk takes the appointment",
      },
      {
        title: "Confirmation",
        body: "The status follows the exchange, with no double entry anywhere",
      },
      {
        title: "The day",
        body: "The slot moves from booked to in progress, then completed",
      },
      {
        title: "Afterwards",
        body: "The appointment feeds the client file and the statistics",
      },
    ],
    ctaTitle: "Your calendar deserves better than a paper book.",
    ctaBody:
      "Open a salon, publish your services, and watch the bookings arrive on their own.",
  },
  {
    slug: "reservation-en-ligne",
    title: "Online booking",
    short:
      "A page per salon, open 24/7, with your services, your team and your real availability.",
    heroTitle: "Online booking",
    heroSubtitle: "Clients book while you work",
    whyTitle: "Why accept online bookings?",
    whyBody:
      "A booking taken at 11 pm is one you did not have. Belora publishes your page with your services, your team and your live availability: the client picks, the calendar fills, and nobody had to pick up the phone. Each salon wears its own colours on its page.",
    offerings: [
      "Public page in your own colours",
      "Four-step journey: service, expert, slot, details",
      "Only genuinely free slots are offered",
      "Immediate confirmation on the client's side",
      "A page at an address you choose",
    ],
    processLabel: "How it works",
    processIntro: "Four screens, one minute, no app to install.",
    steps: [
      { title: "Service", body: "The client picks what they need and sees the price" },
      { title: "Expert", body: "They pick the person, or let the salon decide" },
      { title: "Slot", body: "Only the times that are really free are offered" },
      { title: "Details", body: "Name, phone, confirmation: the appointment is set" },
    ],
    ctaTitle: "Give your salon an address that works for you.",
    ctaBody:
      "Every salon gets its own page, its colours and its hours. You only manage one thing: the calendar.",
  },
  {
    slug: "fiches-clients",
    title: "Client files",
    short:
      "Visit history, details, preferences and loyalty: your salon's memory.",
    heroTitle: "Client files",
    heroSubtitle: "Your salon's memory, within reach",
    whyTitle: "Why a client file?",
    whyBody:
      "Finding the colour, the last package or the regular's usual preference in three seconds is what brings people back. Every client keeps their visits, their habits and what matters to you. Same name, same person, from one appointment to the next.",
    offerings: [
      "Complete file, instant search",
      "History of every visit",
      "Preferences and team notes",
      "Tags and acquisition sources",
      "Visits and spend tracked",
    ],
    processLabel: "How it works",
    processIntro: "The file fills itself in as appointments happen.",
    steps: [
      { title: "Arrival", body: "First visit: name, phone and where they came from" },
      { title: "Follow-up", body: "Every appointment joins the history" },
      { title: "Preferences", body: "The team notes what matters for this client" },
      { title: "Return", body: "They come back with their history already there" },
    ],
    ctaTitle: "Clients will come back, and you'll know why.",
    ctaBody: "Open your workspace and add your first client in a minute.",
  },
  {
    slug: "prestations",
    title: "Services & pricing",
    short:
      "Your catalogue: duration, price, category, online visibility and what each one earns.",
    heroTitle: "Services & pricing",
    heroSubtitle: "Your catalogue, kept current",
    whyTitle: "Why a clean catalogue?",
    whyBody:
      "A service with no duration is a mis-sized slot; a stale price is a conversation at the till. Belora files your services by category, with their duration and price, and lets you decide which one is bookable online. What you publish is what clients book.",
    offerings: [
      "Categories and grouping",
      "Duration and price per service",
      "Online visibility, service by service",
      "Images and descriptions",
      "Catalogue status at a glance",
    ],
    processLabel: "How it works",
    processIntro: "From catalogue to till, one single source of truth.",
    steps: [
      { title: "Definition", body: "Name, category, duration and price for each service" },
      { title: "Publishing", body: "You decide what can be booked online" },
      { title: "Booking", body: "The client books the service at the right price" },
      { title: "Review", body: "The most requested services rise to the top of the numbers" },
    ],
    ctaTitle: "Your catalogue, finally readable.",
    ctaBody: "Describe a service, give it a duration: it is bookable straight away.",
  },
  {
    slug: "equipe",
    title: "Team & commissions",
    short:
      "Stylists, practitioners, hours, availability and commissions: who does what this week.",
    heroTitle: "Team & commissions",
    heroSubtitle: "Who does what, and when",
    whyTitle: "Why frame the team?",
    whyBody:
      "Availability gets split, commissions get calculated, and nobody has to remember anything. Belora keeps each member's hours, keeps bookings inside what they can actually absorb, and keeps track of what belongs to whom.",
    offerings: [
      "A file for each member",
      "Weekly availability",
      "Specialties and roles",
      "Bookings limited to real working hours",
      "Commission tracking",
    ],
    processLabel: "How it works",
    processIntro: "Publish one availability, the calendar obeys the rule.",
    steps: [
      { title: "Role", body: "Each member has a position and its responsibilities" },
      { title: "Hours", body: "Working windows are set once and for all" },
      { title: "Assignment", body: "An appointment lands on someone genuinely free" },
      { title: "Month end", body: "Commissions are computed on what was completed" },
    ],
    ctaTitle: "Your team is your product.",
    ctaBody: "Add your experts, publish their hours, and let the calendar do the rest.",
  },
  {
    slug: "pilotage",
    title: "Analytics & control",
    short:
      "Today's view, monthly numbers, subscription, accounts and journal: direction, not guesswork.",
    heroTitle: "Analytics & control",
    heroSubtitle: "Know what your salon does, not what it assumes",
    whyTitle: "Why look at the numbers?",
    whyBody:
      "Month's revenue, most requested services, no-shows, your subscription status: a decision taken on a feeling costs money. Belora puts the day's view, the statistics and the action journal in one place, so the question is settled by data.",
    offerings: [
      "Today's view: appointments, clients, alerts",
      "Monthly statistics and revenue",
      "Appointments by service",
      "Subscription and its limits",
      "Access accounts and action journal",
    ],
    processLabel: "How it works",
    processIntro: "One page per decision, always backed by the data.",
    steps: [
      { title: "Measure", body: "Every completed appointment feeds the counters" },
      { title: "Read", body: "The month compares itself to the last one, no spreadsheet" },
      { title: "Decide", body: "You see where to adjust: hours, offer, team" },
      { title: "Trace", body: "Who changed what, and when, stays readable" },
    ],
    ctaTitle: "Decide on numbers, not on impressions.",
    ctaBody: "Your dashboard fills in from the first appointment you record.",
  },
];

export const hero = {
  keywords: ["Calendar", "Booking", "Clients", "Services", "Team", "Analytics"],
  /* The hero title is split in TWO: `leadStatic` stays put, the second line
     carries the house italic (see components/HomeHero.tsx). `lead` keeps the
     whole sentence — it is what screen readers, search engines and share
     previews read, so it must stand on its own. */
  lead: "Your salon, without the chaos.",
  leadStatic: "Your salon,",
  leadRotating: ["without the chaos.", "at the right pace.", "under control."],
  body: "The calendar, online booking, client files, the till and your team in one gesture. Clients book at any hour, you see the day at a glance, and every slot earns what it should.",
  /* The hero is a poster: the line on the right stays short, and the three lines of
     capitals on the left name the product instead of praising it. */
  aside:
    "The calendar, online booking and client files in one place — including when the salon is closed.",
  manifesto: ["Calendar & booking", "Clients, services, team", "Your salon, held in one hand"],
  liveLabel: "Live demonstration",
  reassurances: [
    { value: "24/7", label: "Online booking" },
    { value: "One", label: "Appointment book" },
    { value: "0", label: "Double entry" },
  ],
  previewLabel: "Product preview",
  previewDay: "Today",
  previewRows: [
    { time: "09:30", service: "Cut and blow-dry", staff: "Awa", status: "Confirmed" },
    { time: "11:00", service: "Full colour", staff: "Fatou", status: "In progress" },
    { time: "14:15", service: "Beard and line-up", staff: "Moussa", status: "Confirmed" },
    { time: "16:00", service: "Deep treatment", staff: "Awa", status: "Pending" },
  ],
  previewTotal: "Expected revenue",
  previewBooking: "Online booking",
  previewBookingBody: "A client just booked at 9:47 pm, for tomorrow at 10 am.",
  ticker: ["Calendar", "Online booking", "Client files", "Services", "Team", "Till"],
};

/**
 * Labels for the four figures — the VALUES do not come from here.
 *
 * They are served live by the demo salon's API through
 * `components/LiveStats.tsx`: services published, experts, published reviews,
 * average rating. These four are the only things the product can actually
 * demonstrate here; the former figures (120 projects, 40 clients …) belonged to
 * an agency that no longer exists on this site.
 *
 * Until the API answers, the section is not rendered: it would only show zeros,
 * which would be a false claim.
 */
export const stats = [
  { value: 0, suffix: "", label: "Services published" },
  { value: 0, suffix: "", label: "Experts on the team" },
  { value: 0, suffix: "", label: "Published reviews" },
  { value: 0, suffix: "/5", label: "Average rating" },
];

export const about = {
  title: "About",
  heading: "The software for salons that work",
  body: "Belora was born from a simple observation: a salon does not need another piece of software, it needs its day to hold together. We bring the calendar, online booking, client files, the till and the team into one tool, built to be run with one hand while you work with the other.",
  points: [
    "One appointment book for the whole salon",
    "A public page in your colours, open around the clock",
    "Every slot accounted for: duration, price, commission",
    "A team you can reach, answering in your language",
  ],
};

/**
 * Projects. Each one carries three levels of reading: `body` (a single line, for the tile and
 * the search index), then `summary` + `scope` (the story and the scope), shown by the
 *
 * Everything here is DERIVED from the project, never invented: the `client` comes from the
 * title or the body, the rest restates the work already described. No date, no figure, no
 * measured outcome was added — a sheet that invents a number is worse than a short sheet. If
 * a figure ever belongs here, it comes from the client, not from us.
 */
/**
 * Exemples de réalisations — **volontairement vides**.
 *
 * Cette liste portait six études de cas d'agence. C'étaient de vrais projets, mais ce ne
 * sont pas ceux d'un logiciel de salon : les afficher reviendrait à vendre autre chose que
 * le produit. La preuve est désormais la page elle-même, alimentée par l'API réelle du
 * salon de démonstration (voir `components/ProductShowcase.tsx`).
 *
 * Le tableau et son type restent : le jour où un client accepte d'être cité, il suffit
 * d'ajouter une entrée ici, sans toucher aux composants.
 */
export type ShowcaseProject = {
  title: string;
  body: string;
  category: string;
  image: string;
  client: string;
  summary: string;
  scope: string[];
};

export const projects: ShowcaseProject[] = [];

export const filters: string[] = [];

/**
 * Témoignages — **volontairement vides**.
 *
 * Les entrées précédentes étaient des recommandations adressées à une agence de
 * communication. Les réutiliser pour parler d'un logiciel de salon aurait été un faux
 * témoignage : on attend de vrais salons.
 */
export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
};

export const testimonials: Testimonial[] = [];

export const aboutPage = {
  /* Hero headline, taken word for word from the reference site; “Who are we?” (`title`)
     stays the heading of the first content block, as it does there. */
  heroHeadline: "The software that holds a salon's day together.",
  title: "Who are we?",
  lead: "Belora is management software for salons and spas: the calendar, online booking, client files, the till and the team, in one tool.",
  body: "We build it with salon owners, on their real days: one gesture, one piece of information, no bouncing between tools.",
  pillarsTitle: "Our foundations",
  pillars: [
    { title: "The trade first", body: "Every screen starts from a real gesture in the salon, not from a feature list." },
    { title: "One source", body: "An appointment entered once feeds the calendar, the till, the client file and the numbers." },
    { title: "Built to last", body: "Your data stays yours and can be exported; the service does not stop with a plan." },
  ],
  whyEyebrow: "Why Belora",
  whyHeadline: "What Belora changes",
  /* One card per reason: the home grid shows these THREE numbered entries
     (01 → 03), the fourth cell being the illustration. Three short titles, three
     sentences: that is the reference composition, not a pitch. */
  whyCards: [
    {
      title: "A calendar that fills itself",
      body: "Clients book at night, at the weekend, while you are cutting: the page never closes.",
    },
    {
      title: "Everything in one place",
      body: "Appointments, clients, services, till and team share one source. No double entry.",
    },
    {
      title: "Slots that are real",
      body: "Times offered online are the ones your team can absorb — never invented.",
    },
  ],
  mission: {
    title: "Our mission",
    body: "To give salons their day back. A salon that no longer has to copy an appointment three times, or call a client back to confirm, has time for what it does well.",
  },
  vision: {
    title: "Our vision",
    body: "That every salon, from a single chair to a ten-person spa, has the toolkit of a big house: a page that takes bookings at any hour, and numbers that tell the truth.",
  },
  productTitle: "The product, shown rather than told.",
  productBody:
    "This panel is a salon's control screen: the month's appointments, revenue, return rate. Every number comes from a real appointment — never an estimate.",
  valuesTitle: "Our values",
  values: [
    {
      title: "The floor decides",
      body: "A feature that does not save the front desk a gesture does not make it into the product.",
    },
    {
      title: "Few, but right",
      body: "Each screen shows what you need to act, and nothing more. No decorative dashboard.",
    },
    {
      title: "Numbers that are true",
      body: "Revenue shown is revenue taken. When a value is missing the screen prints “—”; it does not invent one.",
    },
    {
      title: "Your data stays yours",
      body: "It can be exported, it is not used for anything else, and leaving does not require a registered letter.",
    },
  ],
  why: {
    title: "Why Belora?",
    items: [
      {
        title: "Built with salons",
        body: "Screens are drawn on real salon days, not in an office.",
      },
      {
        title: "One tool",
        body: "Calendar, booking, clients, till and team share one source: nothing to copy over.",
      },
      {
        title: "No lock-in",
        body: "A fourteen-day trial, month to month, and your data exportable at any time.",
      },
    ],
  },
};

export const servicesPage = {
  title: "Our services",
  lead: "Six ways to run your salon: book, welcome, take payment, decide. Every feature maps to a real endpoint of the product.",
};

export const contactPage = {
  title: "Contact",
  lead: "A question? A project in mind? Get in touch and we'll reply fast.",
  /* Right-hand column blocks: a discreet label above, the value in bold (email and
     phone are clickable). */
  info: [
    { label: "Email", value: "bonjour@belora.app", href: "mailto:bonjour@belora.app" },
    { label: "Phone", value: "221 78 122 93 05", href: "tel:+221781229305" },
    { label: "Address", value: "Dakar, Senegal", href: null },
    { label: "Opening hours", value: "Mon–Fri, 9am–6pm", href: null },
  ],
  /* Bottom of the left-hand column: the button opens the form in a side sheet, and the
     site's social profiles (dictionary `site.socials`) follow it. */
  /* Heading of the left-hand column. Deliberately different from the page title
     ("Contact"), which the hero already displays. */
  heading: "Let's talk about your salon",
  cta: "Get in touch",
  /* Contents of the side sheet. */
  form: {
    title: "Write to us",
    body: "Fill in the form below and we'll get back to you as soon as possible.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    jsNote: "Please enable JavaScript in your browser to fill in this form.",
    submit: "Send message",
    successTitle: "Message sent",
    successBody: "Thanks for your message. Our team will get back to you as soon as possible.",
  },
};

export const devisPage = {
  title: "Let's talk about your salon",
  lead: "A demo, a question about plans, a migration from your current calendar: tell us where you are.",
  jsNote: "Please enable JavaScript in your browser to fill in this form.",
  servicePlaceholder: "What brings you here",
  serviceOptions: [
    "Discover the product",
    "Migrate my calendar",
    "Several salons",
    "Billing and plans",
    "Something else",
  ],
  submit: "Send my request",
  formTitle: "Your salon in a few fields",
  formBody: "The name, the size of the team, what you use today: enough to prepare a useful conversation.",
  successTitle: "Request sent",
  successBody: "Thank you! Your request is on its way. We'll get back to you within 48 business hours.",
  /* Field labels live here and not in the page: both the page AND the quote panel render
     them — one source, no divergence. */
  fields: {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    service: "What brings you here",
    timeline: "Desired timeline",
    description: "Project description",
    descriptionPlaceholder: "Your salon, your team, what you use today…",
  },
  includeTitle: "What's included",
  includes: [
    "A response within 48 business hours",
    "A tailored, costed proposal",
    "A free discovery call",
    "A single point of contact from quote to delivery",
  ],
};

export const finalCta = {
  title: "Open your salon today.",
  body: "Your workspace is ready in two minutes. Your first online bookings can arrive tomorrow.",
  primary: "Open a salon",
  secondary: "Contact us",
};

/**
 * Mur de logos — **volontairement vide**.
 *
 * Il listait les logos de clients d'une agence de communication. Les présenter comme des
 * salons utilisateurs du logiciel serait faux ; on n'affiche donc rien tant que de vrais
 * salons n'ont pas donné leur accord.
 */
export type ClientLogo = { name: string; src: string; width: number; height: number };

export const clients: ClientLogo[] = [];

/* “The product for real” page (formerly /realisations): everything written here describes
   data READ from the demo salon's API, never sample values. */
export const showcase = {
  eyebrow: "The product for real",
  title: "Not a mock-up: a salon that runs.",
  lead: "This page queries the demo salon's API while you read it. Services, team, photos, reviews: its real data, not sample values.",
  demoLabel: "Demo salon",
  demoPlace: "Dakar, Senegal",
  openSalon: "Open the page",
  servicesTitle: "Its services, exactly as they are booked.",
  servicesBody:
    "Name, category, duration, price: the public page shows exactly these lines, and only offers slots that are genuinely free.",
  teamTitle: "The team, and who does what.",
  teamBody:
    "Each member carries their specialities. The client picks their person, or lets the salon assign one.",
  galleryTitle: "Its photos, published from the workspace.",
  galleryBody:
    "It is the same Gallery screen as in the workspace: what is published here is what shows on the public page.",
  reviewsTitle: "What clients say.",
  reviewsBody: "Average rating and published comments, served by the API. No review is written by hand.",
  unavailable: "The demo salon's data is not available right now.",
  empty: "Nothing to show yet.",
};

export const ui = {
  /* Action feedback: two sentences read by the write notifications (see
     `lib/feedback.ts`) that live outside the React tree. */
  feedback: {
    success: "Saved.",
    error: "The change could not be saved. Try again in a moment.",
  },
  viewAllProjects: "View all our work",
  viewAllServices: "View all features",
  discussProject: "Let's talk about your salon",
  presentation: "Overview",
  ourOffer: "Our offer",
  portfolio: "Product",
  methodology: "Method",
  expertise: "Feature",
  agency: "Salon & spa management software",
  freeQuote: "Create my salon",
  talkToUs: "Let's talk",
  whatDrivesUs: "What drives us",
  footerQuickLinks: "Quick links",
  footerService: "Service",
  rights: "All rights reserved.",
  notFoundTitle: "Oops! This page could not be found.",
  notFoundBody: "It looks like nothing was found here. Head back home to keep browsing.",
  backHome: "Back to home",
  languageLabel: "Language",
  /* Navigation landmarks: never visible, they name the regions and buttons for screen
     readers. They live here with the other labels because they change with the locale —
     hard-written, they stayed French on the English site. */
  navLabel: "Main navigation",
  menuOpenLabel: "Open menu",
  menuCloseLabel: "Close menu",
  menuNavLabel: "Mobile navigation",
  searchCloseLabel: "Close search",
  formCloseLabel: "Close form",
  otherServices: "Other services",
  /* Historic project-gallery labels. `viewAllProjects` is still read by the feature pages;
     the rest lost its consumer when `ProjectsGallery` and `ProjectModal` were removed
     (agency content).
     names the dialog for screen readers, the others are visible. */
  servicesTitle: "Features",
  servicesBody:
    "Six building blocks, one single source of data: the calendar, online booking, client files, services, team and analytics. Nothing is ever typed in twice.",
  statsTitle: "A real salon's numbers, served live.",
  statsBody:
    "This page queries the product's API while you read it: the services, team and reviews below belong to the demo salon — they are not sample values.",
  searchLabel: "Search the site",
  searchPlaceholder: "Search a service, a project…",
  searchNoResults: "No results",
  /* Full-screen search (header icon). “Results” is a heading, never inflected: the count is
     appended next to it (“Results · 3”), so there is no plural to handle. */
  searchResults: "Results",
  searchSuggestions: "Suggestions",
  /* Keyboard hint in the footer of a full-screen panel (search, contact form). */
  panelHint: "Esc to close",
  /* Floating action bar (bottom of the screen, after the first scroll) and the social fan it
     opens. The labels double as `aria-label`s: one word, both what you see and what a screen
     reader announces. */
  dock: {
    title: "Quick actions",
    quote: "Get a quote",
    contact: "Contact us",
    chat: "Assistant",
    socials: "Our socials",
    openSocials: "Show social networks",
    closeSocials: "Hide social networks",
    whatsapp: "WhatsApp",
    /* Collapsed state: a single button with a hook. That's what appears on scroll — not the
       whole bar. The hook is a SEQUENCE of short phrases: a frozen phrase is read once and
       forgotten, a sequence opens several doors. */
    phrases: [
      "Got a project in mind?",
      "Need a new website?",
      "A brand to build?",
      "A quote, no strings",
      "Let's talk about it",
    ],
    openActions: "Open quick actions",
  },
  /* Conversational assistant: the chat window labels. */
  chat: {
    title: "Belora assistant",
    subtitle: "An instant answer about the product",
    placeholder: "Ask your question…",
    send: "Send",
    greeting:
      "Hi 👋 I'm the Belora assistant. Ask me how the calendar, online booking or plans work.",
    suggestions: [
      "How does online booking work?",
      "What does the salon calendar do?",
      "How much does Belora cost?",
    ],
    error: "The assistant is temporarily unavailable. Write to us at",
    close: "Close the assistant",
  },
  /* Auth screens (`app/[lang]/(auth)`). Software vocabulary, not agency copy:
     you don't “get in touch”, you open a workspace. The field labels live here,
     shared by the three screens, so a field is never named two different things. */
  auth: {
    backToSite: "Back to the site",
    loading: "One moment…",
    fields: {
      email: "Email",
      password: "Password",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
    },
    passwordHint: "At least 8 characters, one letter and one digit.",
    login: {
      eyebrow: "Salon workspace",
      title: "Your salon is waiting",
      body: "Enter your email and password: we send a 6-digit code to confirm it's really you.",
      submit: "Send me the code",
      noAccount: "No salon yet?",
      createAccount: "Open a salon",
      error: "Sign-in failed. Check your credentials and try again.",
    },
    otp: {
      eyebrow: "Verification",
      title: "Enter the code you received",
      body: "A 6-digit code was just sent to",
      code: "6-digit code",
      submit: "Open my workspace",
      resend: "Send a new code",
      resendIn: "New code in",
      seconds: "s",
      sent: "A new code has just been sent.",
      changeEmail: "Use another address",
      error: "Code rejected or expired. Ask for a new one.",
      missingEmail: "Missing address: start the sign-in again.",
      backToLogin: "Back to sign-in",
    },
    register: {
      eyebrow: "New salon",
      title: "Open your salon in two minutes",
      body: "Your workspace is created immediately. A code is then sent to confirm your address.",
      salonTitle: "Your salon",
      accountTitle: "Your account",
      tenantName: "Salon name",
      tenantSlug: "Address of your page",
      slugHint: "Your public page, bookable online. Editable at any time.",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
      submit: "Create my salon",
      haveAccount: "Already have a salon?",
      signIn: "Sign in",
      error: "Creation failed. Check your details or try again.",
      terms: "By creating your salon you accept our terms of use.",
    },
    /* Right-hand column, on the ink: three short claims, never a sales pitch —
       the sign-in screen is not a landing page. */
    panel: {
      title: "Your calendar, your clients and your till, in one place.",
      points: [
        "Online booking, 24/7",
        "Client file and visit history",
        "Till, team and today's numbers",
      ],
      demo: "See a demo salon page",
    },
  },

  /* Salon workspace (`app/[lang]/(app)`).

     Every navigation label lives here, including the ones whose screen does not
     exist yet: the day a route opens, one line is added to the shell and no copy
     is touched.

     The wording is the trade's, not the API's: a salon says “Services” where the
     backend says `salon-services`, and “Team” where it says `staff`. */
  dashboard: {
    brand: "Salon workspace",
    logout: "Sign out",
    viewSite: "View the site",
    nav: {
      overview: "Today",
      appointments: "Appointments",
      calendar: "Calendar",
      customers: "Clients",
      services: "Services",
      staff: "Team",
      gallery: "Gallery",
      reviews: "Reviews",
      messages: "Messages",
      notifications: "Notifications",
      analytics: "Analytics",
      billing: "Subscription",
      team: "Accounts & access",
      audit: "Journal",
      settings: "Settings",
    },
    groups: {
      day: "The day",
      clients: "Clients",
      salon: "The salon",
      account: "The account",
    },
    overview: {
      eyebrow: "Today",
      greeting: "Hello",
      actions: {
        title: "To do now",
        confirmTitle: "To confirm",
        confirmLabel: "appointments are waiting for a confirmation",
        confirmHint: "Booked online: one call and they move to confirmed in the calendar.",
        confirmNone: "everything is confirmed for today.",
        confirmCta: "Open appointments",
        nextTitle: "Next appointment",
        nextNone: "No upcoming appointment.",
        nextCta: "Open the calendar",
        siteTitle: "Your public page",
        siteBody: "Your page is live and takes bookings around the clock.",
        siteNoSlug: "Set your public page address to publish it.",
        siteCta: "Open the page",
        siteSettings: "Open settings",
      },
      body: "Here is the state of your salon. The working screens open from the left column.",
      salonLabel: "Your salon",
      accountLabel: "Your account",
      roleLabel: "Role",
      signedInAs: "Signed in as",
      /* Overview: what you look at on arrival. The four figures come from
         `/dashboard`, the counters from `/tenant/stats`. */
      /* Setup: the one part of the screen that says where you are in getting the
         salon running. Every step is checked against real data (`/tenant/me`,
         `/tenant/stats`) — never against a remembered click. */
      setupTitle: "Getting set up",
      setupBody:
        "Five steps, in the order of the day: at the end, your page takes bookings and your calendar fills itself.",
      setupDone: "Done",
      setupTodo: "To do",
      setupCta: "Open",
      setupAllDone: "Everything is in place. Your salon can go to work.",
      setupSteps: [
        {
          key: "slug",
          title: "Page address",
          hint: "The link your clients open to book.",
        },
        {
          key: "services",
          title: "Published services",
          hint: "Price, duration and online booking, service by service.",
        },
        {
          key: "staff",
          title: "Team",
          hint: "Who works, and when they are available.",
        },
        {
          key: "gallery",
          title: "Salon photos",
          hint: "What the page shows before the first appointment.",
        },
        {
          key: "booking",
          title: "First appointment",
          hint: "Proof that the whole chain works.",
        },
      ],
      todayAppointments: "Today's appointments",
      todayPending: "Pending",
      todayCompleted: "Completed",
      todayRevenue: "Today's revenue",
      upcoming: "Upcoming",
      recent: "Latest appointments",
      noneUpcoming: "No upcoming appointment.",
      noneRecent: "No past appointment yet.",
      countsTitle: "The salon at a glance",
      countsCustomers: "clients",
      countsServices: "services",
      countsStaff: "members",
      countsGallery: "photos",
      nextStepsTitle: "Your working screens",
      nextStepsBody:
        "Appointments, clients, services and team sit in the left column, wired to the salon's API. Each screen shows what the server returns, and says so when there is nothing to show.",
    },
    /* Data screens: appointments, clients, services, team. The wording is the
       trade's, never the API's (`customers`, `salon-services`). Columns are named
       here because the four screens share them word for word. */
    screens: {
      appointments: {
        title: "Appointments",
        lead: "The chosen day, hour by hour.",
        dateLabel: "Day",
        count: "appointments",
        columns: {
          time: "Time",
          customer: "Client",
          service: "Service",
          staff: "With",
          price: "Price",
          status: "Status",
          actions: "Actions",
        },
        actions: {
          confirm: "Confirm",
          start: "Start",
          complete: "Complete",
          cancel: "Cancel",
          noShow: "No-show",
        },
        statuses: {
          PENDING: "Pending",
          CONFIRMED: "Confirmed",
          IN_PROGRESS: "In progress",
          COMPLETED: "Completed",
          CANCELLED: "Cancelled",
          NO_SHOW: "No-show",
        },
        add: "New appointment",
        reschedule: "Reschedule",
        remove: "Delete",
        removeQuestion: "Delete this appointment?",
        removeBusy: "Deleting…",
        form: {
          addTitle: "New appointment",
          editTitle: "Reschedule the appointment",
          body: "The service sets the duration and the price; you pick the slot.",
          fields: {
            customer: "Client",
            service: "Service",
            staff: "With",
            date: "Day",
            time: "Time",
            notes: "Notes",
          },
          choose: "Choose…",
          save: "Save",
          saving: "Saving…",
          cancel: "Cancel",
          required: "Required field",
        },
        unknownCustomer: "Unknown client",
        unknownService: "Deleted service",
        emptyTitle: "No appointment that day",
        emptyBody:
          "Pick another date, or let clients book online: appointments land here on their own.",
      },
      customers: {
        title: "Clients",
        lead: "The salon's records, searchable in one keystroke.",
        searchLabel: "Search",
        searchPlaceholder: "A name, a phone number, an email…",
        count: "clients",
        columns: {
          name: "Name",
          phone: "Phone",
          email: "Email",
          visits: "Visits",
          spent: "Spent",
          source: "Source",
        },
        sources: {
          WALK_IN: "Walk-in",
          ONLINE: "Online",
          REFERRAL: "Referral",
          SOCIAL: "Social",
          OTHER: "Other",
        },
        emptyTitle: "No client yet",
        emptyBody:
          "Records appear with the first online booking, or by hand from the calendar.",
        noResultsTitle: "No result",
        noResultsBody: "Try another name, another number or another address.",
        add: "Add a client",
        edit: "Edit",
        remove: "Delete",
        removeQuestion: "Delete this client and their history?",
        removeBusy: "Deleting…",
        form: {
          addTitle: "New client",
          editTitle: "Edit record",
          body: "First name, last name and phone: the rest fills in as visits happen.",
          fields: {
            firstName: "First name",
            lastName: "Last name",
            phone: "Phone",
            email: "Email",
            notes: "Notes",
            tags: "Tags",
            source: "Source",
          },
          tagsHint: "Separated by commas",
          save: "Save",
          saving: "Saving…",
          cancel: "Cancel",
          required: "Required field",
          invalidEmail: "Invalid email address",
        },
      },
      services: {
        title: "Services",
        lead: "The catalogue, duration and price included.",
        count: "services",
        columns: {
          name: "Service",
          category: "Category",
          duration: "Duration",
          price: "Price",
          online: "Online",
          state: "State",
        },
        online: "Bookable",
        inPerson: "In person",
        active: "Active",
        inactive: "Inactive",
        add: "Add a service",
        edit: "Edit",
        remove: "Delete",
        removeQuestion: "Remove this service from the catalogue?",
        removeBusy: "Deleting…",
        form: {
          addTitle: "New service",
          editTitle: "Edit service",
          body: "A name, a duration, a price: that is what the public page shows and what booking relies on.",
          categoryHint: "Categories already in use are suggested",
          fields: {
            name: "Service",
            category: "Category",
            duration: "Duration (min)",
            price: "Price",
            description: "Description",
          },
          active: "Live in the catalogue",
          bookableOnline: "Bookable online",
          save: "Save",
          saving: "Saving…",
          cancel: "Cancel",
          required: "Required field",
          invalidNumber: "A number is expected",
        },
        emptyTitle: "The catalogue is empty",
        emptyBody:
          "A service describes what the salon sells: a name, a duration, a price. It becomes bookable as soon as it is published.",
      },
      staff: {
        title: "Team",
        lead: "Who works here, and in what role.",
        count: "members",
        columns: {
          name: "Name",
          role: "Role",
          specialties: "Specialties",
          commission: "Commission",
          state: "State",
        },
        active: "Active",
        inactive: "Inactive",
        add: "Add a member",
        edit: "Edit",
        remove: "Delete",
        removeQuestion: "Remove this member from the team?",
        removeBusy: "Deleting…",
        availability: "Availability",
        form: {
          addTitle: "New member",
          editTitle: "Edit member",
          body: "First and last name are enough; the role and specialties place the person within the team.",
          fields: {
            firstName: "First name",
            lastName: "Last name",
            title: "Role",
            email: "Email",
            phone: "Phone",
            specialties: "Specialties",
            commission: "Commission (%)",
          },
          specialtiesHint: "Separated by commas",
          active: "Active on the rota",
          save: "Save",
          saving: "Saving…",
          cancel: "Cancel",
          required: "Required field",
          invalidNumber: "A percentage is expected",
        },
        availabilitySheet: {
          title: "Availability",
          body: "The hours this member works, week after week.",
          closed: "No slot",
          addSlot: "Add a slot",
          removeSlot: "Remove",
          from: "From",
          to: "To",
          open: "Open",
          save: "Save",
          saving: "Saving…",
          cancel: "Cancel",
          invalid: "The end time must come after the start time.",
          hint: "The week you send replaces the previous one; a day with no slot stays closed online.",
        },
        emptyTitle: "No team member",
        emptyBody:
          "A member receives their appointments and availability; without a team, online booking stays closed.",
      },
      reviews: {
        title: "Reviews",
        lead: "What clients say, before and after publication.",
        count: "reviews",
        tabs: { pending: "Pending", published: "Published", all: "All" },
        columns: {
          client: "Client",
          rating: "Rating",
          comment: "Comment",
          source: "Source",
          state: "State",
        },
        states: { pending: "To publish", published: "Published" },
        approve: "Publish",
        add: "Record a review",
        remove: "Delete",
        removeQuestion: "Delete this review?",
        removeBusy: "Deleting…",
        form: {
          title: "Review given at the desk",
          body: "The rating first, the comment if they left one. The review goes to moderation.",
          fields: {
            rating: "Rating",
            customerName: "Person's name",
            comment: "Comment",
          },
          customerNameHint: "Leave empty for an anonymous review",
          save: "Save",
          saving: "Saving…",
          cancel: "Cancel",
        },
        anonymous: "Anonymous client",
        sources: { PUBLIC: "Public page", INTERNAL: "Salon" },
        stats: { total: "Reviews", pending: "To publish", average: "Average" },
        note: "A review left on the public page appears only after it is published.",
        emptyTitle: "No review in this tab",
        emptyBody: "Reviews left on the public page land here, waiting to be published.",
      },
      messages: {
        title: "Messages",
        lead: "Enquiries sent from the salon's public page.",
        count: "messages",
        tabs: { unread: "Unread", all: "All" },
        markRead: "Mark as read",
        remove: "Delete",
        removeQuestion: "Delete this message?",
        removeBusy: "Deleting…",
        read: "Read",
        unread: "New",
        noSubject: "(no subject)",
        emptyTitle: "No message",
        emptyBody: "Contact requests sent from the public page appear here.",
        emptyUnreadTitle: "All caught up",
        emptyUnreadBody: "No unread message is left in the inbox.",
      },
      gallery: {
        title: "Gallery",
        lead: "Photos published on the salon's public page.",
        count: "photos",
        noCaption: "No caption",
        add: "Add a photo",
        remove: "Delete",
        removeQuestion: "Delete this photo?",
        removeBusy: "Deleting…",
        uploadTitle: "New photo",
        uploadBody:
          "JPEG, PNG or WebP, 10 MB at most. The photo reaches the public page as soon as it is sent.",
        fields: {
          file: "Image",
          caption: "Caption",
          tags: "Tags",
        },
        tagsHint: "Separated by commas",
        chooseFile: "Choose an image",
        upload: "Upload",
        uploading: "Uploading…",
        cancel: "Cancel",
        noFile: "Choose an image.",
        tooBig: "This image is over 10 MB.",
        notImage: "This file is not an image.",
        emptyTitle: "The gallery is empty",
        emptyBody: "Photos added to the salon show on its public page and here.",
        note: "Photos are added from this screen and appear on the public page straight away.",
      },
      billing: {
        title: "Subscription",
        lead: "The current plan and its history.",
        current: "Current plan",
        fields: { plan: "Plan", status: "State", price: "Monthly amount", start: "Since", trial: "Trial until", end: "Ends" },
        statuses: {
          ACTIVE: "Active",
          SUSPENDED: "Suspended",
          CANCELLED: "Cancelled",
          TRIAL: "Trial",
          EXPIRED: "Expired",
        },
        history: "History",
        limits: {
          title: "What the plan allows",
          customers: "Clients",
          staff: "Team members",
          gallery: "Photos",
          appointments: "Appointments / month",
        },
        unlimited: "unlimited",
        columns: { plan: "Plan", status: "State", start: "From", end: "To", price: "Amount" },
        emptyTitle: "No active subscription",
        emptyBody: "The salon's subscription will appear here once it is taken out.",
        note: "No payment can be made from the app: the plan is changed with the Belora team.",
      },
      analytics: {
        title: "Analytics",
        lead: "The chosen period, in figures — no spreadsheet.",
        from: "From",
        to: "To",
        revenue: "Revenue",
        averageTicket: "Average ticket",
        appointments: "Appointments",
        completed: "Completed",
        cancelled: "Cancelled",
        clients: "Clients",
        newClients: "New",
        retention: "Retention",
        topServices: "Most requested services",
        topStaff: "Busiest team members",
        columns: { name: "Name", count: "Appointments", revenue: "Amount" },
        byDay: "Revenue by day",
        emptyTitle: "Nothing to measure over this period",
        emptyBody: "Pick a wider period, or record a first appointment.",
        noData: "—",
      },
      calendar: {
        title: "Calendar",
        lead: "What is taken, and what is still free.",
        dateLabel: "Day",
        staffLabel: "Member",
        allStaff: "Whole team",
        busy: "Busy",
        free: "Free slots",
        emptyBusy: "No appointment that day.",
        emptyFree: "No free slot: no published hours and no room left.",
      },
      audit: {
        title: "Journal",
        lead: "Actions recorded on the salon.",
        count: "entries",
        authorLabel: "Author",
        allAuthors: "The whole salon",
        columns: {
          date: "Date",
          action: "Action",
          entity: "Object",
          user: "Author",
          ip: "IP",
        },
        /* Pipeline view: the journal reads top to bottom as a sequence of steps, with a rail, a
           node per action and days separated. */
        families: {
          create: "Created",
          update: "Updated",
          delete: "Deleted",
          session: "Session",
          other: "Other",
        },
        today: "Today",
        yesterday: "Yesterday",
        by: "by",
        machine: "Salon task",
        legend: "Families",
        periodLabel: "Period",
        authorsLabel: "Authors",
        agentLabel: "Browser",
        emptyTitle: "Empty journal",
        emptyBody: "Actions (sign-in, creation, update) are recorded here as they happen.",
      },
      notifications: {
        title: "Notifications",
        lead: "What the salon flagged for you.",
        count: "notifications",
        markRead: "Mark as read",
        statuses: {
          PENDING: "Pending",
          SENT: "Sent",
          FAILED: "Failed",
          READ: "Read",
        },
        channels: {
          EMAIL: "Email",
          SMS: "SMS",
          PUSH: "Push",
          IN_APP: "In the app",
        },
        emptyTitle: "No notification",
        emptyBody: "Confirmations and reminders sent by the salon will appear here.",
      },
      accounts: {
        title: "Accounts & access",
        lead: "Who can sign in to the salon, and in what role.",
        count: "accounts",
        columns: {
          name: "Person",
          role: "Role",
          lastLogin: "Last sign-in",
          state: "State",
        },
        roles: {
          OWNER: "Owner",
          ADMIN: "Administrator",
          MANAGER: "Manager",
          STAFF: "Team",
          SUPER_ADMIN: "Platform",
        },
        you: "you",
        active: "Active",
        inactive: "Inactive",
        neverLoggedIn: "Never signed in",
        add: "Open an access",
        edit: "Edit",
        remove: "Delete",
        removeQuestion: "Delete this access?",
        removeBusy: "Deleting…",
        form: {
          addTitle: "New access",
          editTitle: "Edit access",
          body: "An access is an address, a password and a role: what this person can do in the salon.",
          fields: {
            firstName: "First name",
            lastName: "Last name",
            email: "Email",
            phone: "Phone",
            role: "Role",
            password: "Password",
            newPassword: "New password",
          },
          passwordHint: "At least 8 characters",
          newPasswordHint: "Leave empty to keep the current one",
          activeLabel: "Access open",
          save: "Save",
          saving: "Saving…",
          cancel: "Cancel",
          required: "Required field",
          invalidEmail: "Invalid email address",
          shortPassword: "At least 8 characters",
        },
        emptyTitle: "No account",
        emptyBody: "Only the owner account exists for now.",
      },
      settings: {
        title: "Settings",
        lead: "The salon's identity, appearance and what it published.",
        identity: "Identity",
        impactIdentity:
          "The name and address appear on your public page, in this workspace's sidebar and on your booking page. Save, and the sidebar updates without a reload.",
        impactAppearance:
          "Colours apply to your public page AND to this workspace. Save: the left column changes colour immediately.",
        appearance: "Appearance & socials",
        socials: "Social networks",
        counters: "Published content",
        colors: {
          primary: "Primary colour",
          secondary: "Secondary colour",
          accent: "Accent",
        },
        fields: {
          name: "Name",
          slug: "Address",
          email: "Email",
          phone: "Phone",
          address: "Postal address",
          city: "City",
          country: "Country",
          timezone: "Time zone",
          plan: "Plan",
          description: "Description",
          website: "Website",
          users: "Accounts",
          customers: "Clients",
          staff: "Team",
          services: "Services",
          appointments: "Appointments",
          gallery: "Photos",
        },
        editIdentity: "Edit identity",
        editAppearance: "Edit appearance",
        form: {
          identityTitle: "Salon identity",
          identityBody:
            "The name and slug are public: they make up the public page address. The rest is used when talking to clients.",
          appearanceTitle: "Appearance & socials",
          appearanceBody:
            "Colours apply to the public page. Logo, favicon and banner are hosted image addresses.",
          fields: {
            name: "Name",
            slug: "Address",
            email: "Email",
            phone: "Phone",
            address: "Postal address",
            city: "City",
            country: "Country",
            timezone: "Time zone",
            logo: "Logo (URL)",
            favicon: "Favicon (URL)",
            heroImage: "Banner (URL)",
            description: "Description",
            primaryColor: "Primary colour",
            secondaryColor: "Secondary colour",
            accentColor: "Accent",
            facebook: "Facebook",
            instagram: "Instagram",
            tiktok: "TikTok",
            twitter: "X",
            website: "Website",
            whatsapp: "WhatsApp",
          },
          save: "Save",
          saving: "Saving…",
          cancel: "Cancel",
          required: "Required field",
          invalidEmail: "Invalid email address",
          invalidColor: "Hex colour expected (#0F172A)",
          slugHint: "Lowercase letters, digits and hyphens",
        },
      },
    },

    /* States shared by every workspace screen: a loading state that says nothing,
       an empty state that says what to do, an error that says what to retry. */
    loading: "Loading…",
    cancel: "Cancel",
    errorTitle: "This page could not load",
    errorBody: "The request did not go through. Check your connection, then try again.",
    retry: "Try again",
    emptyTitle: "Nothing to show yet",
    emptyBody: "This place fills up as soon as the first record is saved.",
  },

  /* Home “demo” section: the demo salon's page, loaded live. The labels name what
     the API returns and nothing else. */
  demo: {
    eyebrow: "Live",
    title: "A real salon, read live",
    body:
      "Nothing is staged: the name, colours, services and team belong to the demo salon and are served by the product's API while the page loads.",
    salonLabel: "The salon",
    servicesLabel: "Services",
    teamLabel: "Team",
    bookingOpen: "Open 24/7",
    bookingClosed: "Closed for now",
    min: "min",
    cta: "See this page for my salon",
    empty: "Nothing is published on this salon yet.",
    unavailable: "The demo salon is unreachable right now.",
  },
};
/**
 * Plans — VALUES WRITTEN IN THE FILE, on purpose.
 *
 * `GET /subscriptions/plans` answers **401** without a token, even though the
 * Swagger documents it as public (checked 2026-10-16): a marketing page cannot
 * read its own prices before sign-in. The amounts and quotas below are the
 * backend's, taken from its authenticated endpoint. If they move server-side,
 * they move HERE too — and above all, nothing is sold online (the API has no
 * checkout): the buttons lead to sign-up, never to a transaction.
 */
export const pricing = {
  eyebrow: "Pricing",
  recommended: "Most popular",
  title: "Four plans, one single tool.",
  lead:
    "The price is written in plain sight: no plan hides behind “get in touch” to tell you what Belora costs.",
  note: "The quotas below are the plan's own; they are restated when you create your salon.",
  facts: [
    { value: "14 days", label: "To try it" },
    { value: "No", label: "Commitment" },
    { value: "1 salon", label: "Per account" },
  ],
  plans: [
    {
      name: "Free",
      price: "€0",
      period: "forever",
      tagline: "To open your page",
      features: ["1 stylist", "50 clients", "20 photos", "Online booking"],
      recommended: false,
    },
    {
      name: "Basic",
      price: "€29",
      period: "/ month",
      tagline: "For a growing business",
      features: ["5 stylists", "300 clients", "200 photos", "Custom colours"],
      recommended: true,
    },
    {
      name: "Pro",
      price: "€79",
      period: "/ month",
      tagline: "For established salons",
      features: [
        "Unlimited team and appointments",
        "Advanced analytics",
        "SMS notifications",
        "API access",
      ],
      recommended: false,
    },
    {
      name: "Enterprise",
      price: "€199",
      period: "/ month",
      tagline: "For salon groups",
      features: ["Everything in Pro", "Custom domain", "Dedicated support"],
      recommended: false,
    },
  ],
  cta: "Open a salon",
};

/**
 * FAQ — placed right AFTER pricing, where the objections actually surface. The same block
 * feeds the home page's `FAQPage` JSON-LD: what we show and what we declare cannot diverge.
 */
export const faq = {
  eyebrow: "Frequently asked",
  title: "What owners ask before moving their salon to Belora.",
  lead:
    "Five straight answers to the questions we hear most from owners before they open their page.",
  items: [
    {
      q: "Does Belora replace my paper agenda?",
      a: "Yes. Services, team and clients are entered once; the calendar fills itself at every booking, and each client card keeps the full history of appointments.",
    },
    {
      q: "Can my clients book at night?",
      a: "Yes. Your booking page answers 24/7: a client can book at 11 pm, and you see it on the first screen of your dashboard.",
    },
    {
      q: "What does a stylist see when she signs in?",
      a: "Her own calendar and her clients — nothing else. Prices, statistics and salon settings stay with you.",
    },
    {
      q: "Can I try it before paying?",
      a: "The Free plan is free forever, no credit card: it opens your page with one stylist, fifty clients and online booking.",
    },
    {
      q: "What happens to my data?",
      a: "It stays yours: export on request, never shared with third parties, and nothing is lost if you change plan.",
    },
  ],
};

/**
 * A salon's public page — `/[lang]/s/[slug]`.
 *
 * This is where the home page's promise comes true: each salon gets ITS page, in
 * ITS colours, with ITS services and ITS slots. The labels name what the API
 * returns, the empty states say what to do, and nothing promises what the
 * contract does not carry (no online payment, reviews published after approval).
 */
export const storefront = {
  book: "Book",
  bookOnline: "Book online",
  bookingClosed: "This salon does not take online bookings yet.",
  poweredBy: "Page powered by",
  backHome: "Back to home",
  notFoundTitle: "This salon does not exist — or no longer does.",
  notFoundBody:
    "The address you followed does not match any salon page. Check the link you were given.",
  unavailableTitle: "The page is temporarily unavailable",
  unavailableBody: "The salon's server is not answering. Try again in a moment.",
  loading: "Loading the salon page…",
  retry: "Try again",
  sections: {
    services: "Services",
    team: "The team",
    gallery: "Gallery",
    reviews: "Reviews",
    booking: "Booking",
    contact: "Contact",
  },
  servicesIntro: "Durations and prices as published by the salon.",
  servicesEmpty: "The salon has not published its services yet.",
  teamEmpty: "The team is not presented yet.",
  galleryEmpty: "No photo published yet.",
  reviewsEmpty: "No review published yet.",
  reviewsNote: "Reviews are published once the salon approves them.",
  average: "average",
  reviewsCount: "reviews",
  priceCurrency: "€",
  breadcrumb: "Salon page",
  booking: {
    title: "Book an appointment",
    lead: "Three steps: the service, the time, your details.",
    steps: { service: "Service", slot: "Slot", details: "Details" },
    stepLabel: "Step",
    of: "of",
    min: "min",
    chooseService: "Pick a service",
    chooseStaff: "With whom?",
    anyStaff: "Anyone",
    chooseDay: "Pick a day",
    chooseTime: "Pick a time",
    noSlots: "No slot is free that day. Try another date.",
    slotsError: "The slots could not be loaded.",
    slotsLoading: "Looking for slots…",
    next: "Continue",
    back: "Back",
    confirm: "Confirm the appointment",
    sending: "Sending…",
    fields: {
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
      email: "Email (optional)",
      notes: "Anything we should know (optional)",
      notesPlaceholder: "A preference, an allergy, a late arrival…",
    },
    required: "Required field",
    invalidEmail: "Invalid email address",
    invalidPhone: "Invalid phone number",
    noStaff: "The team is not published yet: online booking opens as soon as a member is added.",
    phoneHint: "The salon calls you on this number if anything changes.",
    summary: "Summary",
    at: "at",
    change: "Change",
    successTitle: "Appointment sent",
    successBody: "The salon received your request. It confirms the appointment by phone.",
    newBooking: "Book another appointment",
    error: "The booking did not go through. Check your details, then try again.",
    slotTaken: "That slot has just been taken. Pick another one.",
    closedError: "This salon does not accept online bookings right now.",
  },
  contact: {
    lead: "A question about a service, a price or a time? Write to the salon.",
    name: "Name",
    email: "Email",
    phone: "Phone (optional)",
    subject: "Subject (optional)",
    message: "Message",
    required: "Required field",
    invalidEmail: "Invalid email address",
    requiredHint: "* required fields",
    submit: "Send the message",
    sending: "Sending…",
    successTitle: "Message sent",
    successBody: "The salon has received your message and will reply by email.",
    again: "Write another message",
    error: "The message could not be sent. Please try again in a moment.",
  },
  review: {
    title: "Leave a review",
    lead: "Your rating helps the next clients choose.",
    rating: "Your rating",
    name: "Your name (optional)",
    comment: "Your comment (optional)",
    commentPlaceholder: "What you liked, what could be improved…",
    requiredRating: "Pick a rating between 1 and 5.",
    submit: "Publish my review",
    sending: "Sending…",
    successTitle: "Thank you for your review",
    successBody: "It will be published on the page once the salon approves it.",
    again: "Leave another review",
    error: "The review could not be sent. Please try again in a moment.",
  },
};

const dictionary = {
  site, nav, services, hero, stats, about, projects, filters,
  testimonials, aboutPage, servicesPage, contactPage, devisPage, finalCta, clients, pricing, faq,
  storefront, showcase, ui,
};

export default dictionary;
