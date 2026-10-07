// Edit this file to change what appears on the Programs page.
// Durations, schedules and details are placeholders: replace with your real details.
//
// IMAGES: point these at the same image files your homepage cards use
// (files inside /public). If a path is wrong, the card falls back to a gradient.
//
// `details` is shown in the popup modal. Every field is optional;
// anything you remove is simply hidden in the modal.
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
    details: {
      overview:
        "A playful first step into programming. Children use Scratch's drag-and-drop blocks to make characters move, talk and react, learning how computers follow instructions along the way.",
      outcomes: [
        "Understand sequences, loops and conditions",
        "Create animated stories and characters",
        "Build a simple interactive game",
        "Think step by step to solve problems",
      ],
      prerequisites: ["Basic mouse and keyboard skills", "No prior coding needed"],
      schedule: "2 sessions per week, 60 minutes each",
      format: "Physical & online",
      requirements: "A computer or laptop with internet access",
    },
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
    details: {
      overview:
        "Young creators go from simple projects to full games. They plan a game idea, build it with scores and levels, test it with friends, and share it online.",
      outcomes: [
        "Use variables to track scores and lives",
        "Design multiple levels with rising difficulty",
        "Add sound effects and music",
        "Test, debug and improve a game",
      ],
      prerequisites: ["Completed Foundations of Coding, or basic Scratch experience"],
      schedule: "2 sessions per week, 60 minutes each",
      format: "Physical & online",
      requirements: "A computer or laptop with internet access",
    },
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
    details: {
      overview:
        "A hands-on introduction to building websites. Students start with a blank file and finish with a live personal portfolio page they can show to family and friends.",
      outcomes: [
        "Structure pages with semantic HTML",
        "Style layouts with Flexbox and Grid",
        "Make pages responsive on phones and laptops",
        "Publish a portfolio page online",
      ],
      prerequisites: ["Basic computer skills", "No prior coding needed"],
      schedule: "2 sessions per week, 90 minutes each",
      format: "Physical & online",
      requirements: "A laptop and internet access",
    },
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
    details: {
      overview:
        "Students add behaviour to their web pages with JavaScript, building small interactive apps such as a quiz, a to-do list and a calculator.",
      outcomes: [
        "Write variables, functions, loops and conditions",
        "Update pages dynamically with the DOM",
        "Handle clicks, forms and keyboard events",
        "Track work with Git and GitHub",
      ],
      prerequisites: ["HTML & CSS Foundations, or equivalent experience"],
      schedule: "2 sessions per week, 90 minutes each",
      format: "Physical & online",
      requirements: "A laptop and internet access",
    },
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
    details: {
      overview:
        "Students build modern interfaces with React and get a practical introduction to AI, connecting their apps to real APIs and finishing with projects worthy of a portfolio.",
      outcomes: [
        "Build reusable components with props and state",
        "Fetch and display data from APIs",
        "Understand core AI and machine learning ideas",
        "Complete portfolio-ready projects",
      ],
      prerequisites: ["Comfortable with JavaScript basics", "Familiar with HTML & CSS"],
      schedule: "2 sessions per week, 2 hours each",
      format: "Physical & online",
      requirements: "A laptop with internet access",
    },
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
    details: {
      overview:
        "The complete journey from interface to server. Students build a full application with a React front end, a Node.js and Express API, and a PostgreSQL database, then deploy it.",
      outcomes: [
        "Design and build REST APIs with Node.js and Express",
        "Model and query data in a relational database",
        "Add user login and authentication",
        "Deploy a full application online",
      ],
      prerequisites: ["Solid JavaScript skills", "Basic React experience"],
      schedule: "2 sessions per week, 2 hours each",
      format: "Physical & online",
      requirements: "A laptop with internet access",
    },
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
    details: {
      overview:
        "A gentle start in programming using Python. Learners practise breaking problems into steps and turn them into small, working programs.",
      outcomes: [
        "Use variables, data types and operators",
        "Control flow with conditions and loops",
        "Organise code with functions",
        "Build small command-line tools and games",
      ],
      prerequisites: ["Basic computer skills", "No prior coding needed"],
      schedule: "2 sessions per week, 90 minutes each",
      format: "Physical & online",
      requirements: "A laptop and internet access",
    },
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
    details: {
      overview:
        "Learners put Python to work on real tasks: renaming files, processing data, and pulling information from web APIs into tools they can keep using.",
      outcomes: [
        "Read, write and organise files automatically",
        "Call web APIs and handle the responses",
        "Structure larger programs into modules",
        "Finish several reusable automation projects",
      ],
      prerequisites: ["Python for Beginners, or equivalent experience"],
      schedule: "2 sessions per week, 90 minutes each",
      format: "Physical & online",
      requirements: "A laptop and internet access",
    },
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
    details: {
      overview:
        "An intensive, structured path for career starters and switchers. You go from zero to building and deploying real web applications, with portfolio reviews and interview preparation.",
      outcomes: [
        "Build responsive sites with HTML, CSS and JavaScript",
        "Create interactive apps with React",
        "Ship projects for a professional portfolio",
        "Prepare your CV, GitHub profile and interview skills",
      ],
      prerequisites: ["Basic computer skills", "No prior coding needed", "Commitment to weekly practice"],
      schedule: "3 sessions per week, 2 hours each",
      format: "Physical & online",
      requirements: "A laptop and reliable internet access",
    },
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
    details: {
      overview:
        "Practical Python for people who already have a job. You learn just enough programming to automate reports, clean spreadsheets and analyse data, saving hours every week.",
      outcomes: [
        "Automate repetitive reports and tasks",
        "Read and clean Excel and CSV data",
        "Analyse data and summarise results",
        "Apply Python directly to your own work",
      ],
      prerequisites: ["Comfortable with spreadsheets", "No prior coding needed"],
      schedule: "2 evening sessions per week, 90 minutes each",
      format: "Physical & online",
      requirements: "A laptop and internet access",
    },
  },
];