// Central content file. Edit here.
export const site = {
  name: "Rishitha Dhanala",
  role: "B.Tech CSE · Undergraduate · AP RGUKT RK Valley",
  brand: "Think with Rishi",
  quote: "I learn by building.\nI grow by solving.",
  intro:
    "I'm an undergraduate Computer Science student exploring software development, problem solving, AI and web technologies — building real projects, practicing DSA, and preparing for GATE alongside coursework.",
  
  about: [
    "I'm interested in understanding how technology works and turning what I learn into practical projects. I enjoy exploring programming, strengthening my problem-solving skills, and experimenting with ideas that connect computer science with real-world applications. Through my projects and learning journey, I'm working toward becoming a more thoughtful and capable developer.",
    "I work mainly in C, Java and Python, and I'm building up my web development skills with HTML, CSS and JavaScript. I like turning ideas into working software, and practising DSA to think more clearly about problems. I also share my learning on YouTube.",
  ],

  email: "rishithadhanala@gmail.com",
  github: "https://github.com/RISHITHA-DHANALA",
  location: "Andhra Pradesh, India",
  links: {
    portfolio: "https://rishitha-dhanala-portfolio.vercel.app/",
    youtube: "https://www.youtube.com/@rishithaspace",
    linkedin: "https://linkedin.com/in/rishitha-dhanala",
  },
  resumePath: "/Rishitha-Dhanala-Resume.pdf",
  formEndpoint: import.meta.env.VITE_FORM_ENDPOINT || "",
};

export const education = [
  {
    degree: "B.Tech in Computer Science and Engineering",
    school: "RGUKT RK Valley",
    years: "Currently pursuing",
  },
];

export const skills = [
  { group: "Programming", items: ["C", "Java", "Python", "JavaScript"] },
  { group: "Web", items: ["HTML", "CSS"] },
  { group: "Core CS", items: ["Data Structures and Algorithms (DSA)"] },
];

export const projects = [
  {
    title: "DRISHTI-XAI",
    description:
      "An AI-assisted diabetic retinopathy screening prototype built for Smart India Hackathon 2026. The workflow covers fundus image upload, image-quality checking, risk assessment, visual explanation, referral and doctor review. It is a hackathon prototype, not a certified medical product.",
    tech: ["Python", "Streamlit", "OpenCV", "Explainable AI"],
    links: [
      { label: "Live prototype", href: "https://drishti-xai.streamlit.app/" },
      { label: "GitHub", href: "https://github.com/RISHITHA-DHANALA/DRISHTI" },
    ],
  },
];

export const achievements = [
  {
    title: "SIH 2026 internal selection",
    detail: "Team placed in the internal top 50 out of 120 teams.",
  },
];

export const interests = [
  { title: "Data Structures and Algorithms", icon: "M12 3v6M6 21v-6h12v6M12 9H6v6M12 9h6v6" },
  { title: "Software Development", icon: "M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" },
  { title: "Emerging Technologies", icon: "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" },
  { title: "Quantum Computing", status: "Currently Exploring", icon: "M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0M3 12c0-3 4-6 9-6s9 3 9 6-4 6-9 6-9-3-9-6z" },
  { title: "Artificial Intelligence and Machine Learning (AI/ML)", status: "Currently Exploring", icon: "M5 5h14v14H5zM9 9h6v6H9zM9 2v3M15 2v3M9 19v3M15 19v3" },
];
