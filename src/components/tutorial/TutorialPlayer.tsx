import {
  Captions,
  CaptionsOff,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Tutorial } from '@/lib/tutorial/types'
import { formatTime, sceneAt, tutorialDuration } from '@/lib/tutorial/types'
import { SceneVisual } from './visuals'
import { useClock, useHotkey, useReducedMotion, useScrollLock } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { Segmented } from '@/components/ui/Segmented'

const SPEEDS = ['0.5', '1', '1.5', '2'] as const

export function TutorialPlayer({
  tutorial,
  onComplete,
}: {
  tutorial: Tutorial
  onComplete?: () => void
}) {
  const duration = useMemo(() => tutorialDuration(tutorial), [tutorial])
  const reduced = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [captions, setCaptions] = useState(true)
  const [voiceOn, setVoiceOn] = useState(true)
  const [theater, setTheater] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useScrollLock(theater)

  const handleDone = () => {
    setPlaying(false)
    onComplete?.()
  }

  const { t, setT } = useClock({
    duration,
    running: playing,
    speed,
    onDone: handleDone,
  })

  const { index, scene, progress } = sceneAt(tutorial, t)
  const atEnd = t >= duration - 0.01
  const caption = scene.caption

  // Pick a natural English voice as soon as the browser exposes its list.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    const pick = () => {
      const voices = synth.getVoices()
      voiceRef.current =
        voices.find((v) => v.lang === 'en-US') ??
        voices.find((v) => v.lang === 'en-GB') ??
        voices.find((v) => v.lang.toLowerCase().startsWith('en')) ??
        null
    }
    pick()
    synth.addEventListener('voiceschanged', pick)
    return () => synth.removeEventListener('voiceschanged', pick)
  }, [])

  // Narrate the active scene while playing. Cancels on pause, seek and unmount.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    if (!voiceOn || !playing || !started) {
      synth.cancel()
      return
    }
    const clean = caption.replace(/\s+/g, ' ').trim()
    if (!clean) return
    const utterance = new SpeechSynthesisUtterance(clean)
    if (voiceRef.current) utterance.voice = voiceRef.current
    utterance.lang = voiceRef.current?.lang ?? 'en-US'
    utterance.rate = speed
    utterance.pitch = 1
    synth.cancel()
    synth.speak(utterance)
    return () => synth.cancel()
  }, [index, caption, voiceOn, playing, started, speed])

  const play = () => {
    if (atEnd) setT(0)
    setStarted(true)
    setPlaying(true)
  }
  const pause = () => setPlaying(false)
  const toggle = () => (playing ? pause() : play())
  const restart = () => {
    setT(0)
    setStarted(true)
    setPlaying(true)
  }

  const seekScene = (dir: 1 | -1) => {
    const target = Math.min(tutorial.scenes.length - 1, Math.max(0, index + dir))
    setT(sceneStart(tutorial, target))
    setStarted(true)
  }

  useHotkey(' ', (e) => {
    e.preventDefault()
    toggle()
  })
  useHotkey('ArrowRight', () => setT((v) => Math.min(duration, v + 3)))
  useHotkey('ArrowLeft', () => setT((v) => Math.max(0, v - 3)))
  useHotkey('Escape', () => {
    if (theater) setTheater(false)
  })

  useEffect(() => {
    document.title = `${tutorial.title} — CSRF Forge`
    return () => {
      document.title = 'CSRF Forge — Master Cross-Site Request Forgery'
    }
  }, [tutorial.title])

  return (
    <div
      className={cn(
        'bg-[#0a0b10]',
        theater
          ? 'fixed inset-0 z-50 flex flex-col'
          : 'overflow-hidden rounded-2xl border border-line shadow-card',
      )}
    >
      {/* Stage */}
      <div
        className={cn(
          'stage-grid relative w-full overflow-hidden',
          theater ? 'min-h-0 flex-1' : 'aspect-video',
        )}
      >
        <div className={cn('h-full w-full', scene.id)} key={scene.id}>
          <div className="scene-in h-full w-full" style={{ animationDuration: reduced ? '0ms' : undefined }}>
            <SceneVisual visual={scene.visual} progress={progress} />
          </div>
        </div>

        <div className="stage-vignette pointer-events-none absolute inset-0" />

        {/* Collapse */}
        {theater && (
          <button
            type="button"
            onClick={() => setTheater(false)}
            aria-label="Exit fullscreen"
            title="Exit fullscreen (Esc)"
            className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-md border border-white/15 bg-black/50 text-slate-200 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        )}

        {/* Scene label */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-sm">
            Scene {index + 1} / {tutorial.scenes.length}
          </span>
          <span className="hidden rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur-sm sm:inline">
            {scene.title}
          </span>
        </div>

        {/* Caption */}
        {captions && started && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
            <p className="max-w-2xl rounded-lg bg-black/70 px-4 py-2 text-center text-[13px] leading-snug text-slate-100 backdrop-blur-sm sm:text-sm">
              {scene.caption}
            </p>
          </div>
        )}

        {/* Poster / big play */}
        {!started && (
          <button
            type="button"
            onClick={play}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-[2px]"
          >
            <span className="relative grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#ff5b2e] to-[#ffb020] text-[#170b06] shadow-2xl transition-transform duration-300 group-hover:scale-105">
              <Play className="size-8 translate-x-0.5 fill-current" />
              <span className="pulse-ring absolute inset-0 rounded-full border-2 border-orange-400/60" />
            </span>
            <span className="text-sm font-medium text-slate-200">
              Play · {formatTime(duration)}
            </span>
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="px-4 pt-3">
        <SceneTimeline
          tutorial={tutorial}
          elapsed={t}
          onSeek={(v) => {
            setStarted(true)
            setT(v)
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-1">
          <ControlButton
            label={voiceOn ? 'Mute narration' : 'Unmute narration'}
            onClick={() => setVoiceOn((v) => !v)}
            active={voiceOn}
          >
            {voiceOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </ControlButton>
          <ControlButton label="Previous scene" onClick={() => seekScene(-1)} disabled={index === 0}>
            <SkipBack className="size-4" />
          </ControlButton>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause' : 'Play'}
            className="grid size-11 place-items-center rounded-full bg-brand text-brand-fg shadow-soft transition hover:bg-brand-hover"
          >
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 translate-x-0.5 fill-current" />}
          </button>
          <ControlButton
            label="Next scene"
            onClick={() => seekScene(1)}
            disabled={index === tutorial.scenes.length - 1}
          >
            <SkipForward className="size-4" />
          </ControlButton>
          <ControlButton label="Restart" onClick={restart}>
            <RotateCcw className="size-4" />
          </ControlButton>
        </div>

        <span className="font-mono text-[12px] text-slate-400">
          {formatTime(t)} <span className="text-slate-600">/ {formatTime(duration)}</span>
        </span>

        <div className="ml-auto flex items-center gap-2">
          <ControlButton
            label={captions ? 'Hide captions' : 'Show captions'}
            onClick={() => setCaptions((c) => !c)}
            active={captions}
          >
            {captions ? <Captions className="size-4" /> : <CaptionsOff className="size-4" />}
          </ControlButton>
          <Segmented
            aria-label="Playback speed"
            size="sm"
            value={String(speed)}
            onChange={(v) => setSpeed(Number(v))}
            options={SPEEDS.map((s) => ({ value: s, label: `${s}×` }))}
          />
          <ControlButton
            label={theater ? 'Exit fullscreen' : 'Fullscreen'}
            onClick={() => setTheater((v) => !v)}
            active={theater}
          >
            {theater ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </ControlButton>
        </div>
      </div>
    </div>
  )
}

function ControlButton({
  children,
  label,
  onClick,
  disabled,
  active,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid size-9 place-items-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent',
        active && 'bg-white/10 text-white',
      )}
    >
      {children}
    </button>
  )
}

function sceneStart(tutorial: Tutorial, index: number) {
  return tutorial.scenes
    .slice(0, index)
    .reduce((sum, s) => sum + s.duration, 0)
}

function SceneTimeline({
  tutorial,
  elapsed,
  onSeek,
}: {
  tutorial: Tutorial
  elapsed: number
  onSeek: (value: number) => void
}) {
  const duration = tutorialDuration(tutorial)
  const pct = duration ? (elapsed / duration) * 100 : 0

  const marks = tutorial.scenes.map((s, i) => ({
    title: s.title,
    pct: (sceneStart(tutorial, i) / duration) * 100,
  }))

  return (
    <div className="relative">
      <input
        type="range"
        min={0}
        max={duration}
        step={0.1}
        value={elapsed}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Seek"
        className="peer h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 outline-none [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-[#ff5b2e] to-[#ffb020]"
        style={{ width: `${pct}%` }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2">
        {marks.map((m, i) =>
          i === 0 ? null : (
            <span
              key={i}
              title={m.title}
              className="absolute top-0 h-2 w-0.5 -translate-x-1/2 bg-black/40"
              style={{ left: `${m.pct}%` }}
            />
          ),
        )}
      </div>
    </div>
  )
}
