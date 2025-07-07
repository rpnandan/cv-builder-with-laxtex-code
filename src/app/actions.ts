
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

    // Iteratively handle nested formatting commands. This is safer than recursion.
    let processedText = text;
    let changed = true;
    while(changed) {
        const originalText = processedText;
        
        processedText = processedText
            .replace(/{\\Huge\s(.*?)}|\\Huge\{(.*?)\}/gs, '<h1>$1$2</h1>')
            .replace(/{\\LARGE\s(.*?)}|\\LARGE\{(.*?)\}/gs, '<h2>$1$2</h2>')
            .replace(/{\\Large\s(.*?)}|\\Large\{(.*?)\}/gs, '<h3>$1$2</h3>')
            .replace(/\\textbf\{(.*?)\}|{\\bf\s?(.*?)}/gs, '<strong>$1$2</strong>')
            .replace(/\\textit\{(.*?)\}/gs, '<em>$1</em>')
            .replace(/\\underline\{(.*?)\}/gs, '<span class="underline">$1</span>')
            .replace(/\\small\{(.*?)\}/gs, '<span class="text-sm">$1</span>');
        
        changed = originalText !== processedText;
    }
    
    // Handle escaped characters, symbols, and line breaks
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
        // A more robust split that handles ampersands in the content
        const parts = row.split('&');
        const cells = [parts[0], parts.slice(1).join('&')].map(c => c.trim());

        const renderedCells = cells.map((cell, index) => {
            let cellContent = processContent(cell.trim());
            if (index === 0) {
                const boldClass = hasBoldFirstCol ? 'font-bold' : '';
                // Reduce padding and make the column width fixed to optimize space
                const paddingClass = format.includes('hspace{6ex}') ? 'pr-6' : 'pr-4';
                return `<td class="${boldClass} ${paddingClass} align-top w-1/4">${cellContent}</td>`;
            }
            // Add align-top to the second cell as well for consistent vertical alignment
            return `<td class="align-top">${cellContent}</td>`;
        }).join('');
        return `<tr>${renderedCells}</tr>`;
    }).join('');

    return `<table class="w-full table-fixed">${tableRows}</table>`;
}

function simpleLatexToHtml(latex: string, templateName?: string): string {
    // Remove LaTeX comments, but preserve escaped percents \%
    let fullContent = latex.replace(/(?<!\\)%.*$/gm, '');

    // --- Pass 1: Pre-process \href commands on the entire string to avoid parsing issues ---
    const hrefMap = new Map<string, string>();
    let hrefIndex = 0;
    fullContent = fullContent.replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, (_, url, linkText) => {
        const placeholder = `___HREF_PLACEHOLDER_${hrefIndex++}___`;
        const anchorTag = `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${processContent(linkText.trim())}</a>`;
        hrefMap.set(placeholder, anchorTag);
        return placeholder;
    });

    // --- Pass 2: Process document structure (header) from the full string ---
    const nameMatch = fullContent.match(/\\name\{(.*?)\}/);
    const addressMatches = Array.from(fullContent.matchAll(/\\address\{(.*?)\}/g));
    
    let headerHtml = '';
    if (nameMatch || addressMatches.length > 0) {
        let headerContent = '';
        if (nameMatch) {
            headerContent += `<h1>${processContent(nameMatch[1])}</h1>`;
        }
        if (addressMatches.length > 0) {
            const processedAddresses = addressMatches.map(match => {
                return processContent(match[1]);
            }).join('<br />');
            headerContent += `<div>${processedAddresses}</div>`;
        }
        headerHtml = `<div class="resume-header text-center">${headerContent}</div>`;
    }
    
    // Now, extract the body from the content that has href placeholders
    let html = fullContent.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/)?.[1] || fullContent;

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
            const items = inner.split(/\\item(?![a-z])/)
            .map(item => {
                const cleanItem = item.trim().replace(/^\[.*?\]\s*/, '');
                return processContent(cleanItem);
            })
            .filter(processedItem => processedItem.trim())
            .map(filteredItem => `<li>${filteredItem}</li>`)
            .join('');
            return `<ul>${items}</ul>`;
        });
        html = html.replace(/\\begin\{enumerate\}(?:\[.*?\])?((?:(?!\\begin\{enumerate\}|\\end\{enumerate\})[\s\S])*?)\\end\{enumerate\}/gs, (_, inner) => {
             const items = inner.split(/\\item(?![a-z])/)
            .map(item => {
                const cleanItem = item.trim().replace(/^\[.*?\]\s*/, '');
                return processContent(cleanItem);
            })
            .filter(processedItem => processedItem.trim())
            .map(filteredItem => `<li>${filteredItem}</li>`)
            .join('');
            return `<ol>${items}</ol>`;
        });
        html = html.replace(/\\begin\{tabular\}\s*\{(.*)\}([\s\S]*?)\\end\{tabular\}/gs, (fullMatch, format, content) => {
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
    
    // Split remaining content into logical blocks (HTML or raw text)
    const blockRegex = /(<(?:div|ul|ol|h[1-6]|hr|a|table)[^>]*>[\s\S]*?<\/(?:div|ul|ol|h[1-6]|a|table)>|<hr\s*\/?>)/i;
    const parts = html.split(blockRegex).filter(Boolean);
    
    html = parts.map(part => {
        if (part.match(blockRegex)) {
            return part; // It's already an HTML block, so leave it.
        }

        // Process remaining raw text by handling paragraphs and flex layouts
        const lines = part.trim().split('\n').filter(l => l.trim());
        let resultHtml = '';
        let paragraphBuffer: string[] = [];

        const flushBuffer = () => {
            if (paragraphBuffer.length > 0) {
                // Join with a simple space. Let the `\\` in the original
                // text dictate the line breaks.
                const content = processContent(paragraphBuffer.join(' '));
                 if (content) {
                    resultHtml += `<p>${content}</p>`;
                }
                paragraphBuffer = [];
            }
        };

        for (const line of lines) {
             // Trim trailing line breaks before checking for hfill
            const cleanLine = line.trim().replace(/\\\\(?:\[.*?\])?\s*$/, '').trim();

            if (cleanLine.includes('\\hfill')) {
                flushBuffer(); // End the current paragraph
                const segments = cleanLine.split(/\\hfill/g).map(s => {
                    const cleanSegment = s.trim();
                    return `<span>${processContent(cleanSegment)}</span>`;
                });
                resultHtml += `<div class="flex-container">${segments.join('')}</div>`;
            } else {
                paragraphBuffer.push(line);
            }
        }
        flushBuffer(); // Flush any remaining lines
        return resultHtml;
    }).join('');

    // Final cleanups
    html = html.replace(/\\item/g, ''); // Remove stray \item commands
    html = html.replace(/<p><\/p>|<p>\s*<\/p>/g, ''); // Remove empty paragraphs
    html = html.replace(/(<br\s*\/?>\s*)+/g, '<br />'); // Collapse multiple breaks
    html = html.replace(/<p>\s*<br\s*\/?\s*<\/p>/g, ''); // Remove paragraphs with only a break

    let finalHtmlResult = headerHtml + html;

    // --- Pass 3: Restore hrefs from placeholders ---
    hrefMap.forEach((anchorTag, placeholder) => {
        finalHtmlResult = finalHtmlResult.replace(new RegExp(placeholder, 'g'), anchorTag);
    });

    const templateClassName = templateName ? `template-${templateName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}` : 'template-classic-professional';
    return `<div class="non-ai-rendered ${templateClassName} p-8 md:p-12 font-body bg-card text-card-foreground h-full">${finalHtmlResult}</div>`;
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
