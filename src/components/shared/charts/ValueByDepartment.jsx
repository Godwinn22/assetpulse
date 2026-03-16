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

const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#f97316",
];
// Format currency for axis labels
// We use shortened format here e.g. ₦200K
// because full numbers are too long for axis
const fmtShort = (n) => {
    if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `₦${(n / 1000).toFixed(0)}K`;
    return `₦${n}`;
};

// Full format for tooltip
const fmtFull = (n) =>
    "₦" +
    Number(n).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function ValueByDepartment({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No value data available. Add purchase prices to devices to see
                this chart.
            </div>
        );
    }

    const chartData = {
        labels: data.map((d) => d.name),
        datasets: [
            {
                label: "Total Value",
                data: data.map((d) => d.value),
                backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
                borderRadius: 6,
                borderSkipped: false,
                maxBarThickness: 40,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y", // horizontal — better for dept names
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        // Show full currency in tooltip
                        return ` ${fmtFull(context.parsed.x)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { color: "#f1f5f9" },
                ticks: {
                    color: "#94a3b8",
                    font: { size: 11 },
                    // Use shortened format on axis
                    // Full numbers would overlap ❌
                    callback: (value) => fmtShort(value),
                },
                border: { display: false },
                beginAtZero: true,
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
        <div style={{ height: Math.max(data.length * 50, 200) }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}
