export const DEFAULT_LATEX_CODE = `\\documentclass[a4paper,11pt]{article}
\\usepackage{latexsym}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{enumitem}
\\usepackage{geometry}
\\geometry{a4paper, total={170mm,257mm}, left=20mm, top=20mm}
\\usepackage{hyperref}

\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,      
    urlcolor=cyan,
}

\\begin{document}

\\begin{center}
    {\\Huge John Doe} \\\\
    \\vspace{1mm}
    \\today \\\\
    \\vspace{1mm}
    Anytown, USA \\\\
    \\vspace{1mm}
    (123) 456-7890 | \\href{mailto:john.doe@email.com}{john.doe@email.com} | \\href{https://linkedin.com/in/johndoe}{linkedin.com/in/johndoe} | \\href{https://github.com/johndoe}{github.com/johndoe}
\\end{center}

\\section*{Summary}
Highly motivated and \\textit{results-oriented} Software Engineer with 5+ years of experience in developing, testing, and deploying robust software solutions. Proficient in various programming languages and technologies, with a strong foundation in data structures and algorithms. Seeking to leverage my skills to contribute to a challenging and innovative development environment.

\\section*{Experience}
\\begin{itemize}[leftmargin=*]
    \\item \\textbf{Senior Software Engineer}, Tech Solutions Inc. | 2020 - Present
    \\begin{itemize}
        \\item Led a team of 5 engineers in the development of a new cloud-based SaaS platform.
        \\item Designed and implemented microservices architecture using Docker and Kubernetes.
        \\item Improved application performance by 30% through code optimization and database tuning.
    \\end{itemize}
    \\item \\textbf{Software Engineer}, Web Innovators LLC | 2018 - 2020
    \\begin{itemize}
        \\item Developed and maintained front-end components using React and Redux.
        \\item Collaborated with UX/UI designers to create responsive and user-friendly interfaces.
        \\item Wrote unit and integration tests, achieving 90% code coverage.
    \\end{itemize}
\\end{itemize}

\\section*{Projects}
\\large{\\textbf{Project Titan}} \\quad \\small{\\textit{Next-Gen Data Pipeline}}
\\begin{itemize}[leftmargin=*]
    \\item Developed a scalable data processing pipeline using Apache Kafka and Spark.
    \\item Reduced data processing time by 50% and improved data accuracy.
\\end{itemize}

\\section*{Education}
\\begin{itemize}[leftmargin=*]
    \\item \\textbf{M.S. in Computer Science}, University of Technology | 2016 - 2018
    \\item \\textbf{B.S. in Computer Science}, State University | 2012 - 2016
\\end{itemize}

\\section*{Technical Skills}
\\begin{enumerate}[leftmargin=*]
    \\item \\textbf{Programming Languages:} Java, Python, JavaScript, TypeScript, Go
    \\item \\textbf{Frameworks:} Spring Boot, Django, React, Node.js
    \\item \\textbf{Databases:} PostgreSQL, MongoDB, Redis
    \\item \\textbf{Tools:} Docker, Kubernetes, Jenkins, Git, AWS
\\end{enumerate}

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
