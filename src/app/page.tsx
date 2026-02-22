export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">Language Learner</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Start learning in four simple steps</h1>
          <p className="text-base text-slate-600">
            Turn new words into long-term memory by moving them through a clear workflow: collect, personalize, study,
            and revise.
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-emerald-100 bg-white/80 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Step 1</p>
            <h2 className="text-xl font-semibold">Collect words from the public list</h2>
            <p className="text-sm text-slate-600">
              Browse the public vocabulary list and save useful words into your private list. This keeps your study set
              focused on what matters to you.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Step 2</p>
            <h2 className="text-xl font-semibold">Add your own vocabulary</h2>
            <p className="text-sm text-slate-600">
              Create your own entries in the private word list to keep learning targeted to your real life.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Step 3</p>
            <h2 className="text-xl font-semibold">Turn your private list into flashcards</h2>
            <p className="text-sm text-slate-600">
              Add items from your private vocabulary to flashcards so you can study and cram with structured review.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Step 4</p>
            <h2 className="text-xl font-semibold">Revise with listening for active recall</h2>
            <p className="text-sm text-slate-600">
              Use the listen feature to rehearse your flashcards while you are busy. Hearing the prompt and recalling the
              answer builds stronger memory and keeps you consistent.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
