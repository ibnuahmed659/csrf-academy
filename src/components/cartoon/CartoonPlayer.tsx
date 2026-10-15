import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import type { Cartoon } from '@/lib/cartoon/types'
import { useProgress } from '@/lib/progress'
import { decodeEntities } from '@/lib/cartoon/text'
import { CartoonStage } from './CartoonStage'

type NextUp = { id: string; title: string; series: string; number: number }

export function CartoonPlayer({ cartoon, next }: { cartoon: Cartoon; next?: NextUp }) {
  const navigate = useNavigate()
  const { cartoonPosition, setCartoonPosition, isCartoonWatched, markCartoonWatched } = useProgress()

  const total = cartoon.scenes.length
  const [index, setIndex] = useState(() => {
    const saved = cartoonPosition(cartoon.id)
    if (!isCartoonWatched(cartoon.id) && saved > 0 && saved < total) return saved
    return 0
  })
  const [playing, setPlaying] = useState(true)
  const [theater, setTheater] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [finished, setFinished] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const scene = cartoon.scenes[index]
  const atEnd = index === total - 1
  const nextId = next?.id

  useEffect(() => {
    setCartoonPosition(cartoon.id, index)
  }, [cartoon.id, index, setCartoonPosition])

  useEffect(() => {
    if (finished) markCartoonWatched(cartoon.id)
  }, [finished, cartoon.id, markCartoonWatched])

  useEffect(() => {
    if (!playing) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
      return
    }

    let cancelled = false
    let timer = 0
    const finishOrAdvance = () => {
      if (cancelled) return
      cancelled = true
      if (atEnd) {
        setFinished(true)
        setPlaying(false)
        if (nextId) setCountdown(6)
      } else {
        setIndex((i) => Math.min(i + 1, total - 1))
      }
    }

    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
    if (voiceOn && supported) {
      const synth = window.speechSynthesis
      const cleaned = scene.caption
        .replace(/<[^>]+>/g, ' ')
        .replace(/["'`]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      const utter = new SpeechSynthesisUtterance(cleaned)
      const voices = synth.getVoices()
      const english =
        voices.find((v) => v.lang === 'en-US') ??
        voices.find((v) => v.lang === 'en-GB') ??
        voices.find((v) => v.lang.toLowerCase().startsWith('en'))
      if (english) utter.voice = english
      utter.lang = english?.lang ?? 'en-US'
      utter.rate = 0.98
      utter.pitch = 1
      synth.cancel()
      utter.onend = () => {
        timer = window.setTimeout(finishOrAdvance, 650)
      }
      synth.speak(utter)
      const estimate = Math.min(40000, 1500 + cleaned.length * 80)
      const safety = window.setTimeout(finishOrAdvance, Math.max(scene.duration, estimate) + 5000)
      return () => {
        cancelled = true
        window.clearTimeout(timer)
        window.clearTimeout(safety)
        synth.cancel()
      }
    }

    timer = window.setTimeout(finishOrAdvance, scene.duration)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [playing, index, total, voiceOn, scene, atEnd, nextId])

  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      if (nextId) navigate(`/cartoons/${nextId}`)
      return
    }
    const t = window.setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000)
    return () => window.clearTimeout(t)
  }, [countdown, nextId, navigate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTheater(false)
      } else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      } else if (e.key === 'ArrowRight') {
        setIndex((i) => Math.min(i + 1, total - 1))
      } else if (e.key === 'ArrowLeft') {
        setIndex((i) => Math.max(i - 1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [total])

  useEffect(() => {
    if (!theater) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [theater])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Warm the voice list (Chrome loads voices asynchronously).
      window.speechSynthesis.getVoices()
    }
  }, [])

  function restart() {
    setIndex(0)
    setFinished(false)
    setCountdown(null)
    setPlaying(true)
  }

  const controls = (
    <div className="cc-controls">
      <button className="cc-btn" onClick={() => setIndex((i) => Math.max(i - 1, 0))} aria-label="Previous scene">
        <ChevronLeft className="size-5" />
      </button>
      <button
        className="cc-btn cc-btn-primary"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
      </button>
      <button className="cc-btn" onClick={() => setIndex((i) => Math.min(i + 1, total - 1))} aria-label="Next scene">
        <ChevronRight className="size-5" />
      </button>
      <button className="cc-btn" onClick={restart} aria-label="Restart">
        <RotateCcw className="size-5" />
      </button>
      <button
        className={`cc-btn ${voiceOn ? 'cc-btn-active' : ''}`}
        onClick={() => setVoiceOn((v) => !v)}
        aria-label={voiceOn ? 'Turn off narration' : 'Read subtitles aloud'}
        aria-pressed={voiceOn}
        title={voiceOn ? 'Narration on' : 'Read subtitles aloud'}
      >
        {voiceOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
      </button>
      {!theater && (
        <button className="cc-btn" onClick={() => setTheater(true)} aria-label="Fullscreen">
          <Maximize2 className="size-5" />
        </button>
      )}
    </div>
  )

  const upNext = finished ? (
    <div className="cc-upnext">
      {next ? (
        <>
          <div className="min-w-0">
            <p className="cc-upnext-kicker">Up next · {next.series} · Episode {next.number}</p>
            <p className="cc-upnext-title">{next.title}</p>
          </div>
          <div className="cc-upnext-actions">
            <button className="cc-btn cc-btn-primary" onClick={() => navigate(`/cartoons/${next.id}`)}>
              Play now
            </button>
            {countdown !== null && (
              <button className="cc-btn" onClick={() => setCountdown(null)}>
                Autoplay in {countdown}s · cancel
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="min-w-0">
            <p className="cc-upnext-title">Series complete</p>
            <p className="text-[13px] text-muted">You reached the end of {cartoon.series}. Replay any scene above.</p>
          </div>
          <button className="cc-btn" onClick={restart} aria-label="Watch again">
            <RotateCcw className="size-5" />
          </button>
        </>
      )}
    </div>
  ) : null

  return (
    <>
      <div className="cc-player">
        <div className="cc-player-bar">
          <div>
            <p className="cc-kicker">{scene.kicker ?? `Scene ${index + 1} / ${total}`}</p>
            <h3 className="cc-scene-title">{scene.title}</h3>
          </div>
          {controls}
        </div>

        <div className="cc-viewport">
          <CartoonStage scene={scene} />
          <div className="cc-caption">
            <p className="cc-caption-text">{decodeEntities(scene.caption)}</p>
          </div>
        </div>

        {finished && upNext}

        <div className="cc-timeline">
          {cartoon.scenes.map((s, i) => (
            <button
              key={s.id}
              className={`cc-chip ${i === index ? 'cc-chip-active' : ''}`}
              onClick={() => {
                setIndex(i)
                setFinished(false)
                setCountdown(null)
                setPlaying(false)
              }}
              aria-label={`Scene ${i + 1}: ${s.title}`}
            >
              <span className="cc-chip-num">{i + 1}</span>
              <span className="cc-chip-label">{s.title}</span>
            </button>
          ))}
        </div>

        <p className="cc-endhint">
          Scene {index + 1} of {total} · {isCartoonWatched(cartoon.id) ? 'Watched' : 'In progress'}
          {next ? ` · Next: ${next.title}` : ''}
        </p>
      </div>

      {theater &&
        createPortal(
          <div className="cc-theater" role="dialog" aria-modal="true" aria-label={`${cartoon.title} — theater`}>
            <div className="cc-theater-bar">
              <div>
                <p className="cc-kicker">{scene.kicker ?? `Scene ${index + 1} / ${total}`}</p>
                <h3 className="cc-theater-title">{scene.title}</h3>
              </div>
              <div className="cc-controls">
                {controls}
                <button className="cc-btn" onClick={() => setTheater(false)} aria-label="Close fullscreen">
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="cc-theater-stage">
              <div className="cc-viewport">
                <CartoonStage scene={scene} />
                <div className="cc-caption">
                  <p className="cc-caption-text">{decodeEntities(scene.caption)}</p>
                </div>
              </div>
            </div>

            {finished && upNext}

            <div className="cc-theater-foot">
              <button
                className="cc-btn"
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                aria-label="Previous scene"
              >
                <ChevronLeft className="size-5" />
              </button>
              <p className="cc-theater-hint">Space to pause · arrow keys to step · Esc to close</p>
              <button
                className="cc-btn"
                onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
                aria-label="Next scene"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
