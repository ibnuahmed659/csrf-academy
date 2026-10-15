import { Check, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import type { CartoonQuiz as Quiz } from '@/lib/cartoon/types'
import { cn } from '@/lib/utils'
import { useProgress } from '@/lib/progress'

export function CartoonQuiz({ id, quiz }: { id: string; quiz: Quiz }) {
  const { isQuizPassed, markQuizPassed } = useProgress()
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const passed = isQuizPassed(id)

  const questionCount = quiz.questions.length
  const answered = Object.keys(answers).length
  const correctCount = quiz.questions.filter((q, i) => answers[i] === q.answer).length
  const allCorrect = correctCount === questionCount

  function choose(questionIndex: number, optionIndex: number) {
    if (submitted) return
    setAnswers((a) => ({ ...a, [questionIndex]: optionIndex }))
  }

  function submit() {
    setSubmitted(true)
    const score = quiz.questions.filter((q, i) => answers[i] === q.answer).length
    if (score === questionCount) markQuizPassed(id)
  }

  function retry() {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Check your understanding</h2>
          <p className="text-sm text-muted">Answer {questionCount} quick questions about this episode.</p>
        </div>
        {passed && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
            <Check className="size-3.5" /> Passed
          </span>
        )}
      </div>

      <ol className="mt-5 grid gap-5">
        {quiz.questions.map((q, qi) => (
          <li key={q.q}>
            <p className="text-sm font-semibold">
              <span className="mr-2 text-faint">{qi + 1}.</span>
              {q.q}
            </p>
            <div className="mt-2 grid gap-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi
                const isCorrect = q.answer === oi
                const state = submitted
                  ? isCorrect
                    ? 'correct'
                    : chosen
                      ? 'wrong'
                      : 'dim'
                  : chosen
                    ? 'chosen'
                    : 'idle'
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => choose(qi, oi)}
                    disabled={submitted}
                    aria-pressed={chosen}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors',
                      state === 'idle' && 'border-line hover:border-line-strong hover:bg-surface-2',
                      state === 'chosen' && 'border-brand bg-brand-soft text-brand',
                      state === 'correct' && 'border-success bg-success-soft text-success',
                      state === 'wrong' && 'border-danger bg-danger-soft text-danger',
                      state === 'dim' && 'border-line opacity-60',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-5 shrink-0 place-items-center rounded-full border text-[11px] font-bold',
                        state === 'chosen' && 'border-brand',
                        state === 'correct' && 'border-success',
                        state === 'wrong' && 'border-danger',
                        state === 'idle' && 'border-line',
                        state === 'dim' && 'border-line',
                      )}
                    >
                      {submitted && isCorrect ? <Check className="size-3.5" /> : String.fromCharCode(65 + oi)}
                    </span>
                    <span>{opt}</span>
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={answered < questionCount}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-fg shadow-soft transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit answers
          </button>
        ) : (
          <>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-1 text-sm font-semibold',
              allCorrect ? 'text-success' : 'text-muted',
            )}
          >
            {allCorrect ? 'Perfect score!' : `You got ${correctCount} of ${questionCount} right.`}
          </span>
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
          >
            <RotateCcw className="size-4" /> Try again
          </button>
        </>
      )}
    </div>
    </section>
  )
}
