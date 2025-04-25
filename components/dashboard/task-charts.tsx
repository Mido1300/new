"use client"

import { useEffect, useRef } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import Chart, { type TooltipItem } from "chart.js/auto" // Import TooltipItem type
import { formatTime } from "@/lib/utils"
import { type Task } from "@/types"

// Interfaces remain the same...
interface HeatmapData {
  date: string;
  value: number;
}

interface MonthLabel {
  month: string;
  date: string;
}

interface LegendItem {
  label: string;
  value: number;
}

export function TaskCharts() {
  const { tasks, view } = useAppStore()
  const { theme } = useTheme()

  // Refs remain the same...
  const bubbleChartRef = useRef<HTMLCanvasElement>(null)
  const gaugeChartRef = useRef<HTMLCanvasElement>(null)
  const statusChartRef = useRef<HTMLCanvasElement>(null)
  const priorityChartRef = useRef<HTMLCanvasElement>(null)
  const timelineChartRef = useRef<HTMLCanvasElement>(null)
  const categoryChartRef = useRef<HTMLCanvasElement>(null)
  const timeSpentChartRef = useRef<HTMLCanvasElement>(null)
  const progressChartRef = useRef<HTMLCanvasElement>(null)

  const bubbleChartInstance = useRef<Chart | null>(null)
  const gaugeChartInstance = useRef<Chart | null>(null)
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

    // Status chart (no changes needed here)
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
                label: (context: TooltipItem<"doughnut">) => { // Added explicit type for context
                  const label = context.label || ""
                  const value = context.raw as number // Assuming raw is number
                  // Ensure context.dataset.data exists and is an array before reducing
                  const total = Array.isArray(context.dataset.data)
                    ? context.dataset.data.reduce((a: number, b: number) => a + (b || 0), 0)
                    : 0;
                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                  return `${label}: ${value} (${percentage}%)`
                },
              },
            },
          },
        },
      })
    }

    // Priority chart (no changes needed here)
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

    // Timeline chart (no changes needed here)
    if (timelineChartRef.current) {
      const dateLabels = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dateLabels.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
      }
      // More realistic data simulation based on task completion dates
      const timelineData = dateLabels.map(label => {
          const date = new Date(label + ', ' + new Date().getFullYear()); // Attempt to parse date correctly
          const dateString = date.toISOString().split("T")[0];
          return tasks.filter(t => t.completed && t.created <= dateString).length; // Accumulate completed tasks up to that day
      });
      // This simulation might need adjustment based on how you track completion *time* vs creation time

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

    // Category chart (no changes needed here)
    if (categoryChartRef.current) {
        const categories = [...new Set(tasks.map(t => t.category || "Uncategorized"))]; // Get unique categories
        const categoryData = categories.map(category => tasks.filter(t => (t.category || "Uncategorized") === category).length);
        const categoryColors = [ // Example colors, add more if needed
            "rgba(59, 130, 246, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(20, 184, 166, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(34, 197, 94, 0.8)",
        ];

      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy()
      }

      categoryChartInstance.current = new Chart(categoryChartRef.current, {
        type: "polarArea",
        data: {
          labels: categories,
          datasets: [
            {
              data: categoryData,
              backgroundColor: categories.map((_, index) => categoryColors[index % categoryColors.length]), // Cycle through colors
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
           scales: { // Added scales config for polarArea for potential customization
              r: {
                  ticks: {
                      color: textColor,
                      backdropColor: 'transparent', // Make ticks background transparent
                      precision: 0,
                  },
                  grid: {
                      color: gridColor,
                  },
                  pointLabels: {
                      color: textColor, // Color for labels around the chart
                      font: {
                          size: 12
                      }
                  }
              }
          }
        },
      })
    }

    // --- Time Spent Chart (FIX APPLIED HERE) ---
    if (timeSpentChartRef.current) {
      // Get top 5 tasks by time spent (ensure tasks have timer > 0)
      const tasksByTime = [...tasks]
        .filter((t): t is Task & { timer: number } => typeof t.timer === 'number' && t.timer > 0) // Type guard for timer
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
              // Ensure timer is defined before division
              data: tasksByTime.map((t) => Math.round(((t.timer || 0) / 3600000) * 100) / 100), // Convert ms to hours, default to 0 if undefined
              backgroundColor: "rgba(99, 102, 241, 0.8)",
              borderColor: "rgba(99, 102, 241, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y", // Keep bars horizontal
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                // --- FIX START ---
                label: (context: TooltipItem<"bar">) => { // Added explicit type for context
                  const value = context.raw as number;
                  // Safely get the task corresponding to the hovered bar using the index
                  const task = tasksByTime[context.dataIndex];

                  // Check if the task exists (satisfies TypeScript and handles edge cases)
                  if (!task || typeof task.timer === 'undefined') {
                    // Fallback label if task or timer is missing
                    return `Time spent: ${value.toFixed(2)} hours (Task data unavailable)`;
                  }

                  // If task and timer exist, format the label normally
                  return `Time spent: ${value.toFixed(2)} hours (${formatTime(task.timer)})`;
                },
                // --- FIX END ---
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
               title: { // Add title to x-axis
                  display: true,
                  text: 'Time Spent (hours)',
                  color: textColor
              }
            },
            y: {
              ticks: {
                color: textColor,
              },
              grid: {
                color: gridColor, // Only show vertical grid lines if needed
                drawOnChartArea: false // Often better for bar charts
              },
            },
          },
        },
      })
    }

    // Progress Chart (Tasks completed vs. total over time) - (Potential improvements added)
    if (progressChartRef.current) {
      const days = 30;
      const labels = [];
      const completedData = [];
      const totalData = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

      // Pre-filter tasks for efficiency
      const relevantTasks = tasks.filter(t => t.created); // Ensure created date exists

      for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD format

          // Label only every 5 days for clarity
          labels.push(i % 5 === 0 ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

          // Filter tasks created *on or before* this date
          const tasksUpToDate = relevantTasks.filter(t => t.created && t.created <= dateString);
          totalData.push(tasksUpToDate.length);

          // Filter tasks completed *on or before* this date from the subset
          const completedTasksUpToDate = tasksUpToDate.filter(t => t.completed).length; // Assuming 'completed' implies completed by its 'created' date or later
          completedData.push(completedTasksUpToDate);
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
              label: "Total Tasks Created", // Clarified label
              data: totalData,
              borderColor: "rgba(99, 102, 241, 1)",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderWidth: 2,
              tension: 0.3,
              fill: true,
               pointRadius: 1, // Smaller points
               pointHoverRadius: 4,
            },
            {
              label: "Completed Tasks",
              data: completedData,
              borderColor: "rgba(34, 197, 94, 1)",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointRadius: 1, // Smaller points
              pointHoverRadius: 4,
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
                 maxRotation: 0, // Prevent label rotation if possible
                 autoSkip: true, // Allow Chart.js to skip labels if too crowded
                 maxTicksLimit: days / 5 + 1 // Show roughly the number of explicit labels
              },
              grid: {
                color: gridColor,
              },
            },
          },
        },
      })
    }

     // Bubble Chart (Potential improvements added)
     if (bubbleChartRef.current) {
        // Generate bubble chart data based on tasks
        const bubbleData = tasks.map((task) => {
            let daysDiff = 0;
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0,0,0,0); // Normalize today
                dueDate.setHours(0,0,0,0); // Normalize due date
                 // Only calculate diff if dueDate is valid
                if (!isNaN(dueDate.getTime())) {
                    daysDiff = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                } else {
                   daysDiff = 0; // Or handle invalid date appropriately, e.g., place at 0
                }
            } else {
                daysDiff = 0; // Default for tasks without a due date
            }


            // Calculate bubble size based on timer (handle potential undefined timer)
            const timeInHours = (task.timer || 0) / 3600000;
            const bubbleSize = Math.max(5, timeInHours * 2 + 5); // Ensure minimum size 5

            return {
                x: daysDiff, // x-axis: days until due (negative means overdue)
                y: task.priority === "High" ? 3 : task.priority === "Medium" ? 2 : 1, // y-axis: priority
                r: bubbleSize, // bubble size based on time spent
                // Store original task data for tooltip
                originalTask: task
            };
        }).filter(d => d.originalTask); // Ensure we have task data

        // Separate data for completed and pending tasks based on original task object
        const completedBubbleData = bubbleData.filter(d => d.originalTask.completed);
        const pendingBubbleData = bubbleData.filter(d => !d.originalTask.completed);

      if (bubbleChartInstance.current) {
        bubbleChartInstance.current.destroy()
      }

      bubbleChartInstance.current = new Chart(bubbleChartRef.current, {
        type: "bubble",
        data: {
          datasets: [
            {
              label: "Completed Tasks",
              data: completedBubbleData,
              backgroundColor: "rgba(34, 197, 94, 0.6)",
              borderColor: "rgba(34, 197, 94, 1)",
              borderWidth: 1,
            },
            {
              label: "Pending Tasks",
              data: pendingBubbleData,
              backgroundColor: "rgba(239, 68, 68, 0.6)", // Use a different color for pending, e.g., warning/red
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
                 // Provide context type for safety
                callback: (value: number | string, index: number, ticks: any) => {
                    const numValue = typeof value === 'number' ? value : parseFloat(value);
                    if (isNaN(numValue)) return ""; // Handle non-numeric values
                    if (numValue === 0) return "Today";
                    if (numValue > 0) return `In ${numValue} days`;
                    return `${Math.abs(numValue)} days ago`;
                }
              },
              grid: {
                color: gridColor,
              },
              title: {
                display: true,
                text: "Due Date Relative to Today", // More descriptive title
                color: textColor,
              },
            },
            y: {
              min: 0,
              max: 4, // Keep scale appropriate for 1, 2, 3
              ticks: {
                stepSize: 1,
                 // Provide context type for safety
                callback: (value: number | string, index: number, ticks: any) => {
                   const numValue = typeof value === 'number' ? value : parseFloat(value);
                   if (numValue === 1) return "Low";
                   if (numValue === 2) return "Medium";
                   if (numValue === 3) return "High";
                   return ""; // Hide 0 and 4 labels
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
                 // Provide context type for safety
                label: (context: TooltipItem<"bubble">) => {
                    // Access the original task data stored in the bubble data point
                   const dataPoint = context.raw as any; // Use 'any' or define a BubbleDataPoint type
                   const task = dataPoint.originalTask as Task; // Cast back to Task type

                   if (!task) return "Task details unavailable";

                   const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A";
                   const timeHours = (task.timer || 0) / 3600000;

                    return [
                        `Task: ${task.title}`,
                        `Due: ${formattedDate}`,
                        `Priority: ${task.priority || 'N/A'}`, // Use original priority string
                        `Time spent: ${timeHours.toFixed(1)} hours`,
                        `Status: ${task.completed ? 'Completed' : 'Pending'}`
                    ];
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

    // Gauge Chart (no changes needed here, but added text alignment fix)
    if (gaugeChartRef.current) {
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
                theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.8)', // Adjusted background color
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
        plugins: [ // Custom plugin for text
          {
            id: "gaugeText",
            afterDraw: (chart) => {
              const { ctx, chartArea } = chart;
              if (!chartArea) return; // Ensure chartArea is defined

              const { width, height } = chartArea;
              const centerX = chartArea.left + width / 2;
               // Adjust Y position to be relative to the bottom of the *arc*, not the full chart height
              const centerY = chartArea.top + height; // Center text vertically at the bottom of the arc

              ctx.save();

              // Draw score text
              const scoreText = `${productivityScore}%`;
              ctx.font = "bold 24px Arial"; // Adjust font as needed
              ctx.fillStyle = textColor;
              ctx.textAlign = "center";
              ctx.textBaseline = "bottom"; // Align bottom of text to centerY
              // Position slightly above the bottom edge of the arc area
              ctx.fillText(scoreText, centerX, centerY - 10);


              // Draw label text
              const labelText = "Productivity";
              ctx.font = "14px Arial"; // Adjust font as needed
              ctx.fillStyle = textColor;
              ctx.textAlign = "center";
              ctx.textBaseline = "top"; // Align top of text below the score
              // Position below the score text
               ctx.fillText(labelText, centerX, centerY + 5); // Adjust vertical spacing as needed


              ctx.restore();
            },
          },
        ],
      })
    }


    // Cleanup function remains the same
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
      if (bubbleChartInstance.current) {
          bubbleChartInstance.current.destroy()
          bubbleChartInstance.current = null
      }
       if (gaugeChartInstance.current) {
          gaugeChartInstance.current.destroy()
          gaugeChartInstance.current = null
      }
    }
  }, [tasks, view, theme]) // Dependencies remain the same

  // JSX remains the same
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
                <div className="h-64 relative"> {/* Added relative positioning for canvas */}
                  <canvas ref={statusChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <canvas ref={priorityChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Completion Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <canvas ref={timelineChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <canvas ref={categoryChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 5 Tasks by Time Spent</CardTitle> {/* Updated title */}
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <canvas ref={timeSpentChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <canvas ref={progressChartRef}></canvas>
                </div>
              </CardContent>
            </Card>

             <Card>
               <CardHeader>
                 <CardTitle className="text-lg">Task Overview (Due Date vs Priority)</CardTitle> {/* Updated title */}
               </CardHeader>
               <CardContent>
                 <div className="h-64 relative">
                   <canvas ref={bubbleChartRef}></canvas>
                 </div>
               </CardContent>
             </Card>

             <Card>
               <CardHeader>
                 <CardTitle className="text-lg">Productivity Score</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-64 relative flex justify-center items-center"> {/* Centering for gauge */}
                   <canvas ref={gaugeChartRef} style={{maxWidth: '80%'}}></canvas> {/* Limit gauge size */}
                 </div>
               </CardContent>
             </Card>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}