// src/components/charts/DeviceTypeChart.jsx
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

// Register required Chart.js components for bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#f97316",
];

export default function DeviceTypeChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No device data available
            </div>
        );
    }

    const chartData = {
        labels: data.map((d) => d.name),
        datasets: [
            {
                label: "Devices",
                data: data.map((d) => d.value),
                backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
                borderRadius: 6,
                // borderRadius rounds the top of each bar
                // makes it look modern and clean
                borderSkipped: false,
                maxBarThickness: 50,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        // indexAxis 'y' makes it horizontal
        // much better for reading device type names
        plugins: {
            legend: { display: false },
            // legend hidden because bar colors already
            // differentiate the types visually
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.x;
                        return ` ${value} device${value !== 1 ? "s" : ""}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { color: "#f1f5f9" },
                ticks: {
                    color: "#94a3b8",
                    font: { size: 12 },
                    // Only show whole numbers
                    stepSize: 1,
                },
                border: { display: false },
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: "#374151",
                    font: { size: 12 },
                },
                border: { display: false },
            },
        },
    };

    return (
        <div style={{ height: Math.max(data.length * 60, 200) }}>
            {/* Dynamic height based on number of device types */}
            {/* More types = taller chart, minimum 200px */}
            <Bar data={chartData} options={options} />
        </div>
    );
}
