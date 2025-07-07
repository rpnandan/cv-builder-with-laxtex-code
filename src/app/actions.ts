
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
    let content = latex.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/)?.[1] || latex;
    if (!content) content = latex; // Fallback for no document environment

    // Process environments recursively
    function processContent(text: string): string {
        // Itemize
        text = text.replace(/\\begin\{itemize\}(?:\[.*?\])?([\s\S]*?)\\end\{itemize\}/gs, (_, inner) => {
            const items = inner.trim().split('\\item').slice(1).map(item => {
                // processContent handles nested lists and other formatting
                return `<li class="pb-1">${processContent(item.trim())}</li>`;
            }).join('');
            return `<ul class="list-disc list-outside pl-5 space-y-1">${items}</ul>`;
        });

        // Center
        text = text.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/gs, (_, inner) => {
            return `<div class="text-center mb-8 pb-6 border-b">${processContent(inner.trim())}</div>`;
        });
        
        // Inline and block-like commands
        text = text
            .replace(/\\Huge\{(.*?)\}/g, '<h1 class="text-4xl font-headline font-bold tracking-tight mb-2">$1</h1>')
            .replace(/\\section\*\{(.*?)\}/g, '<h2 class="text-xl font-headline font-semibold text-primary mt-6 mb-3 border-b-2 border-primary/20 pb-2">$1</h2>')
            .replace(/\\textbf\{(.*?)\}/g, '<strong class="font-semibold text-foreground">$1</strong>')
            .replace(/\\href\{(.*?)\}\{(.*?)\}/g, '<a href="$1" class="text-primary hover:underline">$2</a>')
            .replace(/\\today/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
            .replace(/\\\\/g, '<br />');
        
        return text;
    }

    let html = processContent(content.trim());

    // Paragraph handling. Don't wrap existing block elements.
    html = html.split(/\n\s*\n/).map(p => {
        const trimmedP = p.trim();
        if (!trimmedP) return '';

        // Don't wrap if it's already a block element
        if (/^<(h[1-6]|ul|div)/.test(trimmedP)) {
            return trimmedP;
        }

        // Wrap remaining text in paragraphs
        return `<p class="leading-relaxed">${trimmedP.replace(/\n/g, ' ')}</p>`;
    }).join('');
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');

    // The template name is ignored, but we wrap the content
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
