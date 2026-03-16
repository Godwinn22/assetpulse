import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
    Legend,
} from "chart.js";

// Filler is required for the gradient area below the line
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
    Legend,
);

export default function AssignmentTrend({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No assignment trend data available
            </div>
        );
    }
    const chartData = {
        labels: data.map((d) => d.month),
        datasets: [
            {
                label: "Assignments",
                data: data.map((d) => d.count),

                // ── Line styling ──
                borderColor: "#3b82f6",
                borderWidth: 2.5,

                // ── Smooth curve like YouTube ──
                tension: 0.4,

                // ── Gradient fill below line ──
                // We use a function that receives the chart context
                // and creates a gradient from blue to transparent
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return "transparent";

                    // Create gradient from top to bottom
                    const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom,
                    );
                    gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)"); // blue at top
                    gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)"); // transparent at bottom
                    return gradient;
                },
                fill: true, // fill area below line with gradient

                // ── Dots ──
                pointRadius: 0, // hidden by default
                pointHoverRadius: 5, // visible on hover
                pointBackgroundColor: "#3b82f6",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointHoverBackgroundColor: "#3b82f6",
                pointHoverBorderColor: "#ffffff",
                pointHoverBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            // intersect false means tooltip shows
            // when hovering anywhere on that x position
            // not just directly on the dot
            intersect: false,
            mode: "index",
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#1e293b",
                titleColor: "#94a3b8",
                bodyColor: "#ffffff",
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.y;
                        return ` ${value} assignment${value !== 1 ? "s" : ""}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: "#94a3b8",
                    font: { size: 12 },
                },
                border: { display: false },
            },
            y: {
                grid: { color: "#f1f5f9" },
                ticks: {
                    color: "#94a3b8",
                    font: { size: 12 },
                    stepSize: 1,
                    precision: 0,
                },
                border: { display: false },
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ height: 300 }}>
            <Line data={chartData} options={options} />
        </div>
    );
}
