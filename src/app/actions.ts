
'use server';

import { latexResumeRendering, type LatexResumeRenderingInput } from '@/ai/flows/latex-compiler';
import { z } from 'zod';

const actionInputSchema = z.object({
  latexCode: z.string(),
  templateName: z.string(),
});

export async function generateResumeAction(
  input: LatexResumeRenderingInput
): Promise<{ renderedResume?: string; error?: string }> {
  try {
    const validatedInput = actionInputSchema.parse(input);
    const result = await latexResumeRendering(validatedInput);
    return { renderedResume: result.renderedResume };
  } catch (e) {
    console.error("Resume generation failed:", e);
    if (e instanceof z.ZodError) {
      return { error: `Invalid input: ${e.errors.map(err => err.message).join(', ')}` };
    }
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to render resume. Please check your LaTeX code for errors. Details: ${errorMessage}` };
  }
}
