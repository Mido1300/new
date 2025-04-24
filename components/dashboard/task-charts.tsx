"use client"

import { useEffect, useRef } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import Chart from "chart.js/auto"
import { formatTime } from "@/lib/utils"

export function TaskCharts() {
  const { tasks, view } = useAppStore()
  const { theme } = useTheme()

  // Add these refs at the beginning of the component
  const chartRef = useRef<HTMLCanvasElement>(null)
  const bubbleChartRef = useRef<HTMLCanvasElement>(null)
  const heatmapChartRef = useRef<HTMLCanvasElement>(null)
  const gaugeChartRef = useRef<HTMLCanvasElement>(null)
  const funnelChartRef = useRef<HTMLCanvasElement>(null)

  const statusChartRef = useRef<HTMLCanvasElement>(null)
  const priorityChartRef = useRef<HTMLCanvasElement>(null)
  const timelineChartRef = useRef<HTMLCanvasElement>(null)
  const categoryChartRef = useRef<HTMLCanvasElement>(null)
  const timeSpentChartRef = useRef<HTMLCanvasElement>(null)
  const progressChartRef = useRef<HTMLCanvasElement>(null)

  const chartInstance = useRef<Chart | null>(null)
  const bubbleChartInstance = useRef<Chart | null>(null)
  const heatmapChartInstance = useRef<Chart | null>(null)
  const gaugeChartInstance = useRef<Chart | null>(null)
  const funnelChartInstance = useRef<Chart | null>(null)

  const statusChartInstance = useRef<Chart | null>(null)
  const priorityChartInstance = useRef<Chart | null>(null)
  const timelineChartInstance = useRef<Chart | null>(null)
  const categoryChartInstance = useRef<Chart | null>(null)
  const timeSpentChartInstance = useRef<Chart | null>(null)
  const progressChartInstance = useRef<Chart | null>(null)

  // Initialize and update charts
  useEffect(() => {
    if (view !== "graph") return

    const textColor = theme === "dark" ? "#e5e7eb" : "#4b5563"
    const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"

    // Status chart
    if (statusChartRef.current) {
      const completed = tasks.filter((t) => t.completed).length
      const pending = tasks.length - completed

      if (statusChartInstance.current) {
        statusChartInstance.current.destroy()
      }

      statusChartInstance.current = new Chart(statusChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Pending"],
          datasets: [
            {
              data: [completed, pending],
              backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(250, 204, 21, 0.8)"],
              borderColor: ["rgba(34, 197, 94, 1)", "rgba(250, 204, 21, 1)"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: textColor,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.raw
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                  const percentage = Math.round(((value as number) / total) * 100)
                  return `${label}: ${value} (${percentage}%)`
                },
              },
            },
          },
        },
      })
    }

    // Priority chart
    if (priorityChartRef.current) {
      const highPriority = tasks.filter((t) => t.priority === "High").length
      const mediumPriority = tasks.filter((t) => t.priority === "Medium").length
      const lowPriority = tasks.filter((t) => t.priority === "Low").length

      if (priorityChartInstance.current) {
        priorityChartInstance.current.destroy()
      }

      priorityChartInstance.current = new Chart(priorityChartRef.current, {
        type: "bar",
        data: {
          labels: ["High", "Medium", "Low"],
          datasets: [
            {
              label: "Tasks",
              data: [highPriority, mediumPriority, lowPriority],
              backgroundColor: ["rgba(239, 68, 68, 0.8)", "rgba(250, 204, 21, 0.8)", "rgba(156, 163, 175, 0.8)"],
              borderColor: ["rgba(239, 68, 68, 1)", "rgba(250, 204, 21, 1)", "rgba(156, 163, 175, 1)"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
            x: {
              ticks: {
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
          },
        },
      })
    }

    // Timeline chart
    if (timelineChartRef.current) {
      // Get date labels for the last 7 days
      const dateLabels = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dateLabels.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
      }

      // Simulate completed tasks over time
      const timelineData = [1, 2, 3, 4, 3, 5, 4]

      if (timelineChartInstance.current) {
        timelineChartInstance.current.destroy()
      }

      timelineChartInstance.current = new Chart(timelineChartRef.current, {
        type: "line",
        data: {
          labels: dateLabels,
          datasets: [
            {
              label: "Completed Tasks",
              data: timelineData,
              borderColor: "rgba(34, 197, 94, 1)",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
            x: {
              ticks: {
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
          },
        },
      })
    }

    // Category chart
    if (categoryChartRef.current) {
      const development = tasks.filter((t) => t.category === "Development").length
      const design = tasks.filter((t) => t.category === "Design").length
      const marketing = tasks.filter((t) => t.category === "Marketing").length
      const research = tasks.filter((t) => t.category === "Research").length

      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy()
      }

      categoryChartInstance.current = new Chart(categoryChartRef.current, {
        type: "polarArea",
        data: {
          labels: ["Development", "Design", "Marketing", "Research"],
          datasets: [
            {
              data: [development, design, marketing, research],
              backgroundColor: [
                "rgba(59, 130, 246, 0.8)",
                "rgba(139, 92, 246, 0.8)",
                "rgba(249, 115, 22, 0.8)",
                "rgba(20, 184, 166, 0.8)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: textColor,
              },
            },
          },
        },
      })
    }

    // Time Spent Chart
    if (timeSpentChartRef.current) {
      // Get top 5 tasks by time spent
      const tasksByTime = [...tasks]
        .filter((t) => t.timer > 0)
        .sort((a, b) => b.timer - a.timer)
        .slice(0, 5)

      if (timeSpentChartInstance.current) {
        timeSpentChartInstance.current.destroy()
      }

      timeSpentChartInstance.current = new Chart(timeSpentChartRef.current, {
        type: "bar",
        data: {
          labels: tasksByTime.map((t) => (t.title.length > 20 ? t.title.substring(0, 20) + "..." : t.title)),
          datasets: [
            {
              label: "Time Spent (hours)",
              data: tasksByTime.map((t) => Math.round((t.timer / 3600000) * 100) / 100), // Convert ms to hours
              backgroundColor: "rgba(99, 102, 241, 0.8)",
              borderColor: "rgba(99, 102, 241, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number
                  return `Time spent: ${value.toFixed(2)} hours (${formatTime(tasksByTime[context.dataIndex].timer)})`
                },
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
            y: {
              ticks: {
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
          },
        },
      })
    }

    // Progress Chart (Tasks completed vs. total over time)
    if (progressChartRef.current) {
      // Generate data for the last 30 days
      const days = 30
      const labels = []
      const completedData = []
      const totalData = []

      const today = new Date()

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(today.getDate() - i)

        // Format date as YYYY-MM-DD for comparison
        const dateString = date.toISOString().split("T")[0]

        // Add formatted date to labels
        labels.push(i % 5 === 0 ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "")

        // Count tasks created before or on this date
        const tasksCreatedByDate = tasks.filter((t) => t.created <= dateString).length
        totalData.push(tasksCreatedByDate)

        // Count tasks completed before or on this date
        const tasksCompletedByDate = tasks.filter((t) => t.completed && t.created <= dateString).length
        completedData.push(tasksCompletedByDate)
      }

      if (progressChartInstance.current) {
        progressChartInstance.current.destroy()
      }

      progressChartInstance.current = new Chart(progressChartRef.current, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Total Tasks",
              data: totalData,
              borderColor: "rgba(99, 102, 241, 1)",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
            {
              label: "Completed Tasks",
              data: completedData,
              borderColor: "rgba(34, 197, 94, 1)",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: textColor,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
            x: {
              ticks: {
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
          },
        },
      })
    }

    // Add a new Radar Chart for skill distribution
    if (chartRef.current) {
      // Create sample data for skills distribution
      const skillsData = {
        labels: ["Planning", "Execution", "Communication", "Problem Solving", "Teamwork", "Technical"],
        datasets: [
          {
            label: "Current Skills",
            data: [85, 70, 90, 80, 75, 65],
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(99, 102, 241, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(99, 102, 241, 1)",
          },
          {
            label: "Target Skills",
            data: [90, 85, 95, 90, 85, 80],
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(34, 197, 94, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(34, 197, 94, 1)",
          },
        ],
      }

      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      chartInstance.current = new Chart(chartRef.current, {
        type: "radar",
        data: skillsData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: {
                color: gridColor,
              },
              grid: {
                color: gridColor,
              },
              pointLabels: {
                color: textColor,
              },
              ticks: {
                color: textColor,
                backdropColor: theme === "dark" ? "#1f2937" : "#ffffff",
              },
            },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: textColor,
              },
            },
          },
        },
      })
    }

    // Add a Bubble Chart for task complexity vs time
    if (bubbleChartRef.current) {
      // Generate bubble chart data based on tasks
      const bubbleData = tasks.map((task) => {
        // Convert date to days from now for a numeric scale instead of time scale
        const dueDate = new Date(task.dueDate)
        const today = new Date()
        const daysDiff = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        return {
          x: daysDiff, // x-axis: days until due (negative means overdue)
          y: task.priority === "High" ? 3 : task.priority === "Medium" ? 2 : 1, // y-axis: priority
          r: (task.timer / 3600000) * 2 + 5, // bubble size based on time spent
          task: task.title,
          dueDate: task.dueDate,
          completed: task.completed,
        }
      })

      if (bubbleChartInstance.current) {
        bubbleChartInstance.current.destroy()
      }

      bubbleChartInstance.current = new Chart(bubbleChartRef.current, {
        type: "bubble",
        data: {
          datasets: [
            {
              label: "Completed Tasks",
              data: bubbleData.filter((d) => tasks.find((t) => t.title === d.task)?.completed),
              backgroundColor: "rgba(34, 197, 94, 0.6)",
              borderColor: "rgba(34, 197, 94, 1)",
              borderWidth: 1,
            },
            {
              label: "Pending Tasks",
              data: bubbleData.filter((d) => !tasks.find((t) => t.title === d.task)?.completed),
              backgroundColor: "rgba(239, 68, 68, 0.6)",
              borderColor: "rgba(239, 68, 68, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "linear",
              position: "bottom",
              ticks: {
                color: textColor,
                callback: (value) => {
                  if (value === 0) return "Today"
                  if (value > 0) return `In ${value} days`
                  return `${Math.abs(value)} days ago`
                },
              },
              grid: {
                color: gridColor,
              },
              title: {
                display: true,
                text: "Due Date",
                color: textColor,
              },
            },
            y: {
              min: 0,
              max: 4,
              ticks: {
                stepSize: 1,
                callback: (value) => {
                  if (value === 1) return "Low"
                  if (value === 2) return "Medium"
                  if (value === 3) return "High"
                  return ""
                },
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
              title: {
                display: true,
                text: "Priority",
                color: textColor,
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const data = context.raw as any
                  const dueDate = tasks.find((t) => t.title === data.task)?.dueDate
                  const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString() : "Unknown"

                  return [
                    `Task: ${data.task}`,
                    `Due: ${formattedDate}`,
                    `Priority: ${data.y === 3 ? "High" : data.y === 2 ? "Medium" : "Low"}`,
                    `Time spent: ${Math.round(((data.r - 5) / 2) * 10) / 10} hours`,
                  ]
                },
              },
            },
            legend: {
              position: "bottom",
              labels: {
                color: textColor,
              },
            },
          },
        },
      })
    }

    // Add a Heatmap-style Calendar Chart
    if (heatmapChartRef.current) {
      // Generate data for the last 90 days
      const days = 90
      const today = new Date()
      const heatmapData = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(today.getDate() - i)
        const dateString = date.toISOString().split("T")[0]

        // Count tasks completed on this date
        const tasksCompletedOnDate = tasks.filter(
          (t) => t.completed && new Date(t.created).toISOString().split("T")[0] === dateString,
        ).length

        heatmapData.push({
          date: dateString,
          value: tasksCompletedOnDate,
        })
      }

      // Group by week and day for heatmap
      const weeks = []
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

      let currentWeek = []
      const currentDate = new Date(heatmapData[0].date)
      const weekStart = new Date(currentDate)
      weekStart.setDate(currentDate.getDate() - currentDate.getDay())

      // Fill in any missing days at the start
      for (let i = 0; i < currentDate.getDay(); i++) {
        currentWeek.push(null)
      }

      heatmapData.forEach((day) => {
        const date = new Date(day.date)

        // If we've moved to a new week
        if (date.getDay() === 0 && currentWeek.length > 0) {
          weeks.push([...currentWeek])
          currentWeek = []
        }

        currentWeek.push(day.value)

        // If we're at the end of the data
        if (day.date === heatmapData[heatmapData.length - 1].date) {
          // Fill in any missing days at the end
          while (currentWeek.length < 7) {
            currentWeek.push(null)
          }
          weeks.push([...currentWeek])
        }
      })

      if (heatmapChartInstance.current) {
        heatmapChartInstance.current.destroy()
      }

      // Create a custom chart for the heatmap
      const ctx = heatmapChartRef.current.getContext("2d")
      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, heatmapChartRef.current.width, heatmapChartRef.current.height)

        // Set up dimensions
        const cellSize = 20
        const padding = 30
        const weekCount = weeks.length

        // Resize canvas
        heatmapChartRef.current.width = padding * 2 + cellSize * 7
        heatmapChartRef.current.height = padding * 2 + cellSize * weekCount

        // Draw title
        ctx.font = "14px Arial"
        ctx.fillStyle = textColor
        ctx.textAlign = "center"
        ctx.fillText("Task Completion Heatmap (Last 90 Days)", heatmapChartRef.current.width / 2, padding / 2)

        // Draw day labels
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        daysOfWeek.forEach((day, i) => {
          ctx.fillText(day, padding + i * cellSize + cellSize / 2, padding - 5)
        })

        // Draw heatmap cells
        weeks.forEach((week, weekIndex) => {
          week.forEach((value, dayIndex) => {
            if (value !== null) {
              // Calculate color based on value
              const intensity = Math.min(value * 50, 255)
              const color =
                theme === "dark" ? `rgba(34, 197, 94, ${intensity / 255})` : `rgba(34, 197, 94, ${intensity / 255})`

              ctx.fillStyle = color
              ctx.fillRect(padding + dayIndex * cellSize, padding + weekIndex * cellSize, cellSize - 1, cellSize - 1)

              // Add text for non-zero values
              if (value > 0) {
                ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
                ctx.font = "8px Arial"
                ctx.textAlign = "center"
                ctx.fillText(
                  value.toString(),
                  padding + dayIndex * cellSize + cellSize / 2,
                  padding + weekIndex * cellSize + cellSize / 2 + 3,
                )
              }
            }
          })
        })

        // Add legend
        const legendX = padding
        const legendY = padding + weekCount * cellSize + 20

        ctx.font = "10px Arial"
        ctx.textAlign = "left"
        ctx.fillStyle = textColor
        ctx.fillText("Tasks Completed:", legendX, legendY)

        const legendItems = [0, 1, 2, 3, "4+"]
        legendItems.forEach((item, i) => {
          const intensity = typeof item === "number" ? Math.min(item * 50, 255) : 255
          const color =
            theme === "dark" ? `rgba(34, 197, 94, ${intensity / 255})` : `rgba(34, 197, 94, ${intensity / 255})`

          ctx.fillStyle = color
          ctx.fillRect(legendX + 100 + i * 40, legendY - 10, 15, 15)

          ctx.fillStyle = textColor
          ctx.textAlign = "center"
          ctx.fillText(item.toString(), legendX + 100 + i * 40 + 7.5, legendY + 15)
        })
      }
    }

    // Add a Gauge Chart for overall productivity
    if (gaugeChartRef.current) {
      // Calculate productivity score
      const totalTasks = tasks.length
      const completedTasks = tasks.filter((t) => t.completed).length
      const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      if (gaugeChartInstance.current) {
        gaugeChartInstance.current.destroy()
      }

      gaugeChartInstance.current = new Chart(gaugeChartRef.current, {
        type: "doughnut",
        data: {
          datasets: [
            {
              data: [productivityScore, 100 - productivityScore],
              backgroundColor: [
                productivityScore < 30
                  ? "rgba(239, 68, 68, 0.8)"
                  : productivityScore < 70
                    ? "rgba(250, 204, 21, 0.8)"
                    : "rgba(34, 197, 94, 0.8)",
                "rgba(229, 231, 235, 0.5)",
              ],
              borderWidth: 0,
              circumference: 180,
              rotation: 270,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "75%",
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
        },
        plugins: [
          {
            id: "gaugeText",
            afterDraw: (chart) => {
              const {
                ctx,
                chartArea: { top, bottom, left, right, width, height },
              } = chart

              ctx.save()

              // Draw score text
              const scoreText = `${productivityScore}%`
              ctx.font = "bold 24px Arial"
              ctx.fillStyle = textColor
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillText(scoreText, width / 2, height - 10)

              // Draw label text
              const labelText = "Productivity"
              ctx.font = "14px Arial"
              ctx.fillStyle = textColor
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillText(labelText, width / 2, height + 20)

              ctx.restore()
            },
          },
        ],
      })
    }

    // Add a Funnel Chart for task progression
    if (funnelChartRef.current) {
      // Calculate task progression stages
      const totalTasks = tasks.length
      const startedTasks = tasks.filter((t) => t.timer > 0).length
      const halfwayTasks = tasks.filter((t) => t.timer > 3600000).length // More than 1 hour
      const completedTasks = tasks.filter((t) => t.completed).length

      const funnelData = [
        { stage: "Created", count: totalTasks },
        { stage: "Started", count: startedTasks },
        { stage: "Significant Progress", count: halfwayTasks },
        { stage: "Completed", count: completedTasks },
      ]

      if (funnelChartInstance.current) {
        funnelChartInstance.current.destroy()
      }

      // Create a custom funnel chart
      const ctx = funnelChartRef.current.getContext("2d")
      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, funnelChartRef.current.width, funnelChartRef.current.height)

        // Set up dimensions
        const width = funnelChartRef.current.width
        const height = funnelChartRef.current.height
        const padding = 40
        const funnelWidth = width - padding * 2
        const funnelHeight = height - padding * 2
        const stageHeight = funnelHeight / funnelData.length

        // Calculate the maximum width for scaling
        const maxCount = Math.max(...funnelData.map((d) => d.count))

        // Draw funnel
        funnelData.forEach((data, index) => {
          const stageWidth = maxCount > 0 ? (data.count / maxCount) * funnelWidth : 0
          const x = (width - stageWidth) / 2
          const y = padding + index * stageHeight

          // Choose color based on stage
          const colors = [
            "rgba(99, 102, 241, 0.8)", // Created
            "rgba(250, 204, 21, 0.8)", // Started
            "rgba(249, 115, 22, 0.8)", // Significant Progress
            "rgba(34, 197, 94, 0.8)", // Completed
          ]

          // Draw trapezoid for funnel effect
          ctx.beginPath()
          if (index === 0) {
            // First stage is a rectangle
            ctx.rect(x, y, stageWidth, stageHeight)
          } else {
            // Calculate previous stage width for trapezoid
            const prevStageWidth = maxCount > 0 ? (funnelData[index - 1].count / maxCount) * funnelWidth : 0
            const prevX = (width - prevStageWidth) / 2

            // Draw trapezoid
            ctx.moveTo(prevX, y)
            ctx.lineTo(prevX + prevStageWidth, y)
            ctx.lineTo(x + stageWidth, y + stageHeight)
            ctx.lineTo(x, y + stageHeight)
            ctx.closePath()
          }

          ctx.fillStyle = colors[index]
          ctx.fill()

          // Add stage label
          ctx.fillStyle = textColor
          ctx.font = "12px Arial"
          ctx.textAlign = "right"
          ctx.fillText(data.stage, x - 10, y + stageHeight / 2 + 4)

          // Add count and percentage
          const percentage = totalTasks > 0 ? Math.round((data.count / totalTasks) * 100) : 0
          ctx.textAlign = "left"
          ctx.fillText(`${data.count} (${percentage}%)`, x + stageWidth + 10, y + stageHeight / 2 + 4)
        })

        // Add title
        ctx.font = "bold 14px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Task Progression Funnel", width / 2, padding / 2)
      }
    }

    // Cleanup on unmount
    return () => {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy()
        statusChartInstance.current = null
      }
      if (priorityChartInstance.current) {
        priorityChartInstance.current.destroy()
        priorityChartInstance.current = null
      }
      if (timelineChartInstance.current) {
        timelineChartInstance.current.destroy()
        timelineChartInstance.current = null
      }
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy()
        categoryChartInstance.current = null
      }
      if (timeSpentChartInstance.current) {
        timeSpentChartInstance.current.destroy()
        timeSpentChartInstance.current = null
      }
      if (progressChartInstance.current) {
        progressChartInstance.current.destroy()
        progressChartInstance.current = null
      }
      // Add cleanup for new chart instances
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
      if (bubbleChartInstance.current) {
        bubbleChartInstance.current.destroy()
        bubbleChartInstance.current = null
      }
      if (heatmapChartInstance.current) {
        heatmapChartInstance.current.destroy()
        heatmapChartInstance.current = null
      }
      if (gaugeChartInstance.current) {
        gaugeChartInstance.current.destroy()
        gaugeChartInstance.current = null
      }
      if (funnelChartInstance.current) {
        funnelChartInstance.current.destroy()
        funnelChartInstance.current = null
      }
    }
  }, [tasks, view, theme])

  if (view !== "graph") return null

  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Task Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas ref={statusChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas ref={priorityChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Completion Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas ref={timelineChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas ref={categoryChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Time Spent on Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas ref={timeSpentChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas ref={progressChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas ref={chartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Complexity vs Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas ref={bubbleChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Completion Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <canvas ref={heatmapChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productivity Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas ref={gaugeChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Progression Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas ref={funnelChartRef}></canvas>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
