'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Wand2, FileSignature, Loader2, BookOpenCheck } from 'lucide-react';
import { DEFAULT_LATEX_CODE, TEMPLATES } from '@/lib/constants';
import ResumePreview from './ResumePreview';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

export default function HomePage() {
  const [latexCode, setLatexCode] = useState(DEFAULT_LATEX_CODE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Debounce mechanism
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleLatexChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setLatexCode(newCode);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    setIsGenerating(true);
    const newTimeout = setTimeout(() => {
        setIsGenerating(false);
    }, 500);
    setDebounceTimeout(newTimeout);
  };
  
  // This helps prevent hydration mismatches by only rendering previews on the client
  useState(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Left Pane: LaTeX Editor */}
      <div className="flex w-1/2 flex-col border-r bg-background">
        <header className="flex items-center gap-4 border-b p-4">
          <FileSignature className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold">ResumeLatex</h1>
        </header>
        <div className="flex flex-col p-4 flex-1">
            <label htmlFor="latex-editor" className="flex items-center gap-2 text-lg font-semibold mb-2">
                <Wand2 />
                <span>LaTeX Code</span>
            </label>
            <Textarea
                id="latex-editor"
                value={latexCode}
                onChange={handleLatexChange}
                placeholder="Enter your LaTeX code here..."
                className="flex-1 resize-none text-xs font-code bg-background/80"
                aria-label="LaTeX Code Input"
            />
        </div>
        <footer className="p-4 border-t">
            <Link href={`/resume/${TEMPLATES[0].name}?code=${encodeURIComponent(latexCode)}`} passHref>
                <Button className="w-full" size="lg">
                    <BookOpenCheck className="mr-2"/>
                    Open Full Preview
                </Button>
            </Link>
        </footer>
      </div>

      {/* Right Pane: Template Gallery */}
      <div className="flex w-1/2 flex-col">
        <header className="flex h-[73px] items-center justify-between border-b bg-background p-4">
          <h2 className="text-xl font-headline font-medium">Live Templates</h2>
          {isGenerating && (
             <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Updating...</span>
            </div>
          )}
        </header>
        <ScrollArea className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {TEMPLATES.map((template) => (
              <div key={template.name} className="group relative">
                <Link href={`/resume/${template.name}?code=${encodeURIComponent(latexCode)}`} passHref>
                  <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden aspect-[8.5/11]">
                    <CardContent className="p-0 h-full">
                       <div className="w-full h-full">
                         {isClient ? (
                           <ResumePreview
                             latexCode={latexCode}
                             templateName={template.name}
                             isLoading={isGenerating}
                             isThumbnail={true}
                           />
                         ) : (
                           <div className="p-4">
                               <Skeleton className="w-full h-full" />
                           </div>
                         )}
                       </div>
                    </CardContent>
                  </Card>
                </Link>
                <p className="mt-2 text-sm text-center font-medium text-foreground truncate">{template.name}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
