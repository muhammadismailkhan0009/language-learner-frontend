export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">Language Learner</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Start learning in five simple steps</h1>
          <p className="text-base text-slate-600">
            Follow this workflow to build your vocabulary, practice in context, and review consistently.
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-emerald-100 bg-white/80 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Step 1</p>
            <h2 className="text-xl font-semibold">Register</h2>
            <p className="text-sm text-slate-600">
              Create your account to save your progress and keep your learning history in one place. Once registered,
              you can start building your personal study workflow.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Step 2</p>
            <h2 className="text-xl font-semibold">Add some vocabulary</h2>
            <p className="text-sm text-slate-600">
              Add useful words you want to remember, including meanings and examples when possible. A focused vocabulary
              list makes review sessions faster and more effective.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Step 3</p>
            <h2 className="text-xl font-semibold">Generate cloze cards, then use flashcards to rate</h2>
            <p className="text-sm text-slate-600">
              Turn your vocabulary into cloze cards so you practice words in context instead of isolation. Study each
              card and rate your recall to guide what needs more repetition.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Step 4</p>
            <h2 className="text-xl font-semibold">Generate reading and writing paragraphs for practice</h2>
            <p className="text-sm text-slate-600">
              Use generated paragraphs to read naturally and see how your vocabulary appears in full ideas. Then write
              your own responses to strengthen active usage and grammar control.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Step 5</p>
            <h2 className="text-xl font-semibold">Listen to vocabulary any time</h2>
            <p className="text-sm text-slate-600">
              Play vocabulary audio during short breaks or daily routines to keep exposure consistent. Frequent listening
              improves pronunciation, recognition speed, and long-term retention.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
