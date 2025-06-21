'use server';

/**
 * @fileOverview LaTeX resume rendering flow.
 *
 * - latexResumeRendering - A function that renders LaTeX resume code into a visually appealing and ATS-friendly format.
 * - LatexResumeRenderingInput - The input type for the latexResumeRendering function.
 * - LatexResumeRenderingOutput - The return type for the latexResumeRendering function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LatexResumeRenderingInputSchema = z.object({
  latexCode: z.string().describe('The LaTeX code of the resume.'),
  templateName: z.string().optional().describe('The name of the template to use for rendering. Defaults to a standard ATS-friendly template if not provided.'),
});
export type LatexResumeRenderingInput = z.infer<typeof LatexResumeRenderingInputSchema>;

const LatexResumeRenderingOutputSchema = z.object({
  renderedResume: z.string().describe('The rendered resume in HTML format.'),
});
export type LatexResumeRenderingOutput = z.infer<typeof LatexResumeRenderingOutputSchema>;

export async function latexResumeRendering(input: LatexResumeRenderingInput): Promise<LatexResumeRenderingOutput> {
  return latexResumeRenderingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'latexResumeRenderingPrompt',
  input: {schema: LatexResumeRenderingInputSchema},
  output: {schema: LatexResumeRenderingOutputSchema},
  prompt: `You are an expert in LaTeX and resume formatting.

You will take the LaTeX code provided and render it into a visually appealing and ATS-friendly HTML resume.

Consider the template name if provided, and adjust the HTML output to match the specified design.

LaTeX Code:
{{latexCode}}

Template Name (if provided):
{{templateName}}

Output the rendered resume in HTML format.`, // TODO: add handlebars for templates
});

const latexResumeRenderingFlow = ai.defineFlow(
  {
    name: 'latexResumeRenderingFlow',
    inputSchema: LatexResumeRenderingInputSchema,
    outputSchema: LatexResumeRenderingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
