export const SCHOOL = {
  name: "S.R.T. Vidyamandir",
  tagline: "High School & Junior College",
  established: 2000,
  trust: "Late Shree Satyanarayan Ramnath Singh Trust",
  society: "Satyanarayan Ramnath Thakur Education Society",
  address:
    "Master Wadi, Kapol Niwas, Gopachar Pada, Vir Savarkar Marg, Virar (E), Pin-401305",
  phone: "+91-7030604665",
  phoneHref: "tel:+917030604665",
  email: "srtvidyamandir2000@gmail.com",
};

export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1510758588288-aa8cf9445f5b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920",
  students:
    "https://images.unsplash.com/photo-1758270705290-62b6294dd044?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  art: "https://images.unsplash.com/photo-1758522274945-7f000385a3dd?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
  sports:
    "https://images.unsplash.com/photo-1721441905204-ea1b56b9d7d3?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
  campus:
    "https://images.unsplash.com/photo-1770827730835-221bd728c012?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  event:
    "https://images.unsplash.com/photo-1774700096015-30bbbaf6fdbe?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
};

export const MARQUEE_ITEMS = [
  "Admissions Open 2025-26",
  "1000+ Students",
  "95% Result",
  "50+ Experienced Staff",
];

export const ABOUT_CARDS = [
  {
    id: "teachers",
    title: "Learn with the Best Teachers",
    description:
      "We have the best of teachers who educate with a sole aim to provide all what it takes for a better future of your kids. Our dedicated faculty ensures every student receives personalized attention and guidance.",
    image: IMAGES.students,
    large: true,
  },
  {
    id: "art",
    title: "Defining Education with Art",
    description: "Let your kids discover the colors of life through Art.",
    image: IMAGES.art,
    large: false,
  },
  {
    id: "sports",
    title: "Playing with Purpose",
    description:
      "All work & no play makes Jack a dull boy. We implement teaching involving games and sports.",
    image: IMAGES.sports,
    large: false,
  },
  {
    id: "recreation",
    title: "Recreation is Necessary",
    description:
      "Understanding that recreation is an essential element for students to learn what can't be found in books, we endeavor to indulge kids in every such possible activity. Special coaching in cricket, football, volleyball, and karate.",
    image: IMAGES.campus,
    large: true,
  },
];

export const STATS = [
  { value: 1000, suffix: "+", label: "Students" },
  { value: 50, suffix: "+", label: "Staff" },
  { value: 95, suffix: "%", label: "Result" },
];

export const ACADEMIC_STREAMS = {
  highschool: {
    title: "High School (SSC)",
    description:
      "Our High School division follows the SSC board curriculum with a strong emphasis on fundamentals. Students develop critical thinking, problem-solving skills, and a deep understanding of core subjects including Mathematics, Science, Languages, and Social Studies.",
    features: [
      "SSC Board Curriculum",
      "Science & Math Labs",
      "Language Proficiency",
      "Social Studies",
    ],
  },
  arts: {
    title: "Arts Stream",
    description:
      "The Arts stream nurtures creative and analytical thinkers. Students explore Literature, History, Political Science, Geography, and Psychology, developing a well-rounded perspective on the world.",
    features: [
      "Literature",
      "History & Political Science",
      "Psychology",
      "Geography",
    ],
  },
  commerce: {
    title: "Commerce Stream",
    description:
      "Our Commerce stream equips students with financial literacy and business acumen. With courses in Accountancy, Economics, Business Studies, and Banking, students are prepared for careers in finance and business.",
    features: [
      "Accountancy",
      "Economics",
      "Business Studies",
      "Banking (Vocational)",
    ],
  },
  science: {
    title: "Science Stream",
    description:
      "The Science stream offers rigorous training in Physics, Chemistry, Mathematics, and Biology. Our well-equipped labs provide hands-on experience, preparing students for engineering, medicine, and research.",
    features: [
      "Physics & Chemistry",
      "Mathematics",
      "Biology",
      "Computer Science (Vocational)",
    ],
  },
} as const;

export const CLASS_OPTIONS = [
  "5th Standard",
  "6th Standard",
  "7th Standard",
  "8th Standard",
  "9th Standard",
  "10th Standard",
  "11th Arts",
  "11th Commerce",
  "11th Science",
  "12th Arts",
  "12th Commerce",
  "12th Science",
];

export const DOCUMENTS = [
  {
    title: "Birth Certificate",
    desc: "Original and photocopy of the student's birth certificate.",
  },
  {
    title: "Transfer Certificate (TC)",
    desc: "Transfer certificate from the previous school, duly signed.",
  },
  {
    title: "Report Card",
    desc: "Latest mark sheet or report card from the previous academic year.",
  },
  { title: "Aadhar Card", desc: "Aadhar card copy of the student." },
  {
    title: "Passport Size Photos",
    desc: "4 recent passport-sized photographs of the student.",
  },
  {
    title: "Parent ID Proof",
    desc: "Government-issued ID proof of parent/guardian (Aadhar/PAN/Voter ID).",
  },
  {
    title: "Caste Certificate (if applicable)",
    desc: "For students applying under reserved categories.",
  },
  {
    title: "Address Proof",
    desc: "Utility bill, rental agreement, or any valid address proof.",
  },
];

export const EVENT_CATEGORIES = [
  "general",
  "clean_india",
  "plantation",
  "camp",
  "sports",
  "cultural",
];

export const GALLERY_CATEGORIES = [
  "campus",
  "events",
  "sports",
  "academics",
  "general",
];

export const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#academics", label: "Academics" },
  { href: "#events", label: "Events" },
  { href: "#gallery", label: "Gallery" },
  { href: "#birthdays", label: "Birthdays" },
  { href: "#contact", label: "Contact" },
];
