'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Home, Download } from 'lucide-react';
import { DEFAULT_LATEX_CODE, TEMPLATES } from '@/lib/constants';
import ResumePreview from './ResumePreview';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface ResumePreviewPageProps {
  templateName: string;
}

export default function ResumePreviewPage({ templateName }: ResumePreviewPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const latexCode = searchParams.get('code') || DEFAULT_LATEX_CODE;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };
  
  const handleTemplateSwitch = (newTemplateName: string) => {
     router.push(`/resume/${newTemplateName}?code=${encodeURIComponent(latexCode)}`);
  }

  return (
    <div className="flex h-screen bg-muted/30">
        {/* Main Content: Resume Preview */}
        <main className="flex-1 flex flex-col">
            <header className="no-print flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10 h-[73px]">
                 <Link href={`/?code=${encodeURIComponent(latexCode)}`} passHref>
                    <Button variant="outline" className="gap-2">
                        <Home className="w-4 h-4" />
                        Back to Editor
                    </Button>
                </Link>
                <h2 className="text-xl font-headline font-medium">
                    Preview: <span className="text-primary">{templateName}</span>
                </h2>
                <Button onClick={handlePrint} variant="outline" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground">
                    <Download className="w-4 h-4" />
                    Download PDF
                </Button>
            </header>
            <ScrollArea className="flex-1 p-4 lg:p-8">
                 {isClient ? (
                     <ResumePreview
                        latexCode={latexCode}
                        templateName={templateName}
                        isLoading={false}
                    />
                 ) : (
                    <Card className="w-full max-w-[8.5in] min-h-[11in] mx-auto shadow-2xl overflow-hidden">
                        <CardContent className="p-12 space-y-8">
                            <Skeleton className="h-8 w-3/4 mx-auto" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                 )}
            </ScrollArea>
        </main>

        {/* Right Sidebar: Template Switcher */}
        <aside className="no-print w-[320px] border-l bg-background flex flex-col">
            <header className="p-4 border-b h-[73px] flex items-center">
                <h3 className="text-lg font-semibold">Switch Template</h3>
            </header>
            <ScrollArea className="flex-1 p-4">
                <div className="grid grid-cols-2 gap-4">
                    {TEMPLATES.map((template) => (
                        <div key={template.name} className="group relative">
                             <button
                                onClick={() => handleTemplateSwitch(template.name)}
                                className="w-full text-left rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-2"
                                disabled={template.name === templateName}
                            >
                                <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl overflow-hidden">
                                    <CardContent className="p-0 aspect-[8.5/11]">
                                        {isClient ? (
                                            <ResumePreview
                                                latexCode={latexCode}
                                                templateName={template.name}
                                                isLoading={false}
                                                isThumbnail={true}
                                            />
                                        ) : (
                                            <Skeleton className="w-full h-full" />
                                        )}
                                    </CardContent>
                                </Card>
                            </button>
                            <p className="mt-1.5 text-xs text-center font-medium text-foreground truncate">{template.name}</p>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </aside>
    </div>
  );
}
