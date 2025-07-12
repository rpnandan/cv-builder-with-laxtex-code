'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DEFAULT_LATEX_CODE, TEMPLATES } from '@/lib/constants';
import { generateResumeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSignature, Loader2, Palette, Wand2 } from 'lucide-react';
import ResumePreview from './ResumePreview';


export default function ResumePage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || DEFAULT_LATEX_CODE;
  
  const [latexCode, setLatexCode] = useState(initialCode);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].name);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const handleGenerate = useCallback(async (code: string, template: string) => {
    setIsLoading(true);
    const result = await generateResumeAction({
      latexCode: code,
      templateName: template,
    });

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Rendering Failed',
        description: result.error,
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    handleGenerate(latexCode, selectedTemplate);
  }, [latexCode, selectedTemplate, handleGenerate]);

  const handlePrint = () => {
    window.print();
  };
  
  // This is a dummy component now, mostly replaced by HomePage and ResumePreviewPage.
  // Kept for potential future reference or if routing changes back.
  // For now, it will not be directly rendered.

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-headline font-semibold">ResumeLatex</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Wand2 />
              <span>LaTeX Code</span>
            </SidebarGroupLabel>
            <div className="p-2">
              <Textarea
                value={latexCode}
                onChange={(e) => setLatexCode(e.target.value)}
                placeholder="Enter your LaTeX code here..."
                className="h-64 min-h-64 text-xs font-code bg-background/80"
                aria-label="LaTeX Code Input"
              />
            </div>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Palette />
              <span>Templates</span>
            </SidebarGroupLabel>
            <ScrollArea className="h-96 px-2">
              <div className="grid grid-cols-2 gap-3 p-2">
                {TEMPLATES.map((template) => (
                  <Link
                    key={template.name}
                    href={`/resume/${template.name}?code=${encodeURIComponent(latexCode)}`}
                    passHref
                  >
                    <button
                      className={cn(
                        'rounded-lg overflow-hidden border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-2',
                        selectedTemplate === template.name
                          ? 'border-primary shadow-lg'
                          : 'border-transparent hover:border-primary/50'
                      )}
                      onClick={() => setSelectedTemplate(template.name)}
                      aria-label={`Select ${template.name} template`}
                    >
                      <Image
                        src={template.imageUrl}
                        alt={template.name}
                        width={200}
                        height={283}
                        className="w-full h-auto object-cover"
                        data-ai-hint={template.hint}
                      />
                      <p className="text-xs text-center p-1.5 bg-card/80 backdrop-blur-sm truncate">
                        {template.name}
                      </p>
                    </button>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button onClick={() => handleGenerate(latexCode, selectedTemplate)} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Resume'
            )}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-muted/40">
        <main className="flex flex-col h-screen">
          <header className="no-print flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
            <h2 className="text-xl font-headline font-medium">Preview</h2>
            <Button onClick={handlePrint} variant="outline" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </header>
          <ScrollArea className="flex-1 p-4 lg:p-8">
             <ResumePreview
                latexCode={latexCode}
                templateName={selectedTemplate}
                isLoading={isLoading}
              />
          </ScrollArea>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
