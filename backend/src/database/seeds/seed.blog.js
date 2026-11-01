// database/seeds/seed.blog.js
//
// Seeds 5 categories and 20 blog articles.
//
//   node database/seeds/seed.blog.js           add the articles (skips ones that already exist)
//   node database/seeds/seed.blog.js --fresh   delete the seeded articles first, then add them again
//
// Uses the blog model, so reading time and slugs are generated exactly like
// the real admin does. Cover images are left empty on purpose: the website
// shows a coloured gradient until you add real images.


// node src/database/seeds/seed.blog.js
import { pool } from "../config/config.db.js";
import {
  createBlogTables,
  createBlogCategory,
  createBlogPost,
} from "../models/blogs/blogs.model.js";

// ─────────────────────────────────────────────
// SMALL HELPERS FOR WRITING MARKDOWN
// ─────────────────────────────────────────────

const FENCE = "`".repeat(3);
const code = (lang, src) => `${FENCE}${lang}\n${src}\n${FENCE}`;

// intro paragraph, then ## sections: [heading, text]
const md = (intro, sections) =>
  [intro, ...sections.map(([h, t]) => `## ${h}\n\n${t}`)].join("\n\n");

const TEAM = "Futuristic Coders Team";

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

const CATEGORIES = [
  {
    name: "Kids & Parents",
    description: "Guides for parents of young coders.",
  },
  { name: "Web Development", description: "HTML, CSS, JavaScript and React." },
  { name: "Python", description: "Python for beginners, automation and data." },
  {
    name: "Careers",
    description: "Jobs, portfolios, freelancing and interviews.",
  },
  {
    name: "Learning Tips",
    description: "Study habits that help you learn faster.",
  },
];

// ─────────────────────────────────────────────
// ARTICLES (20)
// ─────────────────────────────────────────────

