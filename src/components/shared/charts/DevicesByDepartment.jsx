import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

export default function DevicesByDepartment({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No department data available. Assign devices to staff with
                departments to see this chart.
            </div>
        );
    }

    const chartData = {
        labels: data.map((d) => d.name),
        datasets: [
            {
                label: "Devices",
                data: data.map((d) => d.value),
                // backgroundColor: "#6366f1",
                // hoverBackgroundColor: "#4f46e5",
                backgroundColor: [
                    "#3b82f6", // blue
                    "#8b5cf6", // purple
                    "#10b981", // green
                    "#f59e0b", // amber
                    "#ef4444", // red
                    "#06b6d4", // cyan
                    "#f97316", // orange
                ].slice(0, data.length),
                hoverBackgroundColor: [
                    "#2563eb",
                    "#7c3aed",
                    "#059669",
                    "#d97706",
                    "#dc2626",
                    "#0891b2",
                    "#ea580c",
                ].slice(0, data.length),
                borderRadius: 6,
                borderSkipped: false,
                maxBarThickness: 40,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y", // horizontal bars — better for dept names
        plugins: {
            legend: { display: false },
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
                    stepSize: 1,
                    precision: 0,
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
        // Dynamic height — more departments = taller chart
        <div style={{ height: Math.max(data.length * 50, 200) }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}
