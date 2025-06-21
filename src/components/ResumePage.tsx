
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DEFAULT_LATEX_CODE, TEMPLATES } from '@/lib/constants';
import { generateResumeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSignature, Loader2, Palette, Wand2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export default function ResumePage() {
  const [latexCode, setLatexCode] = useState(DEFAULT_LATEX_CODE);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].name);
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    const result = await generateResumeAction({
      latexCode,
      templateName: selectedTemplate,
    });

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Rendering Failed',
        description: result.error,
      });
      setRenderedHtml(`<div class="p-4 text-destructive-foreground bg-destructive/80 rounded-lg">${result.error}</div>`);
    } else if (result.renderedResume) {
      setRenderedHtml(result.renderedResume);
      setAnimationKey(prev => prev + 1); // Trigger animation
    }
    setIsLoading(false);
  }, [latexCode, selectedTemplate, toast]);

  useEffect(() => {
    handleGenerate();
  }, [selectedTemplate, handleGenerate]);
  
  const handlePrint = () => {
    window.print();
  };

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
                  <button
                    key={template.name}
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
                ))}
              </div>
            </ScrollArea>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
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
            <Card
              id="resume-preview"
              className="w-full max-w-[8.5in] min-h-[11in] mx-auto shadow-2xl overflow-hidden"
            >
              <CardContent 
                id="resume-preview-content"
                className={cn('p-0', isLoading ? '' : 'animate-bounce-in')} 
                key={animationKey}
              >
                {isLoading ? (
                  <div className="p-12 space-y-8">
                    <div className="flex items-center justify-center space-x-4">
                       <Skeleton className="h-24 w-24 rounded-full" />
                       <div className="space-y-2 flex-1">
                          <Skeleton className="h-8 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                       </div>
                    </div>
                    <Skeleton className="h-6 w-1/4" />
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                     <Skeleton className="h-6 w-1/4" />
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: renderedHtml || '' }} />
                )}
              </CardContent>
            </Card>
          </ScrollArea>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
