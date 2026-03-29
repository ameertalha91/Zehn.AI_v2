import Link from 'next/link';

const pillars = [
  {
    title: 'Structured pathways',
    body: 'Subject-wise tracks and milestones so prep stays cumulative, not random.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    title: 'Visible progress',
    body: 'See where you stand across courses, assignments, and study plans.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'AI-guided study',
    body: 'Ilmi thotbot helps you reason through material—not just finish tasks.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Always available',
    body: 'Practice and review on your schedule—web-first, wherever you study.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero — light, high-contrast (inspired by modern tutoring landings) */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-teal-50/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.15),transparent)]" aria-hidden />
        <div className="container relative py-16 md:py-24 lg:py-28">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-700">
            Zehn.AI
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Intelligent prep for post-grad students preparing for{' '}
            <span className="text-teal-700">competitive exams</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600 md:text-xl">
            From structured pathways to exam-day readiness—personalized support, course-aligned content,
            and progress you can see. Built for learners who are done with undergrad and leveling up for
            the next gate.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/learning-pathways"
              className="inline-flex items-center justify-center bg-teal-600 px-8 py-4 text-center text-base font-semibold text-white transition-colors hover:bg-teal-500"
            >
              Explore learning pathways
            </Link>
            <Link
              href="/cognitive-assistant"
              className="inline-flex items-center justify-center border-2 border-slate-300 bg-white px-8 py-4 text-center text-base font-semibold text-slate-800 transition-colors hover:border-teal-500 hover:text-teal-800"
            >
              Try Ilmi thotbot
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center text-base font-semibold text-teal-700 underline-offset-4 hover:underline sm:px-4"
            >
              Create a free account
            </Link>
          </div>
        </div>
      </header>

      {/* Pillars — Wild Zebra–style feature strip */}
      <section className="border-b border-slate-200 bg-white py-14 md:py-16" aria-labelledby="pillars-heading">
        <div className="container">
          <h2 id="pillars-heading" className="sr-only">
            Why Zehn.AI
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div key={p.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-teal-100 text-teal-800">
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value proposition block */}
      <section className="bg-slate-900 py-16 text-white md:py-20">
        <div className="container">
          <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold leading-tight md:text-4xl">
            Prep that adapts. Progress you can prove.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-slate-300">
            Zehn.AI organizes material into clear tracks, surfaces what to do next, and pairs human-style
            teaching workflows with AI where it helps—not as a shortcut, but as a coach for deeper
            thinking ahead of high-stakes exams.
          </p>
        </div>
      </section>

      {/* Product cards */}
      <section className="py-16 md:py-20">
        <div className="container">
          <h2 className="text-center text-3xl font-bold text-slate-900 md:text-4xl">
            Everything in one place
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Pathways, AI research help, and assignment workflows—for serious post-grad prep programs and
            independent learners alike.
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            <Link href="/learning-pathways" className="group block">
              <div className="h-full border border-slate-200 bg-slate-50 p-8 transition-all hover:border-teal-400 hover:shadow-lg">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center bg-teal-600 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700">
                    Learning pathways
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Browse structured tracks across core and optional subjects—video sessions, readings, and
                  checkpoints aligned to competitive exam breadth.
                </p>
                <span className="mt-6 inline-flex items-center font-semibold text-teal-700">
                  Browse catalog
                  <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>

            <Link href="/cognitive-assistant" className="group block">
              <div className="h-full border border-slate-200 bg-slate-50 p-8 transition-all hover:border-purple-400 hover:shadow-lg">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center bg-purple-600 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-700">Ilmi thotbot</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Ask exam-style questions, work through policy and analytical prompts, and lean on
                  document-grounded answers when context is available.
                </p>
                <span className="mt-6 inline-flex items-center font-semibold text-purple-700">
                  Open Ilmi thotbot
                  <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>

            <Link href="/assignments" className="group block">
              <div className="h-full border border-slate-200 bg-slate-50 p-8 transition-all hover:border-blue-400 hover:shadow-lg">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center bg-blue-600 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700">For instructors</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Create assignments, review submissions, and give structured feedback—so cohorts stay on
                  track through the exam cycle.
                </p>
                <span className="mt-6 inline-flex items-center font-semibold text-blue-700">
                  Assignment tools
                  <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>

            <Link href="/student-assignments" className="group block">
              <div className="h-full border border-slate-200 bg-slate-50 p-8 transition-all hover:border-emerald-400 hover:shadow-lg">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center bg-emerald-600 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700">For learners</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Submit work, track deadlines, and see grades and comments in one flow—after you sign in.
                </p>
                <span className="mt-6 inline-flex items-center font-semibold text-emerald-700">
                  My assignments
                  <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Process — “designed to teach the process” analogue */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 md:py-20">
        <div className="container">
          <h2 className="max-w-3xl text-3xl font-bold text-slate-900 md:text-4xl">
            Designed for depth—not just completion
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Competitive exams reward reasoning, structure, and recall under pressure. Zehn.AI is built so
            you practice the way you will be evaluated: with clear prompts, feedback loops, and tools that
            push you to explain and defend answers—not only skim content.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            <li className="border-l-4 border-teal-600 pl-4">
              <span className="font-semibold text-slate-900">Clear next steps</span>
              <p className="mt-2 text-sm text-slate-600">Pathways and dashboards reduce “what should I do today?”</p>
            </li>
            <li className="border-l-4 border-teal-600 pl-4">
              <span className="font-semibold text-slate-900">Instructor visibility</span>
              <p className="mt-2 text-sm text-slate-600">Programs can run cohorts with assignments and review.</p>
            </li>
            <li className="border-l-4 border-teal-600 pl-4">
              <span className="font-semibold text-slate-900">AI where it helps</span>
              <p className="mt-2 text-sm text-slate-600">Ilmi thotbot supports analysis and practice—not a substitute for your own judgment.</p>
            </li>
          </ul>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="container">
          <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">Built for rigorous prep</h2>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 md:text-4xl">8+</div>
              <div className="mt-2 text-sm text-slate-400">Subject tracks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 md:text-4xl">100+</div>
              <div className="mt-2 text-sm text-slate-400">Video sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 md:text-4xl">AI</div>
              <div className="mt-2 text-sm text-slate-400">Guided study</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 md:text-4xl">24/7</div>
              <div className="mt-2 text-sm text-slate-400">Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Start your prep journey</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Explore pathways and Ilmi thotbot without an account—or register to unlock courses, assignments,
            and your dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center bg-teal-600 px-8 py-4 font-semibold text-white hover:bg-teal-500 sm:w-auto"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center border-2 border-slate-300 px-8 py-4 font-semibold text-slate-800 hover:border-slate-400 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
