'use client';

import { Suspense } from 'react';
import { DemonstracaoForm } from '../_components/DemonstracaoForm';

export default function NovaDemonstracaoPage() {
  return (
    <Suspense fallback={<div className="p-8">A carregar...</div>}>
      <DemonstracaoForm />
    </Suspense>
  );
}
