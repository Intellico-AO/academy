'use client';

import { Suspense, use } from 'react';
import { DemonstracaoForm } from '../_components/DemonstracaoForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarDemonstracaoPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <Suspense fallback={<div className="p-8">A carregar...</div>}>
      <DemonstracaoForm planoId={id} />
    </Suspense>
  );
}
