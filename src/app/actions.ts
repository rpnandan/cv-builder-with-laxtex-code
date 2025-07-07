
'use server';

import { z } from 'zod';

export type LatexResumeRenderingInput = {
  latexCode: string;
  templateName?: string;
};

const actionInputSchema = z.object({
  latexCode: z.string(),
  templateName: z.string().optional(),
});

function processContent(text: string): string {
    if (!text) return '';

    // The order of these replacements is critical. We process in passes.

    // Pass 1: Iteratively handle nested formatting commands. This is safer than recursion.
    let processedText = text;
    let changed = true;
    while(changed) {
        const originalText = processedText;
        
        processedText = processedText
            // Handle links first as they are a common source of issues
            .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, (_, url, linkText) => {
                return `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
            })
            .replace(/{\\Huge\s(.*?)}|\\Huge\{(.*?)\}/gs, '<h1>$1$2</h1>')
            .replace(/{\\LARGE\s(.*?)}|\\LARGE\{(.*?)\}/gs, '<h2>$1$2</h2>')
            .replace(/{\\Large\s(.*?)}|\\Large\{(.*?)\}/gs, '<h3>$1$2</h3>')
            .replace(/{\\large\s(.*?)}|\\large\{(.*?)\}/gs, '<div class="text-lg font-semibold mb-1">$1$2</div>')
            .replace(/\\textbf\{(.*?)\}|{\\bf\s?(.*?)}/gs, '<strong>$1$2</strong>')
            .replace(/\\textit\{(.*?)\}/gs, '<em>$1</em>')
            .replace(/\\underline\{(.*?)\}/gs, '<span class="underline">$1</span>')
            .replace(/\\small\{(.*?)\}/gs, '<span class="text-sm">$1</span>');
        
        changed = originalText !== processedText;
    }
    
    // Pass 2: Handle escaped characters, symbols, and line breaks
    processedText = processedText
        .replace(/\\itemsep\s*.*?\s*\{.*?\}/g, '') // Remove itemsep
        .replace(/\\(tab|itab)\{.*?\}/g, '')      // Remove custom tab commands
        .replace(/\\%/g, '%')
        .replace(/\\&/g, '&')
        .replace(/\\\$/g, '$')
        .replace(/\\#/g, '#')
        .replace(/\\_/g, '_')
        .replace(/\\{/g, '{')
        .replace(/\\}/g, '}')
        .replace(/\\today/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
        .replace(/\\\\(?:\[.*?\])?|\\(?=\s*[\r\n]|$)/g, '<br />')
        .replace(/\\quad/g, '&emsp;')
        .replace(/\\qquad/g, '&emsp;&emsp;')
        .replace(/~/g, '&nbsp;')
        .replace(/\\ /g, ' '); // handle escaped space

    return processedText;
}


function parseTabular(content: string, format: string): string {
    const hasBoldFirstCol = format.includes('>{\\bfseries}l') || format.includes('>{\\bf}l');
    const rows = content.trim().split(/\\\\\s*/).filter(r => r.trim());

    const tableRows = rows.map(row => {
        const cells = row.split('&').map((cell, index) => {
            let cellContent = processContent(cell.trim());
            if (hasBoldFirstCol && index === 0) {
                return `<td class="font-bold">${cellContent}</td>`;
            }
            return `<td>${cellContent}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    return `<table class="w-full">${tableRows}</table>`;
}

function simpleLatexToHtml(latex: string, templateName?: string): string {
    // Remove LaTeX comments, but preserve escaped percents \%
    latex = latex.replace(/(?<!\\)%.*$/gm, '');

    let html = latex.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/)?.[1] || latex;

    // --- Pre-processing for custom commands & header ---
    html = html.replace(/\\(\s*[\r\n])/g, '\\\\$1'); // Fix single backslash at EOL

    const nameMatch = latex.match(/\\name\{(.*?)\}/);
    const addressMatches = Array.from(latex.matchAll(/\\address\{(.*?)\}/g));
    
    let headerHtml = '';
    if (nameMatch) {
        headerHtml += `<div class="text-center mb-4"><h1>${processContent(nameMatch[1])}</h1>`;
        html = html.replace(/\\name\{(.*?)\}/, '');
    }
    if (addressMatches.length > 0) {
        const processedAddresses = addressMatches.map(match => {
            html = html.replace(match[0], '');
            return processContent(match[1]);
        }).join('<br />');
        headerHtml += `<div class="text-center">${processedAddresses}</div>`;
    }
    if (headerHtml) {
        headerHtml += '</div>';
    }
    
    // Cleanup preamble commands that might be inside the document body
    html = html.replace(/\\documentclass(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\usepackage(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\geometry(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\hypersetup\{[\s\S]*?\}/gs, '');
    html = html.replace(/\\newcommand\{.*?\}/g, '');
    html = html.replace(/\\(name|address)\{.*?\}/g, '');
    html = html.replace(/\\vspace\*?(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\maketitle/g, '');

    // Handle custom rSection environment
    html = html.replace(/\\begin\{rSection\}\s*\{(.*?)\}([\s\S]*?)\\end\{rSection\}/g, (fullMatch, title, content) => {
        return `\\section*{${title}}${content}`;
    });

    // Iteratively process nested environments
    let changed = true;
    while (changed) {
        const originalHtml = html;
        html = html.replace(/\\begin\{itemize\}(?:\[.*?\])?((?:(?!\\begin\{itemize\}|\\end\{itemize\})[\s\S])*?)\\end\{itemize\}/gs, (_, inner) => {
            const items = inner.split(/\\item(?![a-z])/).filter(s => s.trim()).map(item => {
                const cleanItem = item.trim().replace(/^\[.*?\]\s*/, '');
                return `<li>${processContent(cleanItem)}</li>`;
            }).join('');
            return `<ul>${items}</ul>`;
        });
        html = html.replace(/\\begin\{enumerate\}(?:\[.*?\])?((?:(?!\\begin\{enumerate\}|\\end\{enumerate\})[\s\S])*?)\\end\{enumerate\}/gs, (_, inner) => {
            const items = inner.split(/\\item(?![a-z])/).filter(s => s.trim()).map(item => {
                const cleanItem = item.trim().replace(/^\[.*?\]\s*/, '');
                return `<li>${processContent(cleanItem)}</li>`;
            }).join('');
            return `<ol>${items}</ol>`;
        });
        html = html.replace(/\\begin\{tabular\}\s*\{(.+?)\}([\s\S]*?)\\end\{tabular\}/gs, (_, format, content) => {
            return parseTabular(content, format);
        });
        changed = originalHtml !== html;
    }

    // Process center environment
    html = html.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/gs, (_, inner) => {
        const lines = inner.trim().split(/\\\\(?:\[.*?\])?/);
        const processedLines = lines.map(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return '';
            return `<div>${processContent(trimmedLine)}</div>`;
        }).join('');
        return `<div class="text-center mb-4">${processedLines}</div>`;
    });
    
    // Process sections and other standalone commands
    html = html.replace(/\\section\*?(?:\[.*?\])?\{(.*?)\}/gs, (_, inner) => `<h2 class="r-section-title">${processContent(inner)}</h2>`);
    html = html.replace(/\\hline/g, '<hr />');
    
    // Split remaining content into paragraphs based on blank lines
    const blockRegex = /(<(?:div|ul|ol|h[1-6]|hr|a|table)[^>]*>[\s\S]*?<\/(?:div|ul|ol|h[1-6]|a|table)>|<hr\s*\/?>)/i;
    const parts = html.split(blockRegex).filter(Boolean);
    
    html = parts.map(part => {
        if (part.match(blockRegex)) {
            return part; // It's already an HTML block, so leave it.
        }

        // Process remaining raw text paragraphs
        return part
            .trim()
            .split(/\n\s*\n/) // Split by blank lines
            .filter(p => p.trim())
            .map(paragraph => {
                let processedParagraph = paragraph;
                
                const isFlexLayout = processedParagraph.includes('\\hfill');
                if (isFlexLayout) {
                    const segments = processedParagraph.split(/\\hfill/g).map(s => {
                        const cleanSegment = s.trim().replace(/\\\\(?:\[.*?\])?\s*$/, '');
                        return `<span>${processContent(cleanSegment)}</span>`
                    });
                    return `<div class="flex-container">${segments.join('')}</div>`;
                }
                
                return `<p>${processContent(processedParagraph)}</p>`;
            })
            .join('');
    }).join('');

    // Final cleanups
    html = html.replace(/\\item/g, ''); // Remove stray \item commands
    html = html.replace(/<p><\/p>|<p>\s*<\/p>/g, ''); // Remove empty paragraphs

    const finalHtml = headerHtml + html;

    const templateClassName = templateName ? `template-${templateName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}` : 'template-classic-professional';
    return `<div class="non-ai-rendered ${templateClassName} p-8 md:p-12 font-body bg-card text-card-foreground h-full">${finalHtml}</div>`;
}

export async function generateResumeAction(
  input: LatexResumeRenderingInput
): Promise<{ renderedResume?: string; error?: string }> {
  try {
    const validatedInput = actionInputSchema.parse(input);
    const result = simpleLatexToHtml(validatedInput.latexCode, validatedInput.templateName);
    return { renderedResume: result };
  } catch (e) {
    console.error("Resume generation failed:", e);
    if (e instanceof z.ZodError) {
      return { error: `Invalid input: ${e.errors.map(err => err.message).join(', ')}` };
    }
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to render resume. Please check your LaTeX code for errors. Details: ${errorMessage}` };
  }
}
