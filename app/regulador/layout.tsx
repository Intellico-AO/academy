'use client';

import { ReguladorLayout } from '../components/layout/ReguladorLayout';

export default function ReguladorRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReguladorLayout>{children}</ReguladorLayout>;
}
