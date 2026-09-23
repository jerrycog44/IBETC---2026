export default async function JudgeScoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Judging Submission #{id}</h1>
      <p className="text-slate-600 text-sm mt-2">
        Phase 1 Shell: Virtual scoring interface placeholder.
      </p>
    </div>
  );
}
