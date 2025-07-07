
export const DEFAULT_LATEX_CODE = `\\documentclass{resume} % Use the custom resume.cls style

\\usepackage[left=0.4 in,top=0.4in,right=0.4 in,bottom=0.4in]{geometry} % Document margins
\\newcommand{\\tab}[1]{\\hspace{.2667\\textwidth}\\rlap{#1}} 
\\newcommand{\\itab}[1]{\\hspace{0em}\\rlap{#1}}
\\name{R.P. Nandan} % Your name
\\address{Bengaluru, INDIA} 
\\address{\\href{mailto:rpnandan@gmail.com}{rpnandan@gmail.com} \\\\ \\href{https://linkedin.com/rpnandan}{linkedin.com/rpnandan}} %

\\begin{document}

%----------------------------------------------------------------------------------------
%	OBJECTIVE
%----------------------------------------------------------------------------------------

\\begin{rSection}{Objective}
Seeking a full-time Software Quality Engineering role at Apple where I can apply my automation skills, API testing expertise, and CI/CD integration experience to improve customer-facing applications and deliver exceptional user experiences.
\\end{rSection}

%----------------------------------------------------------------------------------------
%	PROFESSIONAL SUMMARY
%----------------------------------------------------------------------------------------

\\begin{rSection}{Professional Summary}
Quality Engineer with over 2 years of experience in functional, regression, and automation testing of web, API, and backend services. Proficient in Java, Python, Selenium, Robot Framework, and REST API testing. Experienced in CI/CD integration, Agile methodologies, and AI-powered tools like GitHub Copilot. ISTQB certified with a passion for clean automation architecture, test efficiency, and driving product quality.
\\end{rSection}

%----------------------------------------------------------------------------------------
%	EDUCATION SECTION
%----------------------------------------------------------------------------------------

\\begin{rSection}{Education}
{\\bf Master of Computer Applications}, Lovely Professional University \\hfill {2020 – 2022}
\\end{rSection}

%----------------------------------------------------------------------------------------
%	SKILLS
%----------------------------------------------------------------------------------------

\\begin{rSection}{Skills}
\\begin{itemize}
    \\item \\textbf{Languages:} Java, Python, C++, Shell Scripting
    \\item \\textbf{Automation:} Selenium, Robot Framework, Appium, XCUI, Karate, RestAssured, Playwright
    \\item \\textbf{Testing Types:} Functional, Regression, Performance, API/Web Services, Mobile (iOS), UI/UX
    \\item \\textbf{Frameworks/Tools:} Maven, Gradle, Git, JIRA, GitHub Copilot, Jenkins, Postman
    \\item \\textbf{CI/CD:} GitHub Actions, Jenkins, Agile, DevOps pipelines
    \\item \\textbf{Cloud/Other:} Docker (basic), AWS (learning), JMeter (basic), Accessibility Testing (familiar)
\\end{itemize}
\\end{rSection}

%----------------------------------------------------------------------------------------
%	EXPERIENCE
%----------------------------------------------------------------------------------------

\\begin{rSection}{Experience}
\\textbf{Quality Engineer} \\hfill April 2023 – Present\\\\
\\textbf{IBM} \\hfill \\textit{Bengaluru, IN}
\\begin{itemize}
    \\item Designed and executed automation test frameworks for e-commerce and internal enterprise tools.
    \\item Developed end-to-end UI and API tests using Robot Framework, Selenium with Java, and RestAssured.
    \\item Integrated automation suites into CI/CD pipelines using Jenkins and GitHub Actions.
    \\item Collaborated with developers and PMs to define test strategies and acceptance criteria.
    \\item Conducted regression, smoke, and performance tests across Windows and Mac environments.
    \\item Automated test cases for API responses and service-level integrations involving product delivery and availability logic.
    \\item Performed root cause analysis and log reviews to identify defects across platforms.
    \\item Leveraged GitHub Copilot to enhance test code quality and boost productivity.
\\end{itemize}
\\end{rSection}

%----------------------------------------------------------------------------------------
%	CERTIFICATIONS
%----------------------------------------------------------------------------------------

\\begin{rSection}{Certifications}
{\\bf ISTQB Certified Tester – Foundation Level} \\\\
Certificate Number: ITB - CTFL-123504 (India)
\\end{rSection}

\\end{document}
`;

export const TEMPLATES = [
  { name: 'Classic Professional', imageUrl: 'https://placehold.co/400x566', hint: 'classic professional' },
  { name: 'Modern Minimalist', imageUrl: 'https://placehold.co/400x566', hint: 'modern minimalist' },
  { name: 'Creative Column', imageUrl: 'https://placehold.co/400x566', hint: 'creative resume' },
  { name: 'Academic CV', imageUrl: 'https://placehold.co/400x566', hint: 'academic cv' },
  { name: 'Tech Professional', imageUrl: 'https://placehold.co/400x566', hint: 'tech resume' },
  { name: 'Simple & Clean', imageUrl: 'https://placehold.co/400x566', hint: 'simple clean' },
  { name: 'Executive Suite', imageUrl: 'https://placehold.co/400x566', hint: 'executive resume' },
  { name: 'Bold Typography', imageUrl: 'https://placehold.co/400x566', hint: 'bold typography' },
  { name: 'Infographic Style', imageUrl: 'https://placehold.co/400x566', hint: 'infographic resume' },
  { name: 'Two-Tone', imageUrl: 'https://placehold.co/400x566', hint: 'two tone' },
  { name: 'Project-Focused', imageUrl: 'https://placehold.co/400x566', hint: 'project resume' },
  { name: 'Compact', imageUrl: 'https://placehold.co/400x566', hint: 'compact resume' },
  { name: 'Elegant Script', imageUrl: 'https://placehold.co/400x566', hint: 'elegant script' },
  { name: 'Corporate Standard', imageUrl: 'https://placehold.co/400x566', hint: 'corporate standard' },
  { name: 'Startup Vibe', imageUrl: 'https://placehold.co/400x566', hint: 'startup resume' },
  { name: 'Data Scientist', imageUrl: 'https://placehold.co/400x566', hint: 'data scientist' },
  { name: 'Monochrome', imageUrl: 'https://placehold.co/400x566', hint: 'monochrome resume' },
  { name: 'Swiss Design', imageUrl: 'https://placehold.co/400x566', hint: 'swiss design' },
  { name: 'Entry-Level', imageUrl: 'https://placehold.co/400x566', hint: 'entry-level' },
  { name: 'Photo Resume', imageUrl: 'https://placehold.co/400x566', hint: 'photo resume' },
];
