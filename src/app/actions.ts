
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
    // Get content inside \begin{document}...\end{document}
    let html = latex.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/)?.[1] || latex;

    // This function will handle inline replacements like \textbf{}
    // It's called recursively to handle nested commands.
    function processInlineCommands(text: string): string {
        if (!text) return '';
        let processedText = text;
        
        // Loop to handle nested inline commands until no more changes are made
        let changed = true;
        while(changed) {
            const originalText = processedText;
            processedText = processedText
                .replace(/\\textbf\{(.*?)\}/gs, (_, inner) => `<strong class="font-semibold text-foreground">${inner}</strong>`)
                .replace(/\\href\{(.*?)\}\{(.*?)\}/gs, (_, url, linkText) => `<a href="${url}" class="text-primary hover:underline">${linkText}</a>`);
            changed = originalText !== processedText;
        }

        // Handle simple non-nested commands
        processedText = processedText
            .replace(/\\today/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
            .replace(/\\\\/g, '<br />');

        return processedText;
    }

    // Process block-level commands and environments
    // Loop to handle nested environments from the inside out.
    // This is key to correctly parsing nested lists.
    let changed = true;
    while (changed) {
        let originalHtml = html;
        // Process the innermost itemize environments first
        html = html.replace(/\\begin\{itemize\}(?:\[.*?\])?((?:(?!\\begin\{itemize\}|\\end\{itemize\})[\s\S])*?)\\end\{itemize\}/gs, (_, inner) => {
            const items = inner.split('\\item').filter(s => s.trim()).map(item => {
                return `<li class="pb-1">${processInlineCommands(item.trim())}</li>`;
            }).join('');
            return `<ul class="list-disc list-outside pl-5 space-y-1">${items}</ul>`;
        });
        changed = originalHtml !== html;
    }

    // Process other block-level elements
    html = html.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/gs, (_, inner) => {
        return `<div class="text-center mb-8 pb-6 border-b">${processInlineCommands(inner.trim())}</div>`;
    });

    html = html.replace(/{\\Huge\s(.*?)}|\\Huge\{(.*?)\}/gs, (_, g1, g2) => `<h1 class="text-4xl font-headline font-bold tracking-tight mb-2">${processInlineCommands(g1 || g2 || '')}</h1>`);
    html = html.replace(/\\section\*\{(.*?)\}/gs, (_, inner) => `<h2 class="text-xl font-headline font-semibold text-primary mt-6 mb-3 border-b-2 border-primary/20 pb-2">${processInlineCommands(inner)}</h2>`);
    
    // Clean up any remaining LaTeX commands that we don't support
    html = html.replace(/\\vspace\*?\{.*?\}/g, '');
    html = html.replace(/\\documentclass(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\usepackage\{.*?\}/g, '');
    html = html.replace(/\\geometry\{.*?\}/g, '');
    html = html.replace(/\\hypersetup\{[\s\S]*?\}/gs, '');
    html = html.replace(/\\begin\{document\}/g, '');
    html = html.replace(/\\end\{document\}/g, '');
    html = html.replace(/\\item/g, ''); // Clean up any stray \items
    
    // After processing, some text might not be in any block. Wrap it in paragraphs.
    html = html.split(/\n\s*\n/).map(p => {
        const trimmedP = p.trim();
        if (!trimmedP) return '';
        // Don't wrap something that is already a block-level HTML element
        if (/^<(h[1-6]|ul|div)/.test(trimmedP)) {
            return trimmedP;
        }
        // Process inline commands for this paragraph text before wrapping
        return `<p class="leading-relaxed">${processInlineCommands(trimmedP.replace(/\n/g, ' '))}</p>`;
    }).join('');

    // Final cleanup
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/[{}]/g, ''); // Remove any leftover curly braces

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
