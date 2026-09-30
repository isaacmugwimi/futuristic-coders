// Edit this file to change what appears on the Programs page.
// Durations and tags are placeholders: replace with your real details.
//
// IMAGES: point these at the same image files your homepage cards use
// (files inside /public). If a path is wrong, the card falls back to a gradient.
const IMG = {
  scratch: "/images/scratch.jpg",
  web: "/images/web.jpg",
  code: "/images/react.jpg",
  python: "/images/python.jpg",
  adults: "/images/adults.jpg",
};

export const categories = [
  {
    id: "young-creators",
    name: "Young Creators",
    blurb:
      "Visual, playful coding with Scratch. Children learn how computers think by making games and animations.",
  },
  {
    id: "web",
    name: "Web Development",
    blurb:
      "From a first web page to full applications: HTML, CSS, JavaScript, React and back-end basics.",
  },
  {
    id: "python",
    name: "Python & Programming",
    blurb:
      "Learn real programming logic with Python, then use it to solve problems and automate tasks.",
  },
  {
    id: "adults",
    name: "Adults & Career Starters",
    blurb:
      "Focused, portfolio-driven tracks for people switching careers or adding tech skills to their work.",
  },
];

// tier controls the badge and accent color: "beginner" | "intermediate" | "advanced"
export const programs = [
  // Young Creators
  {
    slug: "scratch-basics",
    category: "young-creators",
    tier: "beginner",
    ages: "7 – 11",
    duration: "6 weeks",
    title: "Foundations of Coding",
    summary:
      "Students discover the joy of programming through Scratch, block-based logic, and simple games.",
    tags: ["Scratch", "Logic & Loops", "Animations"],
    image: IMG.scratch,
  },
  {
    slug: "scratch-game-studio",
    category: "young-creators",
    tier: "intermediate",
    ages: "7 – 11",
    duration: "8 weeks",
    title: "Scratch Game Studio",
    summary:
      "Design, build and share complete games with scores, levels and sound effects.",
    tags: ["Game Design", "Variables", "Levels & Sound"],
    image: IMG.scratch,
  },

  // Web Development
  {
    slug: "html-css",
    category: "web",
    tier: "beginner",
    ages: "12 – 15",
    duration: "6 weeks",
    title: "HTML & CSS Foundations",
    summary:
      "Students build and style responsive web pages from a blank file, ending with a personal portfolio page.",
    tags: ["HTML & CSS", "Responsive Design", "Portfolio Page"],
    image: IMG.web,
  },
  {
    slug: "javascript",
    category: "web",
    tier: "intermediate",
    ages: "12 – 15",
    duration: "8 weeks",
    title: "JavaScript Essentials",
    summary:
      "Students make pages come alive, building interactive apps with the language of the web.",
    tags: ["JavaScript", "DOM", "Git Basics"],
    image: IMG.web,
  },
  {
    slug: "react",
    category: "web",
    tier: "advanced",
    ages: "15 – 18",
    duration: "8 weeks",
    title: "React & AI Basics",
    summary:
      "Students learn React development and AI fundamentals through portfolio-ready projects.",
    tags: ["React", "APIs", "AI & ML Basics", "Portfolio Projects"],
    image: IMG.code,
  },
  {
    slug: "full-stack",
    category: "web",
    tier: "advanced",
    ages: "15+",
    duration: "12 weeks",
    title: "Full-Stack Development",
    summary:
      "Connect a React front end to a Node.js back end and a database to ship a complete application.",
    tags: ["Node.js", "Databases", "Authentication", "Deployment"],
    image: IMG.code,
  },

  // Python & Programming
  {
    slug: "python-beginners",
    category: "python",
    tier: "beginner",
    ages: "12+",
    duration: "8 weeks",
    title: "Python for Beginners",
    summary:
      "Learn to think like a programmer with clear, readable Python and small command-line tools.",
    tags: ["Python", "Functions", "Problem Solving"],
    image: IMG.python,
  },
  {
    slug: "python-projects",
    category: "python",
    tier: "intermediate",
    ages: "12+",
    duration: "8 weeks",
    title: "Python Projects & Automation",
    summary:
      "Use Python to automate tasks, work with files and call web APIs in projects you can reuse.",
    tags: ["Automation", "APIs", "File Handling"],
    image: IMG.python,
  },

  // Adults & Career Starters
  {
    slug: "adult-web-bootcamp",
    category: "adults",
    tier: "beginner",
    ages: "18+",
    duration: "16 weeks",
    title: "Web Development Bootcamp",
    summary:
      "A structured path from zero to building and deploying real web applications, with CV and interview prep.",
    tags: ["HTML & CSS", "JavaScript", "React", "Portfolio"],
    image: IMG.adults,
  },
  {
    slug: "python-professionals",
    category: "adults",
    tier: "beginner",
    ages: "18+",
    duration: "6 weeks",
    title: "Python for Professionals",
    summary:
      "Automate reports and repetitive work in your current job with practical Python.",
    tags: ["Automation", "Spreadsheets", "Data Analysis"],
    image: IMG.adults,
  },
];