const POSTS = [
  // ───────── Kids & Parents ─────────
  {
    category: "Kids & Parents",
    title: "Why Every Child Should Learn to Code Before Age 12",
    excerpt:
      "Coding is not only for future programmers. It teaches children to think clearly, solve problems and create things instead of just consuming them.",
    tags: ["kids coding", "parents", "problem solving"],
    featured: true,
    content: md(
      `Children grow up surrounded by apps, games and screens. Learning to code lets them see how those things are made, and that changes how they relate to technology for life.`,
      [
        [
          "It teaches thinking, not just typing",
          `When a child writes a program, they must break a big idea into small steps and put the steps in the right order. That habit, called computational thinking, helps in maths, science and even writing a good essay.`,
        ],
        [
          "Mistakes become normal",
          `Code rarely works the first time. Children learn that an error message is a clue, not a failure. They try, test, fix and try again, which builds patience and confidence.`,
        ],
        [
          "It turns screen time into creating time",
          `Instead of only playing games, a child can build one. Even a simple project, like a quiz or an animated story, gives them real pride in something they made themselves.`,
        ],
        [
          "Starting early does not mean starting hard",
          `Block-based tools such as Scratch need no typing of code at all. Children snap colourful blocks together, so they can focus on ideas first and move to written languages later.`,
        ],
      ],
    ),
  },
  {
    category: "Kids & Parents",
    title:
      "Scratch for Beginners: A Parent's Guide to Your Child's First Coding Language",
    excerpt:
      "Scratch is a free, visual way for children to learn programming. Here is what it is, what your child will build, and how you can support them at home.",
    tags: ["scratch", "kids coding", "beginners"],
    featured: true,
    content: md(
      `Scratch is a free tool made for young learners. Instead of typing code, children drag blocks that fit together like puzzle pieces. It is one of the friendliest ways to meet programming for the first time.`,
      [
        [
          "What children can build",
          `Within a few lessons, most children can make a character move, talk and react to the keyboard. Soon after come games, animated stories, quizzes and simple music projects.`,
        ],
        [
          "What they are really learning",
          `Behind the colourful blocks are real ideas: sequences, loops, conditions, variables and events. These are the same ideas used in professional languages, so nothing is wasted when they move on.`,
        ],
        [
          "How you can help at home",
          `You do not need to know how to code. Ask your child to show you their project and explain how it works. Explaining out loud is one of the best ways to learn.\n\n- Ask what they would like to add next\n- Celebrate finished projects, not just perfect ones\n- Keep sessions short and regular rather than long and rare`,
        ],
        [
          "When to move beyond Scratch",
          `When your child starts asking for more control or wants to type their own code, it is a good sign. Python is a popular next step because it reads almost like plain English.`,
        ],
      ],
    ),
  },
  {
    category: "Kids & Parents",
    title: "Screen Time vs Learning Time: Making Coding Count",
    excerpt:
      "Not all screen time is equal. Here is how to tell passive scrolling from active creating, and how to guide your child toward the second kind.",
    tags: ["screen time", "parents", "kids coding"],
    content: md(
      `Many parents worry about how long their children spend on screens. The hours matter, but what children do during those hours matters just as much.`,
      [
        [
          "Consuming versus creating",
          `Watching videos is passive: the child receives and does not respond. Building a game, designing a character or fixing a bug is active, because the child makes decisions the whole time. Coding sits firmly in the second group.`,
        ],
        [
          "Questions that reveal the difference",
          `After a session, ask what your child made, what went wrong and how they fixed it. A child who can answer those questions was working, not just watching.`,
        ],
        [
          "Setting healthy limits",
          `Even good screen time needs balance. Agree on start and finish times in advance, take breaks to stretch and play outside, and keep devices out of the bedroom at night.`,
        ],
      ],
    ),
  },
  {
    category: "Kids & Parents",
    title: "How to Tell If Your Child Is Ready for Coding Classes",
    excerpt:
      "There is no perfect age to start. These simple signs help you decide whether your child is ready, and what kind of class suits them best.",
    tags: ["parents", "kids coding", "classes"],
    content: md(
      `Parents often ask whether their child is too young, or perhaps too old, to begin coding. The honest answer is that readiness depends less on age and more on a few simple habits.`,
      [
        [
          "Signs your child may be ready",
          `- They can follow instructions with two or three steps\n- They enjoy puzzles, building toys or games with rules\n- They are curious about how apps and games work\n- They can focus on one activity for 20 to 30 minutes`,
        ],
        [
          "Matching the class to the child",
          `Younger children usually do best with visual tools and playful projects. Teenagers can handle written languages like Python or web development, and adults can start from zero with the same material.`,
        ],
        [
          "What a good first class looks like",
          `Look for small groups, hands-on projects in every lesson, and an instructor who explains ideas in plain language. A trial session is the easiest way to see how your child responds.`,
        ],
      ],
    ),
  },

  // ───────── Web Development ─────────
  {
    category: "Web Development",
    title: "HTML, CSS and JavaScript: What Each One Actually Does",
    excerpt:
      "Every website is built from the same three languages. Here is a simple way to remember what each one does and how they work together.",
    tags: ["html", "css", "javascript", "beginners"],
    featured: true,
    content: md(
      `If you want to build websites, you will meet three languages again and again. They each have a different job, and understanding that makes everything else easier.`,
      [
        [
          "HTML is the structure",
          `HTML decides what is on the page: headings, paragraphs, images, buttons and links. Think of it as the skeleton of a house, with walls and rooms but no paint.`,
        ],
        [
          "CSS is the style",
          `CSS controls how things look: colours, fonts, spacing and layout. It is the paint, the furniture and the lighting. The same HTML can look completely different with different CSS.`,
        ],
        [
          "JavaScript is the behaviour",
          `JavaScript makes the page react. It opens menus, checks forms, loads new content and powers games. It is the electricity and plumbing that make the house work.`,
        ],
        [
          "How they fit together",
          `A button is created with HTML, made attractive with CSS and given a purpose with JavaScript. Learn them in that order and each one will make sense of the last.`,
        ],
      ],
    ),
  },
  {
    category: "Web Development",
    title: "Your First Website in a Weekend: A Simple Plan",
    excerpt:
      "You do not need months of study to publish something real. Follow this two-day plan to build and share your very first web page.",
    tags: ["html", "css", "beginners", "projects"],
    content: md(
      `The fastest way to learn web development is to make a real page about something you care about. A weekend is enough to get a first version online.`,
      [
        [
          "Saturday morning: pick a small idea",
          `Choose something simple, such as a page about your favourite football team, a recipe or a small business. Write down the headings and the text you want before touching any code.`,
        ],
        [
          "Saturday afternoon: build the structure",
          `Use HTML to add a title, a few headings, paragraphs, an image and a link. Open the file in your browser after every few lines so you can see each change.`,
        ],
        [
          "Sunday: add style and share it",
          `Use CSS to choose colours, change fonts and add space between sections. When you are happy, publish the page on a free hosting service and send the link to a friend.`,
        ],
        [
          "What to do next",
          `Your page will not be perfect, and that is fine. Pick one thing to improve each week: a better layout, a mobile-friendly design or a small piece of JavaScript.`,
        ],
      ],
    ),
  },
  {
    category: "Web Development",
    title: "React vs Plain JavaScript: Which Should You Learn First?",
    excerpt:
      "React is popular, but jumping in too early can leave gaps. Here is how to decide when to start with React and when to practise the basics first.",
    tags: ["react", "javascript", "web development"],
    content: md(
      `Many beginners ask whether they should go straight to React. React is powerful and widely used, but it sits on top of JavaScript, so the order you learn them in matters.`,
      [
        [
          "Why plain JavaScript comes first",
          `React is written in JavaScript. If you do not understand variables, functions, arrays and objects, React code will look like magic and every error will feel confusing.`,
        ],
        [
          "What to know before starting React",
          `- Functions and arrow functions\n- Arrays and methods like map and filter\n- Objects and destructuring\n- Basic work with the browser page\n\nIf you are comfortable with these, you are ready.`,
        ],
        [
          "What React gives you",
          `React helps you build larger interfaces out of small, reusable pieces called components, and keeps the page up to date when your data changes. That is why many employers ask for it.`,
        ],
        [
          "A sensible path",
          `Build two or three small projects in plain JavaScript, then rebuild one of them in React. Seeing the same project both ways is the best way to understand what React is solving.`,
        ],
      ],
    ),
  },
  {
    category: "Web Development",
    title: "Five Beginner Portfolio Projects That Impress Employers",
    excerpt:
      "A good portfolio shows that you can finish things. These five small projects cover the skills employers look for without taking months to build.",
    tags: ["portfolio", "projects", "web development", "careers"],
    content: md(
      `Employers rarely have time to read long applications. A few working projects that they can click on say much more than a list of courses.`,
      [
        [
          "1. A personal landing page",
          `Introduce yourself, show your skills and add a way to contact you. Keep it clean and make sure it works well on a phone.`,
        ],
        [
          "2. A to-do or task tracker",
          `This classic project shows you can handle user input, store data and update the page. Add the ability to edit and delete tasks.`,
        ],
        [
          "3. A weather or news app",
          `Fetch data from a public service and display it nicely. This proves you can work with outside data and handle loading and error states.`,
        ],
        [
          "4. A small business website",
          `Build a simple site for a local shop, salon or school, even as a practice exercise. Real-world layout, contact details and a map make it feel professional.`,
        ],
        [
          "5. A quiz or small game",
          `Games show logic and creativity. A quiz with scoring is a good size and is fun for visitors to try.`,
        ],
      ],
    ),
  },

  // ───────── Python ─────────
  {
    category: "Python",
    title: "Why Python Is the Best First Language for Teens and Adults",
    excerpt:
      "Python reads almost like English and is used in websites, data, automation and AI. That makes it a gentle start with a very long reach.",
    tags: ["python", "beginners", "programming"],
    featured: true,
    content: md(
      `If you are choosing your first programming language, Python is one of the safest choices you can make. It is friendly for beginners and still used by professionals every day.`,
      [
        [
          "Simple to read and write",
          `Python uses plain words and clean spacing. A short program is easy to read even if you have never coded before, so you spend your energy on ideas instead of symbols.`,
        ],
        [
          "Used almost everywhere",
          `Python is used to build websites, analyse data, automate repetitive work and train machine learning models. Whatever direction you choose later, Python is likely to be useful.`,
        ],
        [
          "A strong community",
          `Millions of people use Python, so almost every question you have has already been answered online. There are free libraries for nearly any task you can imagine.`,
        ],
        [
          "What to build first",
          `Start with small programs: a number guessing game, a simple calculator or a tool that renames files. Small wins keep you motivated.`,
        ],
      ],
    ),
  },
  {
    category: "Python",
    title: "Python Basics: Variables, Loops and Functions in Plain English",
    excerpt:
      "Three ideas appear in almost every Python program. Learn what they mean and see a short example of each.",
    tags: ["python", "beginners", "basics"],
    content: md(
      `Almost every Python program is built from the same few building blocks. Once these three feel natural, you can read and write a surprising amount of code.`,
      [
        [
          "Variables store information",
          `A variable is a labelled box that holds a value. You can read it later or change it.\n\n${code(
            "python",
            `name = "Amina"\nage = 14\nprint(name, "is", age)`,
          )}`,
        ],
        [
          "Loops repeat actions",
          `A loop runs the same steps many times, so you do not have to write them out again and again.\n\n${code(
            "python",
            `for number in range(1, 4):\n    print("Lap", number)`,
          )}`,
        ],
        [
          "Functions package a job",
          `A function is a named set of steps you can use whenever you need it.\n\n${code(
            "python",
            `def greet(person):\n    return "Hello, " + person\n\nprint(greet("Kamau"))`,
          )}`,
        ],
        [
          "Practise by changing things",
          `Copy each example, run it, then change a value and run it again. Seeing what breaks is one of the fastest ways to learn what each line does.`,
        ],
      ],
    ),
  },
  {
    category: "Python",
    title: "Automate Boring Tasks with Python: Three Easy Ideas",
    excerpt:
      "Python can do the dull, repetitive jobs for you. Here are three beginner-friendly automation ideas you can try within your first month.",
    tags: ["python", "automation", "projects"],
    content: md(
      `One of the most satisfying things about Python is watching it finish a boring job in seconds. You do not need to be an expert to start.`,
      [
        [
          "Rename many files at once",
          `If you have hundreds of photos or documents with messy names, a short script can rename them all in a neat pattern. It is a great first automation because the result is easy to see.`,
        ],
        [
          "Sort a messy downloads folder",
          `Write a script that moves pictures, documents and videos into their own folders. Run it whenever your folder gets untidy.`,
        ],
        [
          "Turn a list into a report",
          `Read a simple spreadsheet or text file, add up the numbers and print a clear summary. This is a small taste of how businesses use Python to save hours of manual work.`,
        ],
        [
          "A word of caution",
          `Always test automation on copies of your files first. A script does exactly what you tell it, including mistakes.`,
        ],
      ],
    ),
  },
  {
    category: "Python",
    title: "Getting Started with Data: What Python Can Do with a Spreadsheet",
    excerpt:
      "If you already use spreadsheets, Python can take your analysis further. Here is what becomes possible and how to begin.",
    tags: ["python", "data", "spreadsheets"],
    content: md(
      `Spreadsheets are great until the data becomes large or the work becomes repetitive. Python picks up from there.`,
      [
        [
          "Why move beyond a spreadsheet",
          `Python can handle far more rows, repeat the same steps on new files without clicking, and produce charts and summaries automatically.`,
        ],
        [
          "The tools you will meet",
          `- pandas for loading and reshaping tables\n- matplotlib for charts\n- Jupyter notebooks for mixing code, results and notes in one place`,
        ],
        [
          "A first small project",
          `Take a simple data set, such as your monthly spending or class marks. Load it, find the average and the highest value, and draw one bar chart. That single project teaches most of the basics.`,
        ],
        [
          "Where it can lead",
          `Data skills are useful in business, health, agriculture and finance. Even basic analysis makes you more valuable in many jobs.`,
        ],
      ],
    ),
  },

  // ───────── Careers ─────────
  {
    category: "Careers",
    title: "How to Become a Software Developer in Kenya: A Realistic Roadmap",
    excerpt:
      "There is no single path into tech, but there is a clear order of steps. Here is a realistic roadmap from complete beginner to job-ready.",
    tags: ["careers", "roadmap", "kenya", "software developer"],
    featured: true,
    content: md(
      `Becoming a developer takes steady effort rather than a special talent. Most people who succeed follow a similar order of steps.`,
      [
        [
          "Step 1: Learn the fundamentals",
          `Pick one language and stay with it long enough to feel comfortable. Python or JavaScript are both good choices. Aim to understand variables, conditions, loops, functions and data structures.`,
        ],
        [
          "Step 2: Build real projects",
          `Reading and watching only take you part of the way. Build small apps that solve real problems, even simple ones, and finish them.`,
        ],
        [
          "Step 3: Choose a direction",
          `Web development, mobile apps, data and automation are all good paths. Choose one for the next six months so your skills deepen instead of spreading thin.`,
        ],
        [
          "Step 4: Show your work",
          `Put your projects online, write short descriptions of what you built, and keep your code tidy. Employers and clients want to see proof.`,
        ],
        [
          "Step 5: Connect with others",
          `Join local meetups, online communities and class groups. Many opportunities, including internships and freelance work, come through people you know.`,
        ],
      ],
    ),
  },
  {
    category: "Careers",
    title: "Building a Developer Portfolio Without Work Experience",
    excerpt:
      "No job yet? No problem. A thoughtful portfolio of personal projects can show everything an employer needs to see.",
    tags: ["portfolio", "careers", "beginners"],
    content: md(
      `The classic problem for new developers is that jobs ask for experience, and experience needs a job. A good portfolio is how you break that circle.`,
      [
        [
          "Quality over quantity",
          `Three or four polished projects beat fifteen unfinished ones. Make sure each one works, looks tidy and loads quickly.`,
        ],
        [
          "Explain each project",
          `For every project, write a short note covering the problem, the tools you used and what you learned. Employers read these notes to understand how you think.`,
        ],
        [
          "Use real problems",
          `Build something for a local shop, a school club or your own family. A project with a real user shows you can listen, plan and deliver.`,
        ],
        [
          "Keep it easy to find",
          `Put your best work on a simple personal website, add your contact details and link to your code. Make it effortless for someone to say yes.`,
        ],
      ],
    ),
  },
  {
    category: "Careers",
    title: "Freelancing as a New Developer: Finding Your First Client",
    excerpt:
      "Freelancing can be a great way to earn while you learn. Here is how to find your first client and deliver work they are happy with.",
    tags: ["freelancing", "careers", "clients"],
    content: md(
      `Your first paid project is often the hardest to land. The good news is that it is usually closer than you think.`,
      [
        [
          "Start with people you know",
          `Small businesses around you often need a simple website, a menu page or an online booking form. Offer to help a local business, and ask for a fair price and a testimonial.`,
        ],
        [
          "Agree on the work in writing",
          `Before starting, write down what you will build, how long it will take, the price and how many changes are included. A clear agreement prevents most disagreements.`,
        ],
        [
          "Communicate often",
          `Send short updates and show progress early. Clients are usually happier with regular contact than with a perfect result delivered after silence.`,
        ],
        [
          "Turn one client into more",
          `When the project is done, ask for a review and for introductions to other people who might need help. Word of mouth is powerful.`,
        ],
      ],
    ),
  },
  {
    category: "Careers",
    title: "Preparing for Your First Technical Interview",
    excerpt:
      "Interviews feel scary because they are unfamiliar. A little preparation turns them into a normal conversation about your skills.",
    tags: ["interview", "careers", "preparation"],
    content: md(
      `A technical interview is not a trick. The interviewer wants to see how you think and whether you would be a good teammate.`,
      [
        [
          "Know your own projects",
          `Be ready to explain every project in your portfolio: why you built it, what was hard and what you would change. Real stories are more convincing than memorised answers.`,
        ],
        [
          "Practise thinking out loud",
          `When you solve a problem, say what you are doing and why. If you get stuck, explain what you have tried. Interviewers value clear reasoning as much as the final answer.`,
        ],
        [
          "Review the basics",
          `Revise core ideas in your main language: data types, loops, functions, arrays and simple problem solving. Practise a handful of small exercises each day in the week before.`,
        ],
        [
          "Ask good questions",
          `Prepare two or three questions about the team, the tools and how new people are supported. It shows real interest and helps you decide whether the job suits you.`,
        ],
      ],
    ),
  },

  // ───────── Learning Tips ─────────
  {
    category: "Learning Tips",
    title: "How to Learn to Code When You Have No Time",
    excerpt:
      "Between work, school and family, free hours are rare. These small habits help you make real progress in as little as 30 minutes a day.",
    tags: ["study habits", "time management", "beginners"],
    content: md(
      `Most people who learn to code are busy with something else. The secret is not finding more time, but using small pieces of time well.`,
      [
        [
          "Short and regular beats long and rare",
          `Thirty minutes every day builds more skill than one six-hour session on a Sunday. Regular practice keeps ideas fresh in your memory.`,
        ],
        [
          "Fix a time and a place",
          `Attach coding to something you already do, such as right after breakfast or on the bus. A fixed routine removes the daily decision about whether to start.`,
        ],
        [
          "Keep a small goal for each session",
          `Decide the target before you sit down: finish one exercise, fix one bug or add one feature. Small wins keep you moving.`,
        ],
        [
          "Be kind to yourself on slow days",
          `You will miss days. Return the next day without guilt. Consistency over months matters far more than any single week.`,
        ],
      ],
    ),
  },
  {
    category: "Learning Tips",
    title: "Why You Should Build Projects, Not Just Watch Tutorials",
    excerpt:
      "Tutorials feel productive, but real skill comes from building. Here is how to escape tutorial loops and start making your own things.",
    tags: ["projects", "learning", "tutorials"],
    content: md(
      `Many beginners fall into the same trap: they watch tutorial after tutorial, feel like they understand, and then freeze in front of a blank screen.`,
      [
        [
          "Why tutorials can mislead",
          `When you follow along, someone else makes the hard decisions. You recognise the answer, but you have not practised finding it yourself.`,
        ],
        [
          "The 50-50 rule",
          `Spend half your learning time on new material and half building something with it. If you learn about loops today, write a small program that uses loops today.`,
        ],
        [
          "Start tiny",
          `Your first projects can be very small: a tip calculator, a quiz or a countdown timer. Finishing small projects builds the confidence to start larger ones.`,
        ],
        [
          "Get stuck on purpose, then search",
          `Struggle for a few minutes before looking for help. That effort is what makes the answer stick when you find it.`,
        ],
      ],
    ),
  },
  {
    category: "Learning Tips",
    title: "Debugging Without Panic: A Beginner's Method",
    excerpt:
      "Every programmer, from beginner to expert, writes bugs. Here is a calm, step-by-step way to find and fix them.",
    tags: ["debugging", "beginners", "learning"],
    content: md(
      `A red error message can feel like a personal failure, but it is just information. Experienced developers spend a lot of their day debugging, and they use a method.`,
      [
        [
          "Read the error message slowly",
          `It usually tells you the file, the line and the kind of problem. Read it all the way through before changing anything.`,
        ],
        [
          "Find the smallest failing case",
          `Remove code until you have the shortest example that still breaks. Smaller code is easier to understand and often reveals the cause.`,
        ],
        [
          "Check your assumptions",
          `Print out values at key points to see what is really happening, not what you think is happening. Many bugs come from a value that is different from what you expected.`,
        ],
        [
          "Take a break and explain it",
          `If you are stuck, step away for ten minutes or explain the problem aloud to a friend, or even a toy. Often the answer appears halfway through the explanation.`,
        ],
      ],
    ),
  },
  {
    category: "Learning Tips",
    title: "Online or In-Person Coding Classes: Choosing What Fits You",
    excerpt:
      "Both formats can work well. Compare how each one handles support, flexibility and motivation so you can choose what suits your life.",
    tags: ["classes", "online learning", "in-person"],
    content: md(
      `The best class is the one you will actually attend and finish. Online and in-person classes both have strengths, and the right choice depends on you.`,
      [
        [
          "Strengths of in-person classes",
          `You get instant help, face-to-face feedback and the energy of learning alongside others. It is easier to stay focused and to ask the small questions that you might not type into a chat.`,
        ],
        [
          "Strengths of online classes",
          `You save travel time, can join from home and often have recordings to review. Online learning suits busy schedules and people who live far from a learning centre.`,
        ],
        [
          "Questions to ask yourself",
          `- Do I stay motivated alone, or do I need people around me?\n- How much time and money does travel cost me?\n- Is my internet reliable enough for live lessons?\n- Would I prefer a fixed timetable or flexibility?`,
        ],
        [
          "Try before you commit",
          `Ask for a trial lesson or a short introduction session. Ten minutes in the real environment will tell you more than any brochure.`,
        ],
      ],
    ),
  },
];

