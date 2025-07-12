'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateResumeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface ResumePreviewProps {
  latexCode: string;
  templateName: string;
  isLoading: boolean;
  isThumbnail?: boolean;
}

export default function ResumePreview({
  latexCode,
  templateName,
  isLoading,
  isThumbnail = false,
}: ResumePreviewProps) {
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    setInternalLoading(true);
    const result = await generateResumeAction({
      latexCode,
      templateName,
    });

    if (result.error) {
      if (!isThumbnail) {
        toast({
          variant: 'destructive',
          title: 'Rendering Failed',
          description: result.error,
        });
      }
      setRenderedHtml(
        `<div class="p-4 text-sm text-destructive-foreground bg-destructive/80">${result.error}</div>`
      );
    } else if (result.renderedResume) {
      setRenderedHtml(result.renderedResume);
      setAnimationKey((prev) => prev + 1);
    }
    setInternalLoading(false);
  }, [latexCode, templateName, toast, isThumbnail]);

  useEffect(() => {
    const timer = setTimeout(() => {
        handleGenerate();
    }, isThumbnail ? 300 : 0); // Add a small delay for thumbnails to prevent excessive re-renders

    return () => clearTimeout(timer);
  }, [latexCode, templateName, handleGenerate, isThumbnail]);

  const showLoadingState = isLoading || internalLoading;

  if (isThumbnail) {
    return (
      <div
        className="w-full h-full bg-background overflow-hidden"
        style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: '500%', height: '500%' }}
      >
        {showLoadingState ? (
          <div className="p-12 space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-5/6 mx-auto" />
            <Skeleton className="h-4 w-full mx-auto" />
            <div className="pt-8 space-y-4">
               <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: renderedHtml || '' }} />
        )}
      </div>
    );
  }

  return (
    <Card
      id="resume-preview"
      className="w-full max-w-[8.5in] min-h-[11in] mx-auto shadow-2xl overflow-hidden"
    >
      <CardContent
        id="resume-preview-content"
        className={cn('p-0', !showLoadingState && 'animate-bounce-in')}
        key={animationKey}
      >
        {showLoadingState ? (
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
  );
}
