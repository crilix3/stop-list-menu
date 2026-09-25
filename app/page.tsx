import { Suspense } from 'react';
import { parseFilters } from '@/features/stop-list/model/filters';
import { StopListScreen } from '@/features/stop-list/ui/StopListScreen';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const initialFilters = parseFilters(params);

  return (
    <main className="mx-auto flex w-full max-w-295 flex-col gap-8 px-6 py-10">
      <Suspense fallback={null}>
        <StopListScreen initialFilters={initialFilters} />
      </Suspense>
    </main>
  );
}
