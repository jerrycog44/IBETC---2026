export default async function SubmissionStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Submission Status #{id}</h1>
      <p className="text-slate-600 text-sm mt-2">
        Phase 1 Shell: Private participant submission status tracking page placeholder.
      </p>
    </div>
  );
}
