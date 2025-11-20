import { Suspense } from 'react';
import { use } from 'react';
import EventDetailPageClient from './EventDetailPageClient';

// Server component to fetch data and pass to client component
export default function EventDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  return (
    <Suspense fallback={
      <>
        <div className="min-h-screen bg-neutral-50 py-12">
          <div className="container-custom">
            <p className="text-muted text-lg">Đang tải sự kiện...</p>
          </div>
        </div>
      </>
    }>
      <EventDetailPageClient params={{ id }} />
    </Suspense>
  );
}