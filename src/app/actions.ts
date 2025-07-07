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

    // Process environments recursively
    function processContent(text: string): string {
        // Itemize
        text = text.replace(/\\begin\{itemize\}(?:\[.*?\])?([\s\S]*?)\\end\{itemize\}/gs, (_, inner) => {
            const items = inner.trim().split('\\item').slice(1).map(item => {
                return `<li>${processContent(item.trim())}</li>`;
            }).join('');
            return `<ul class="list-disc pl-8 my-2">${items}</ul>`;
        });

        // Center
        text = text.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/gs, (_, inner) => {
            return `<div class="text-center">${processContent(inner.trim())}</div>`;
        });
        
        // Inline commands and formatting
        text = text
            .replace(/\\Huge\{(.*?)\}/g, '<h1 class="text-4xl font-bold">$1</h1>')
            .replace(/\\section\*\{(.*?)\}/g, '<h2 class="text-2xl font-semibold mt-6 mb-2 border-b border-gray-300 pb-1">$1</h2>')
            .replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')
            .replace(/\\href\{(.*?)\}\{(.*?)\}/g, '<a href="$1" class="text-blue-600 hover:underline">$2</a>')
            .replace(/\\today/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
            .replace(/\\\\/g, '<br />');
        
        return text;
    }

    let html = processContent(content);

    // Basic paragraph handling
    html = html.trim().split(/\n\s*\n/).map(p => {
        const trimmedP = p.replace(/\n/g, ' ').trim();
        if(trimmedP) return `<p class="my-2">${trimmedP}</p>`;
        return '';
    }).join('');
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');

    // The template name is ignored, but we wrap the content
    return `<div class="non-ai-rendered p-12 font-serif bg-white text-black h-full">${html}</div>`;
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
