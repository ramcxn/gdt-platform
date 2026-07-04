'use client'

import { useEffect, useRef } from 'react'
import { Chart, type ChartConfiguration } from 'chart.js/auto'

function getThemeColors() {
  if (typeof window === 'undefined') {
    return { text: '#94a3b8', grid: 'rgba(148,163,184,0.15)' }
  }
  const styles = getComputedStyle(document.documentElement)
  return {
    text: styles.getPropertyValue('--text-tertiary').trim() || '#94a3b8',
    grid: styles.getPropertyValue('--border-subtle').trim() || 'rgba(148,163,184,0.15)',
  }
}

export function MovimientosDoughnut({
  entradas,
  salidas,
  danos,
}: {
  entradas: number
  salidas: number
  danos: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const { text } = getThemeColors()

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Entradas', 'Salidas', 'Con daños'],
        datasets: [
          {
            data: [entradas, salidas, danos],
            backgroundColor: ['#3B82F6', '#8B5CF6', '#FB7185'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { bodyColor: text, titleColor: text },
        },
      },
    }

    chartRef.current = new Chart(canvasRef.current, config)
    return () => chartRef.current?.destroy()
  }, [entradas, salidas, danos])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Movimientos: ${entradas} entradas, ${salidas} salidas, ${danos} con daños`}
    >
      {entradas} entradas, {salidas} salidas, {danos} con daños.
    </canvas>
  )
}

export function InspeccionesMensualBar({ data }: { data: { mes: string; total: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const { text, grid } = getThemeColors()

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: data.map(d => d.mes),
        datasets: [
          {
            label: 'Inspecciones',
            data: data.map(d => d.total),
            backgroundColor: '#3B82F6',
            borderRadius: 4,
            maxBarThickness: 24,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: text, autoSkip: false } },
          y: { grid: { color: grid }, ticks: { color: text, precision: 0 } },
        },
        plugins: { legend: { display: false } },
      },
    }

    chartRef.current = new Chart(canvasRef.current, config)
    return () => chartRef.current?.destroy()
  }, [data])

  const total = data.reduce((a, d) => a + d.total, 0)

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Inspecciones por mes, últimos 12 meses, total ${total}`}
    >
      Serie mensual de inspecciones, total {total} en los últimos 12 meses.
    </canvas>
  )
}
