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

function processInlineCommands(text: string): string {
    if (!text) return '';
    
    let processedText = text
        .replace(/\\%/g, '%')
        .replace(/\\&/g, '&')
        .replace(/\\\$/g, '$')
        .replace(/\\#/g, '#')
        .replace(/\\_/g, '_')
        .replace(/\\{/g, '{')
        .replace(/\\}/g, '}')
        .replace(/\\textbf\{(.*?)\}/gs, (_, inner) => `<strong>${processInlineCommands(inner)}</strong>`)
        .replace(/\\textit\{(.*?)\}/gs, (_, inner) => `<em>${processInlineCommands(inner)}</em>`)
        .replace(/\\underline\{(.*?)\}/gs, (_, inner) => `<span class="underline">${processInlineCommands(inner)}</span>`)
        .replace(/\\small\{(.*?)\}/gs, (_, inner) => `<span class="text-sm">${processInlineCommands(inner)}</span>`)
        .replace(/\\href\{(.*?)\}\{(.*?)\}/gs, (_, url, linkText) => `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${processInlineCommands(linkText)}</a>`);
    
    processedText = processedText
        .replace(/\\today/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
        .replace(/\\\\(?:\[.*?\])?/g, '<br />')
        .replace(/\\quad/g, '&emsp;')
        .replace(/\\qquad/g, '&emsp;&emsp;')
        .replace(/~/g, '&nbsp;');

    return processedText;
}

function simpleLatexToHtml(latex: string, templateName?: string): string {
    let html = latex.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/)?.[1] || latex;

    html = html.replace(/\\documentclass(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\usepackage(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\geometry(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\hypersetup\{[\s\S]*?\}/gs, '');
    html = html.replace(/\\vspace\*?(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\maketitle/g, '');

    let changed = true;
    while (changed) {
        const originalHtml = html;
        html = html.replace(/\\begin\{itemize\}(?:\[.*?\])?((?:(?!\\begin\{itemize\}|\\end\{itemize\})[\s\S])*?)\\end\{itemize\}/gs, (_, inner) => {
            const items = inner.split(/\\item(?![a-z])/).filter(s => s.trim()).map(item => {
                const cleanItem = item.trim().replace(/^\[.*?\]\s*/, '');
                return `<li>${processInlineCommands(cleanItem)}</li>`;
            }).join('');
            return `<ul>${items}</ul>`;
        });
        html = html.replace(/\\begin\{enumerate\}(?:\[.*?\])?((?:(?!\\begin\{enumerate\}|\\end\{enumerate\})[\s\S])*?)\\end\{enumerate\}/gs, (_, inner) => {
            const items = inner.split(/\\item(?![a-z])/).filter(s => s.trim()).map(item => {
                const cleanItem = item.trim().replace(/^\[.*?\]\s*/, '');
                return `<li>${processInlineCommands(cleanItem)}</li>`;
            }).join('');
            return `<ol>${items}</ol>`;
        });
        changed = originalHtml !== html;
    }

    html = html.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/gs, (_, inner) => `<div class="text-center mb-4">${processInlineCommands(inner.trim())}</div>`);
    
    html = html.replace(/{\\Huge\s(.*?)}|\\Huge\{(.*?)\}/gs, (_, g1, g2) => `<h1>${processInlineCommands(g1 || g2 || '')}</h1>`);
    html = html.replace(/{\\LARGE\s(.*?)}|\\LARGE\{(.*?)\}/gs, (_, g1, g2) => `<h2>${processInlineCommands(g1 || g2 || '')}</h2>`);
    html = html.replace(/{\\Large\s(.*?)}|\\Large\{(.*?)\}/gs, (_, g1, g2) => `<h3>${processInlineCommands(g1 || g2 || '')}</h3>`);
    html = html.replace(/{\\large\s(.*?)}|\\large\{(.*?)\}/gs, (_, g1, g2) => `<div class="text-lg font-semibold mb-1">${processInlineCommands(g1 || g2 || '')}</div>`);
    
    html = html.replace(/\\section\*?(?:\[.*?\])?\{(.*?)\}/gs, (_, inner) => `<h2>${processInlineCommands(inner)}</h2>`);
    html = html.replace(/\\hline/g, '<hr />');
    
    const blockRegex = /(<(?:div|ul|ol|h[1-6]|hr|a)[^>]*>[\s\S]*?<\/(?:div|ul|ol|h[1-6]|a)>|<(hr|br)\s*\/?>)/i;
    const parts = html.split(blockRegex).filter(Boolean);
    
    html = parts.map(part => {
        if (part.match(blockRegex)) {
            return part;
        }

        return part
            .trim()
            .split(/\n\s*\n/)
            .filter(p => p.trim())
            .map(paragraph => {
                const lines = paragraph.trim().split('\n');
                const usesHfill = lines.some(l => l.includes('\\hfill'));
                
                if (usesHfill) {
                    return lines.map(line => {
                        const trimmedLine = line.trim();
                        if (trimmedLine.includes('\\hfill')) {
                            const segments = trimmedLine.split(/\\hfill/g).map(s => `<span>${processInlineCommands(s.trim())}</span>`);
                            return `<div class="flex-container">${segments.join('')}</div>`;
                        }
                        return `<p>${processInlineCommands(trimmedLine)}</p>`;
                    }).join('');
                } else {
                    const singleLineParagraph = lines.join(' ');
                    return `<p>${processInlineCommands(singleLineParagraph)}</p>`;
                }
            })
            .join('');
    }).join('');

    html = html.replace(/\\item/g, '');
    html = html.replace(/<p><\/p>|<p>\s*<\/p>/g, '');

    const templateClassName = templateName ? `template-${templateName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}` : 'template-classic-professional';
    return `<div class="non-ai-rendered ${templateClassName} p-8 md:p-12 font-body bg-card text-card-foreground h-full">${html}</div>`;
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