// ─────────────────────────────────────────────
// RUN
// ─────────────────────────────────────────────

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function seed() {
  const fresh = process.argv.includes("--fresh");
  const client = await pool.connect();

  try {
    await createBlogTables();

    if (fresh) {
      const titles = POSTS.map((p) => p.title);
      const del = await client.query(
        `DELETE FROM blog_posts WHERE title = ANY($1::text[])`,
        [titles],
      );
      console.log(`Removed ${del.rowCount} previously seeded articles.`);
    }

    await client.query("BEGIN");

    // Categories (reuse if they already exist)
    const categoryIds = {};
    for (const cat of CATEGORIES) {
      const existing = await client.query(
        `SELECT id FROM blog_categories WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [cat.name],
      );

      categoryIds[cat.name] = existing.rows[0]
        ? existing.rows[0].id
        : (await createBlogCategory(client, cat)).id;
    }

    // Articles
    let created = 0;
    let skipped = 0;

    for (const [i, post] of POSTS.entries()) {
      const exists = await client.query(
        `SELECT 1 FROM blog_posts WHERE title = $1 LIMIT 1`,
        [post.title],
      );

      if (exists.rows.length > 0) {
        skipped++;
        continue;
      }

      const row = await createBlogPost(client, {
        title: post.title,
        category_id: categoryIds[post.category],
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags,
        author_name: TEAM,
        status: "published",
        featured: post.featured === true,
        created_by: null,
      });

      // Spread the dates out, newest first, so the blog looks lived in
      const when = daysAgo(2 + i * 6);
      await client.query(
        `UPDATE blog_posts
         SET published_at = $2, created_at = $2, updated_at = $2
         WHERE id = $1`,
        [row.id, when],
      );

      created++;
    }

    await client.query("COMMIT");
    console.log(
      `Done. Categories: ${CATEGORIES.length}. Articles created: ${created}, skipped (already there): ${skipped}.`,
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
