
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
    // This function recursively processes inline commands.
    // This allows for nesting, e.g. \textbf{\href{...}{...}}
    function processInlineCommands(text: string): string {
        if (!text) return '';
        // The order is important. Process complex containers first, then simple replacements.
        let processedText = text
            .replace(/\\textbf\{(.*?)\}/gs, (_, inner) => `<strong class="font-semibold text-foreground">${processInlineCommands(inner)}</strong>`)
            .replace(/\\href\{(.*?)\}\{(.*?)\}/gs, (_, url, linkText) => `<a href="${url}" class="text-primary hover:underline">${processInlineCommands(linkText)}</a>`);
        
        // After recursive calls, do simple replacements.
        processedText = processedText
            .replace(/\\today/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
            .replace(/\\\\/g, '<br />')
            .replace(/\\vspace\*?\{.*?\}/g, ''); // remove vspace

        return processedText;
    }

    // Get content inside \begin{document}...\end{document}
    let html = latex.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/)?.[1] || latex;

    // Remove things we don't support at all, before any processing.
    html = html.replace(/\\documentclass(?:\[.*?\])?\{.*?\}/g, '');
    html = html.replace(/\\usepackage\{.*?\}/g, '');
    html = html.replace(/\\geometry\{.*?\}/g, '');
    html = html.replace(/\\hypersetup\{[\s\S]*?\}/gs, '');


    // Process block-level commands and environments
    // Loop to handle nested environments from the inside out.
    let changed = true;
    while (changed) {
        const originalHtml = html;
        // Process the innermost itemize environments first
        html = html.replace(/\\begin\{itemize\}(?:\[.*?\])?((?:(?!\\begin\{itemize\}|\\end\{itemize\})[\s\S])*?)\\end\{itemize\}/gs, (_, inner) => {
            const items = inner.split(/\\item(?![a-z])/).filter(s => s.trim()).map(item => {
                // Process content of each item
                return `<li class="pb-1">${processInlineCommands(item.trim())}</li>`;
            }).join('');
            return `<ul class="list-disc list-outside pl-5 space-y-1">${items}</ul>`;
        });
        changed = originalHtml !== html;
    }

    // Process other block-level elements after lists are done
    html = html.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/gs, (_, inner) => {
        return `<div class="text-center mb-8 pb-6 border-b">${processInlineCommands(inner.trim())}</div>`;
    });

    html = html.replace(/{\\Huge\s(.*?)}|\\Huge\{(.*?)\}/gs, (_, g1, g2) => `<h1 class="text-4xl font-headline font-bold tracking-tight mb-2">${processInlineCommands(g1 || g2 || '')}</h1>`);
    html = html.replace(/\\section\*\{(.*?)\}/gs, (_, inner) => `<h2 class="text-xl font-headline font-semibold text-primary mt-6 mb-3 border-b-2 border-primary/20 pb-2">${processInlineCommands(inner)}</h2>`);
    
    // Clean up any stray \item commands.
    html = html.replace(/\\item/g, '');
    
    // After processing blocks, wrap remaining text content in paragraphs.
    // This is more careful to not wrap existing html blocks.
    const blocks = html.split(/(<(?:div|ul|h1|h2)[^>]*>[\s\S]*?<\/(?:div|ul|h1|h2)>)/g);
    
    html = blocks.map(block => {
        if (!block || block.trim() === '') {
            return '';
        }
        // If it's an HTML block we've already created, leave it alone.
        if (block.match(/^<(?:div|ul|h1|h2)/)) {
            return block;
        }
        // It's text between our blocks. Process it for paragraphs.
        return block.split(/\n\s*\n/).map(p => {
            const trimmedP = p.trim();
            if (!trimmedP) return '';
            // Process inline commands for this paragraph text before wrapping
            return `<p class="leading-relaxed">${processInlineCommands(trimmedP.replace(/\n/g, ' '))}</p>`;
        }).join('');
    }).join('');

    // Final cleanup of things that might be left over.
    html = html.replace(/<p><\/p>/g, ''); // remove empty paragraphs

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
