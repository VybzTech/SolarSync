import { useEffect, useRef } from 'react'
import { forceCenter, forceManyBody, forceSimulation, type Simulation } from 'd3-force'
import { cn } from '@/lib/cn'
import { useTheme } from '@/providers/ThemeProvider'

interface Node {
  x: number
  y: number
  vx?: number
  vy?: number
  r: number
}

interface ParticleFieldProps {
  className?: string
  /** Node count. Halved automatically below 768px. */
  density?: number
  /** 0-1. Overall opacity of the drawn field. */
  intensity?: number
}

/**
 * Animated constellation rendered to canvas and driven by a d3-force
 * simulation. Canvas rather than SVG because the link pass is O(n^2) and
 * would thrash the DOM at this node count.
 *
 * Three guards keep it from being a battery tax:
 *  - honours prefers-reduced-motion by drawing a single static frame
 *  - pauses entirely when the tab is hidden
 *  - halves density on small viewports
 */
export function ParticleField({
  className,
  density = 42,
  intensity = 1,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const context = canvas.getContext('2d')
    if (!context) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isDark = theme === 'dark'

    const dot = isDark ? 'rgba(111, 195, 149,' : 'rgba(0, 104, 55,'
    const link = isDark ? 'rgba(148, 163, 184,' : 'rgba(11, 18, 32,'
    const accent = isDark ? 'rgba(252, 203, 112,' : 'rgba(232, 162, 43,'

    const LINK_DISTANCE = 130

    let width = 0
    let height = 0
    let nodes: Node[] = []
    const sim: { current: Simulation<Node, undefined> | null } = { current: null }
    let frame = 0
    let running = true

    function build() {
      const rect = parent!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(rect.width, 1)
      height = Math.max(rect.height, 1)

      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      context!.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.round(width < 768 ? density * 0.5 : density)
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1 + Math.random() * 2,
      }))

      sim.current?.stop()
      sim.current = forceSimulation<Node>(nodes)
        .force('charge', forceManyBody().strength(-14))
        .force('center', forceCenter(width / 2, height / 2).strength(0.008))
        .alphaDecay(0)
        .alphaTarget(0.045)
        .stop()
    }

    function draw() {
      context!.clearRect(0, 0, width, height)

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.hypot(dx, dy)
          if (distance > LINK_DISTANCE) continue

          const alpha = (1 - distance / LINK_DISTANCE) * 0.16 * intensity
          context!.strokeStyle = `${link}${alpha})`
          context!.lineWidth = 1
          context!.beginPath()
          context!.moveTo(nodes[i].x, nodes[i].y)
          context!.lineTo(nodes[j].x, nodes[j].y)
          context!.stroke()
        }
      }

      nodes.forEach((node, index) => {
        const colour = index % 7 === 0 ? accent : dot
        context!.fillStyle = `${colour}${0.5 * intensity})`
        context!.beginPath()
        context!.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        context!.fill()
      })
    }

    function tick() {
      if (!running) return
      sim.current?.tick()

      for (const node of nodes) {
        if (node.x < 0) node.x = width
        else if (node.x > width) node.x = 0
        if (node.y < 0) node.y = height
        else if (node.y > height) node.y = 0
      }

      draw()
      frame = requestAnimationFrame(tick)
    }

    build()
    if (reduceMotion) {
      sim.current?.tick(60)
      draw()
    } else {
      tick()
    }

    const observer = new ResizeObserver(() => {
      build()
      if (reduceMotion) {
        sim.current?.tick(60)
        draw()
      }
    })
    observer.observe(parent)

    const onVisibility = () => {
      if (reduceMotion) return
      if (document.hidden) {
        running = false
        cancelAnimationFrame(frame)
      } else if (!running) {
        running = true
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      sim.current?.stop()
    }
  }, [theme, density, intensity])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  )
}
