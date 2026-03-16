// src/components/charts/AssignedVsAvailable.jsx
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function DeviceStatusOverview({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No data available
            </div>
        );
    }

    const chartData = {
        labels: data.map((d) => d.name),
        datasets: [
            {
                label: "Devices",
                data: data.map((d) => d.value),
                // Different color for each bar
                // Assigned = blue, Available = green
                backgroundColor: [
                    "#3b82f6", // blue     → assigned
                    "#10b981", // green    → available
                    "#f59e0b", // amber    → under repair
                    "#94a3b8", // gray     → retired
                ],
                borderRadius: 6,
                borderSkipped: false,
                maxBarThickness: 80,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.y;
                        return ` ${value} device${value !== 1 ? "s" : ""}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: "#374151",
                    font: { size: 13, weight: "600" },
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
            <Bar data={chartData} options={options} />
        </div>
    );
}
