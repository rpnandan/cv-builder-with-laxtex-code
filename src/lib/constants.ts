
export const DEFAULT_LATEX_CODE = `\\documentclass{resume} % Use the custom resume.cls style

\\usepackage[left=0.4 in,top=0.4in,right=0.4 in,bottom=0.4in]{geometry} % Document margins
\\newcommand{\\tab}[1]{\\hspace{.2667\\textwidth}\\rlap{#1}} 
\\newcommand{\\itab}[1]{\\hspace{0em}\\rlap{#1}}
\\name{R.P. Nandan} % Your name
\\address{Bengaluru, INDIA} 
\\address{\\href{mailto:rpnandan@gmail.com}{rpnandan@gmail.com} \\\\ \\href{https://linkedin.com/rpnandan}{linkedin.com/rpnandan}}

\\begin{document}

%----------------------------------------------------------------------------------------
%	OBJECTIVE
%----------------------------------------------------------------------------------------

\\begin{rSection}{Objective}
Seeking a full-time Quality Engineer role in the tech or e-commerce industry, where I can apply my automation skills, backend/API testing expertise, and experience in AI-driven QA to ensure exceptional product quality and customer experience.
\\end{rSection}

%----------------------------------------------------------------------------------------
%	SUMMARY
%----------------------------------------------------------------------------------------

\\begin{rSection}{Professional Summary}
Quality Engineer with 2+ years of experience in functional, regression, and automation testing across web and backend systems. Proven ability to integrate automated test suites into CI/CD pipelines and use tools like GitHub Copilot to enhance test development. Strong background in API testing, e-commerce platforms, and cross-platform collaboration. ISTQB certified and passionate about automation excellence and continuous improvement.
\\end{rSection}

%----------------------------------------------------------------------------------------
%	EDUCATION SECTION
%----------------------------------------------------------------------------------------

\\begin{rSection}{Education}
{\\bf Master of Computer Applications}, Lovely Professional University \\hfill {2020 - 2022}
\\end{rSection}

%----------------------------------------------------------------------------------------
% TECHNICAL STRENGTHS	
%----------------------------------------------------------------------------------------

\\begin{rSection}{Skills}
\\begin{tabular}{ @{} >{\\bfseries}l @{\\hspace{6ex}} l }
Programming & Python, PowerShell, Bash, Selenium with Java, C++ \\\\
Automation Tools & Robot Framework, Automation Anywhere, TestNG \\\\
Testing Skills & Regression Testing, UI/UX Testing, API & Backend Validation, Performance Testing \\\\
CI/CD & Git, Jenkins, GitHub Actions, JIRA \\\\
Platforms & Windows, MacOS \\\\
Other Tools & GitHub Copilot, Postman, REST APIs, JIRA, Power BI (basic) \\\\
\\end{tabular}
\\end{rSection}

%----------------------------------------------------------------------------------------
% EXPERIENCE
%----------------------------------------------------------------------------------------

\\begin{rSection}{Experience}
\\textbf{Quality Engineer} \\hfill April 2023 – Present\\\\
\\textbf{IBM} \\hfill \\textit{Bengaluru, IN}
\\begin{itemize}
    \\itemsep -3pt {}
    \\item {\\bf Test Automation:} Developed reusable test suites using Robot Framework and integrated them into CI/CD pipelines, enabling automated validations of key web functionalities.
    \\item {\\bf Regression & Functional Testing:} Led regression efforts for AT\\&T’s e-commerce portal ensuring seamless device availability, checkout, and delivery workflows.
    \\item {\\bf API Testing:} Designed and executed backend API tests for scenarios like delivery pin code checks, stock validations, and device mapping.
    \\item {\\bf AI-Augmented QA:} Leveraged GitHub Copilot to boost automation script quality and reduce manual test effort.
    \\item {\\bf CI/CD Practices:} Integrated test suites into Git-based pipelines with JIRA workflows to enable faster feedback loops and gated deployments.
    \\item {\\bf Cross-platform QA:} Validated compatibility and performance across both Windows and MacOS environments.
    \\item {\\bf Collaboration & Defect Management:} Worked closely with developers and PMs to triage defects and prepare test summary reports for sprint demos.
    \\item {\\bf Data-Driven Testing:} Created parameterized tests to simulate different user inputs and improve UI coverage.
\\end{itemize}
\\end{rSection}

%----------------------------------------------------------------------------------------
% CERTIFICATIONS
%----------------------------------------------------------------------------------------

\\begin{rSection}{Certifications}
{\\bf ISTQB Certified Tester – Foundation Level} \\\\
Certificate Number: ITB - CTFL-123504 (India)
\\end{rSection}

%----------------------------------------------------------------------------------------
%	HOBBIES
%----------------------------------------------------------------------------------------

\\begin{rSection}{Hobbies}
\\begin{itemize}
    \\itemsep -3pt {} 
    \\item Watching movies
    \\item Listening to music
    \\item Playing outdoor and video games
\\end{itemize}
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
  { name: 'Minimalist Dark', imageUrl: 'https://placehold.co/400x566', hint: 'dark resume' },
  { name: 'Graphic Designer', imageUrl: 'https://placehold.co/400x566', hint: 'graphic design' },
  { name: 'Legal Professional', imageUrl: 'https://placehold.co/400x566', hint: 'legal resume' },
  { name: 'Scientific CV', imageUrl: 'https://placehold.co/400x566', hint: 'scientific cv' },
];
