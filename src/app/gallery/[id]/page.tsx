import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface GalleryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch slug or check if entry exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('public_approved_submissions') as any)
    .select('id, slug')
    .or(`id.eq.${id},slug.eq.${id}`)
    .limit(1);

  if (data && data.length > 0 && data[0].slug) {
    redirect(`/entry/${data[0].slug}`);
  }

  redirect(`/entry/${id}`);
}
