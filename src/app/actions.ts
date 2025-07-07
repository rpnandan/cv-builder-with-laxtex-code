
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
        let processedText = text
            .replace(/\\textbf\{(.*?)\}/gs, (_, inner) => `<strong class="font-semibold text-foreground">${processInlineCommands(inner)}</strong>`)
            .replace(/\\textit\{(.*?)\}/gs, (_, inner) => `<em>${processInlineCommands(inner)}</em>`)
            .replace(/\\underline\{(.*?)\}/gs, (_, inner) => `<span class="underline">${processInlineCommands(inner)}</span>`)
            .replace(/\\small\{(.*?)\}/gs, (_, inner) => `<span class="text-sm">${processInlineCommands(inner)}</span>`)
            .replace(/\\href\{(.*?)\}\{(.*?)\}/gs, (_, url, linkText) => `<a href="${url}" class="text-primary hover:underline">${processInlineCommands(linkText)}</a>`);
        
        processedText = processedText
            .replace(/\\today/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
            .replace(/\\\\/g, '<br />')
            .replace(/\\quad/g, '&emsp;')
            .replace(/\\qquad/g, '&emsp;&emsp;')
            .replace(/\\vspace\*?(?:\[.*?\])?(?:\{.*?\})?/g, '');

        return processedText;
    }

    let html = latex.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/)?.[1] || latex;

    html = html.replace(/\\documentclass(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\usepackage(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\geometry(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\hypersetup\{[\s\S]*?\}/gs, '');

    let changed = true;
    while (changed) {
        const originalHtml = html;
        html = html.replace(/\\begin\{itemize\}(?:\[.*?\])?((?:(?!\\begin\{itemize\}|\\end\{itemize\})[\s\S])*?)\\end\{itemize\}/gs, (_, inner) => {
            const items = inner.split(/\\item(?![a-z])/).filter(s => s.trim()).map(item => {
                const cleanItem = item.trim().replace(/^\[.*?\]\s*/, '');
                return `<li class="pb-1">${processInlineCommands(cleanItem)}</li>`;
            }).join('');
            return `<ul class="list-disc list-outside pl-5 space-y-1">${items}</ul>`;
        });
        html = html.replace(/\\begin\{enumerate\}(?:\[.*?\])?((?:(?!\\begin\{enumerate\}|\\end\{enumerate\})[\s\S])*?)\\end\{enumerate\}/gs, (_, inner) => {
            const items = inner.split(/\\item(?![a-z])/).filter(s => s.trim()).map(item => {
                const cleanItem = item.trim().replace(/^\[.*?\]\s*/, '');
                return `<li class="pb-1">${processInlineCommands(cleanItem)}</li>`;
            }).join('');
            return `<ol class="list-decimal list-outside pl-5 space-y-1">${items}</ol>`;
        });
        changed = originalHtml !== html;
    }

    html = html.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/gs, (_, inner) => `<div class="text-center mb-8 pb-6 border-b">${processInlineCommands(inner.trim())}</div>`);
    
    html = html.replace(/{\\Huge\s(.*?)}|\\Huge\{(.*?)\}/gs, (_, g1, g2) => `<h1 class="text-4xl font-headline font-bold tracking-tight mb-2">${processInlineCommands(g1 || g2 || '')}</h1>`);
    html = html.replace(/{\\LARGE\s(.*?)}|\\LARGE\{(.*?)\}/gs, (_, g1, g2) => `<h2 class="text-3xl font-headline font-bold tracking-tight mb-2">${processInlineCommands(g1 || g2 || '')}</h2>`);
    html = html.replace(/{\\Large\s(.*?)}|\\Large\{(.*?)\}/gs, (_, g1, g2) => `<h3 class="text-2xl font-headline font-semibold mb-1">${processInlineCommands(g1 || g2 || '')}</h3>`);
    html = html.replace(/{\\large\s(.*?)}|\\large\{(.*?)\}/gs, (_, g1, g2) => `<div class="text-lg font-semibold mb-1">${processInlineCommands(g1 || g2 || '')}</div>`);
    
    html = html.replace(/\\section\*?(?:\[.*?\])?\{(.*?)\}/gs, (_, inner) => `<h2 class="text-xl font-headline font-semibold text-primary mt-6 mb-3 border-b-2 border-primary/20 pb-2">${processInlineCommands(inner)}</h2>`);
    html = html.replace(/\\hline/g, '<hr class="my-4 border-border" />');
    
    html = html.replace(/\\item/g, '');
    
    const blockTags = ['div', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const blockRegex = new RegExp(`(<(?:${blockTags.join('|')})[^>]*>[\\s\\S]*?<\\/(?:${blockTags.join('|')})>|<hr\\s*\\/?>)`, 'gi');
    
    const parts = html.split(blockRegex);
    
    html = parts.map(part => {
        if (!part || part.trim() === '') return '';
        if (part.match(blockRegex)) {
            return part;
        }
        return part.trim().split(/\n\s*\n/).map(p => {
            const trimmedP = p.trim();
            if (!trimmedP) return '';
            return `<p class="leading-relaxed">${processInlineCommands(trimmedP.replace(/\n/g, ' '))}</p>`;
        }).join('');
    }).join('');

    html = html.replace(/<p><\/p>/g, '');

    return `<div class="non-ai-rendered p-8 md:p-12 font-body bg-white text-foreground h-full">${html}</div>`;
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
