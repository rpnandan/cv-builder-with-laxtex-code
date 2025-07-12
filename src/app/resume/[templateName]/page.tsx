import ResumePreviewPage from '@/components/ResumePreviewPage';

export default function ResumePage({ params }: { params: { templateName: string } }) {
  return <ResumePreviewPage templateName={decodeURIComponent(params.templateName)} />;
}
