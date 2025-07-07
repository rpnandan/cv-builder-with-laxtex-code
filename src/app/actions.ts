
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

function simpleLatexToHtml(latex: string): string {
    function processInlineCommands(text: string): string {
        if (!text) return '';
        // Recursively process nested commands
        // Order is important: escaped chars first, then formatting.
        let processedText = text
            .replace(/\\%/g, '%')
            .replace(/\\&/g, '&')
            .replace(/\\\$/g, '$')
            .replace(/\\#/g, '#')
            .replace(/\\_/g, '_')
            .replace(/\\{/g, '{')
            .replace(/\\}/g, '}')
            .replace(/\\textbf\{(.*?)\}/gs, (_, inner) => `<strong class="font-semibold text-foreground">${processInlineCommands(inner)}</strong>`)
            .replace(/\\textit\{(.*?)\}/gs, (_, inner) => `<em>${processInlineCommands(inner)}</em>`)
            .replace(/\\underline\{(.*?)\}/gs, (_, inner) => `<span class="underline">${processInlineCommands(inner)}</span>`)
            .replace(/\\small\{(.*?)\}/gs, (_, inner) => `<span class="text-sm">${processInlineCommands(inner)}</span>`)
            .replace(/\\href\{(.*?)\}\{(.*?)\}/gs, (_, url, linkText) => `<a href="${url.trim()}" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">${processInlineCommands(linkText)}</a>`);
        
        // Process simple replacement commands
        processedText = processedText
            .replace(/\\today/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
            .replace(/\\\\(?:\[.*?\])?/g, '<br />')
            .replace(/\\quad/g, '&emsp;')
            .replace(/\\qquad/g, '&emsp;&emsp;')
            .replace(/~/g, '&nbsp;');

        return processedText;
    }

    let html = latex.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/)?.[1] || latex;

    // Strip preamble and other ignored block commands
    html = html.replace(/\\documentclass(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\usepackage(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\geometry(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\hypersetup\{[\s\S]*?\}/gs, '');
    html = html.replace(/\\vspace\*?(?:\[.*?\])?\{.*?\}/g, '');

    // Process environments from inside out to handle nesting
    let changed = true;
    while (changed) {
        const originalHtml = html;
        // Itemize (unordered list)
        html = html.replace(/\\begin\{itemize\}(?:\[.*?\])?((?:(?!\\begin\{itemize\}|\\end\{itemize\})[\s\S])*?)\\end\{itemize\}/gs, (_, inner) => {
            const items = inner.split(/\\item(?![a-z])/).filter(s => s.trim()).map(item => {
                const cleanItem = item.trim().replace(/^\[.*?\]\s*/, '');
                return `<li class="pb-1">${cleanItem}</li>`;
            }).join('');
            return `<ul class="list-disc list-outside pl-5 space-y-1 mb-4">${items}</ul>`;
        });
        // Enumerate (ordered list)
        html = html.replace(/\\begin\{enumerate\}(?:\[.*?\])?((?:(?!\\begin\{enumerate\}|\\end\{enumerate\})[\s\S])*?)\\end\{enumerate\}/gs, (_, inner) => {
            const items = inner.split(/\\item(?![a-z])/).filter(s => s.trim()).map(item => {
                const cleanItem = item.trim().replace(/^\[.*?\]\s*/, '');
                return `<li class="pb-1">${cleanItem}</li>`;
            }).join('');
            return `<ol class="list-decimal list-outside pl-5 space-y-1 mb-4">${items}</ol>`;
        });
        changed = originalHtml !== html;
    }

    // Process block-level commands
    html = html.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/gs, (_, inner) => `<div class="text-center mb-4">${inner.trim()}</div>`);
    
    // Font size commands
    html = html.replace(/{\\Huge\s(.*?)}|\\Huge\{(.*?)\}/gs, (_, g1, g2) => `<h1 class="text-4xl font-headline font-bold tracking-tight mb-2">${g1 || g2 || ''}</h1>`);
    html = html.replace(/{\\LARGE\s(.*?)}|\\LARGE\{(.*?)\}/gs, (_, g1, g2) => `<h2 class="text-3xl font-headline font-bold tracking-tight mb-2">${g1 || g2 || ''}</h2>`);
    html = html.replace(/{\\Large\s(.*?)}|\\Large\{(.*?)\}/gs, (_, g1, g2) => `<h3 class="text-2xl font-headline font-semibold mb-1">${g1 || g2 || ''}</h3>`);
    html = html.replace(/{\\large\s(.*?)}|\\large\{(.*?)\}/gs, (_, g1, g2) => `<div class="text-lg font-semibold mb-1">${g1 || g2 || ''}</div>`);
    
    // Sectioning
    html = html.replace(/\\section\*?(?:\[.*?\])?\{(.*?)\}/gs, (_, inner) => `<h2 class="text-xl font-headline font-semibold text-primary mt-6 mb-3 border-b-2 border-primary/20 pb-2">${inner}</h2>`);
    html = html.replace(/\\hline/g, '<hr class="my-4 border-border" />');
    
    // Cleanup leftover item commands
    html = html.replace(/\\item/g, '');
    
    // Final Processing: Apply inline commands and structure paragraphs
    const blockRegex = /(<(?:div|ul|ol|h[1-6]|hr)[^>]*>[\s\S]*?<\/(?:div|ul|ol|h[1-6])>|<hr\s*\/?>)/i;
    const parts = html.split(blockRegex).filter(Boolean);
    
    html = parts.map(part => {
        if (part.match(blockRegex)) {
            // It's an HTML block, process inline commands within it
            return processInlineCommands(part);
        }

        // It's a chunk of raw text.
        return part
            .trim()
            .split(/\n\s*\n/) // Split into paragraphs
            .filter(p => p.trim())
            .map(p => {
                const paragraphLines = p.trim().split('\n');
                const usesHfill = paragraphLines.some(l => l.includes('\\hfill'));
                
                if (usesHfill) {
                    return paragraphLines.map(line => {
                        const trimmedLine = line.trim();
                        if (trimmedLine.includes('\\hfill')) {
                            const segments = trimmedLine.split(/\\hfill/g).map(s => `<span>${processInlineCommands(s.trim())}</span>`);
                            return `<div class="flex items-baseline justify-between w-full">${segments.join('')}</div>`;
                        }
                        return `<p class="leading-relaxed mb-2">${processInlineCommands(trimmedLine)}</p>`;
                    }).join('\n');
                } else {
                    const singleLineParagraph = paragraphLines.join(' ');
                    return `<p class="leading-relaxed mb-2">${processInlineCommands(singleLineParagraph)}</p>`;
                }
            })
            .join('');
    }).join('\n');

    // Final cleanup of empty tags
    html = html.replace(/<p><\/p>|<p>\s*<\/p>/g, '');

    return `<div class="non-ai-rendered p-8 md:p-12 font-body bg-card text-card-foreground h-full">${html}</div>`;
}


export async function generateResumeAction(
  input: LatexResumeRenderingInput
): Promise<{ renderedResume?: string; error?: string }> {
  try {
    const validatedInput = actionInputSchema.parse(input);
    const result = simpleLatexToHtml(validatedInput.latexCode);
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
