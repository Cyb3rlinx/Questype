import { ResultView } from '@/components/journey/result-view';
export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ResultView resultId={(await params).id} />;
}
