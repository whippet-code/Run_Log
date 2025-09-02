// Data storage with mock data
let runs = JSON.parse(localStorage.getItem("runs") || "[]");

// Add mock data if no runs exist
// if (runs.length === 0) {
//     const mockRuns = generateMockData();
//     runs = mockRuns;
//     localStorage.setItem("runs", JSON.stringify(runs));
// }

// Generate 4 weeks of mock running data
function generateMockData() {
    const mockData = [];
    const runTypes = ["easy", "tempo", "long"];
    const surfaces = ["road", "trail"];
    const today = new Date();

    // Generate runs for the past 28 days
    for (let daysAgo = 27; daysAgo >= 0; daysAgo--) {
        // Skip some days randomly (rest days)
        if (Math.random() > 0.75) continue;

        const runDate = new Date(today);
        runDate.setDate(today.getDate() - daysAgo);
        runDate.setHours(Math.floor(Math.random() * 12) + 6); // Morning runs between 6-18

        // Determine run type based on day pattern
        let runType;
        const dayOfWeek = runDate.getDay();
        if (dayOfWeek === 0) {
            // Sunday - long run
            runType = "long";
        } else if (dayOfWeek === 2 || dayOfWeek === 4) {
            // Tuesday/Thursday - tempo
            runType = Math.random() > 0.5 ? "tempo" : "easy";
        } else {
            runType = "easy";
        }

        // Set distance based on run type
        let distance;
        if (runType === "long") {
            distance = 10 + Math.random() * 6; // 10-16 miles
        } else if (runType === "tempo") {
            distance = 5 + Math.random() * 3; // 5-8 miles
        } else {
            distance = 3 + Math.random() * 4; // 3-7 miles
        }

        // Set pace based on run type
        let paceMinutes, paceSeconds;
        if (runType === "tempo") {
            paceMinutes = 7 + Math.floor(Math.random() * 1);
            paceSeconds = Math.floor(Math.random() * 60);
        } else if (runType === "long") {
            paceMinutes = 8 + Math.floor(Math.random() * 2);
            paceSeconds = Math.floor(Math.random() * 60);
        } else {
            paceMinutes = 8 + Math.floor(Math.random() * 2);
            paceSeconds = Math.floor(Math.random() * 60);
        }

        const pace = `${paceMinutes}:${paceSeconds.toString().padStart(2, "0")}`;

        // Mix surfaces with preference for road
        const surface = Math.random() > 0.3 ? "road" : "trail";

        mockData.push({
            id: Date.now() + Math.random() * 1000,
            date: runDate.toISOString(),
            distance: parseFloat(distance.toFixed(1)),
            pace: pace,
            runType: runType,
            surface: surface,
        });
    }

    return mockData.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Chart instances
let weeklyChart = null;
let surfaceChart = null;
let runTypeChart = null;

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
    updateStats();
    updateRunsTable();
    initCharts();
    updateCharts();
});

// Add run form handler
document.getElementById("runForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const run = {
        id: Date.now(),
        date: new Date().toISOString(),
        distance: parseFloat(document.getElementById("distance").value),
        pace: document.getElementById("pace").value,
        runType: document.getElementById("runType").value,
        surface: document.getElementById("surface").value,
    };

    runs.push(run);
    localStorage.setItem("runs", JSON.stringify(runs));

    // Reset form
    this.reset();

    // Update UI
    updateStats();
    updateRunsTable();
    updateCharts();

    // Show success animation
    showNotification("Run added successfully!");
});

// Update statistics
function updateStats() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    let weekTotal = 0;
    let weekRoad = 0;
    let weekTrail = 0;
    let roadTotal = 0;
    let trailTotal = 0;

    runs.forEach((run) => {
        const runDate = new Date(run.date);

        // This week's totals
        if (runDate >= weekStart) {
            weekTotal += run.distance;
            if (run.surface === "road") {
                weekRoad += run.distance;
            } else {
                weekTrail += run.distance;
            }
        }

        // All-time totals
        if (run.surface === "road") {
            roadTotal += run.distance;
        } else {
            trailTotal += run.distance;
        }
    });

    document.getElementById("weekTotal").textContent = weekTotal.toFixed(1);
    document.getElementById("weekRoad").textContent = weekRoad.toFixed(1);
    document.getElementById("weekTrail").textContent = weekTrail.toFixed(1);
    document.getElementById("roadTotal").textContent = roadTotal.toFixed(1);
    document.getElementById("trailTotal").textContent = trailTotal.toFixed(1);
    document.getElementById("combinedTotal").textContent = (roadTotal + trailTotal).toFixed(1);
}

// Update runs table
function updateRunsTable() {
    const tbody = document.getElementById("runsTable");
    tbody.innerHTML = "";

    // Sort runs by date (newest first)
    const sortedRuns = [...runs].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Show only last 10 runs
    sortedRuns.slice(0, 10).forEach((run) => {
        const row = tbody.insertRow();
        const runDate = new Date(run.date);

        row.innerHTML = `
            <td class="py-2">${runDate.toLocaleDateString()}</td>
            <td class="py-2">${run.distance} mi</td>
            <td class="py-2">${run.pace}</td>
            <td class="py-2">
                <span class="px-2 py-1 rounded text-xs ${
                    run.runType === "easy"
                        ? "bg-green-500/20 text-green-400"
                        : run.runType === "tempo"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                }">${run.runType}</span>
            </td>
            <td class="py-2">
                <span class="px-2 py-1 rounded text-xs ${
                    run.surface === "road"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                }">${run.surface}</span>
            </td>
            <td class="py-2">
                <button onclick="deleteRun(${run.id})" class="text-red-400 hover:text-red-300">
                    Delete
                </button>
            </td>
        `;
    });
}

// Delete run
function deleteRun(id) {
    if (confirm("Are you sure you want to delete this run?")) {
        runs = runs.filter((run) => run.id !== id);
        localStorage.setItem("runs", JSON.stringify(runs));
        updateStats();
        updateRunsTable();
        updateCharts();
        showNotification("Run deleted");
    }
}

// Initialize charts
function initCharts() {
    // Weekly mileage chart
    const weeklyCtx = document.getElementById("weeklyChart").getContext("2d");
    weeklyChart = new Chart(weeklyCtx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Weekly Mileage",
                    data: [],
                    borderColor: "rgb(147, 51, 234)",
                    backgroundColor: "rgba(147, 51, 234, 0.1)",
                    tension: 0.4,
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
                    grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                        color: "rgba(255, 255, 255, 0.7)",
                    },
                },
                x: {
                    grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                        color: "rgba(255, 255, 255, 0.7)",
                    },
                },
            },
        },
    });

    // Surface distribution chart
    const surfaceCtx = document.getElementById("surfaceChart").getContext("2d");
    surfaceChart = new Chart(surfaceCtx, {
        type: "doughnut",
        data: {
            labels: ["Road", "Trail"],
            datasets: [
                {
                    data: [0, 0],
                    backgroundColor: [
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(34, 197, 94, 0.8)",
                    ],
                    borderColor: [
                        "rgb(59, 130, 246)",
                        "rgb(34, 197, 94)",
                    ],
                    borderWidth: 2,
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
                        color: "rgba(255, 255, 255, 0.7)",
                    },
                },
            },
        },
    });

    // Run type distribution chart
    const runTypeCtx = document.getElementById("runTypeChart").getContext("2d");
    runTypeChart = new Chart(runTypeCtx, {
        type: "doughnut",
        data: {
            labels: ["Easy", "Tempo", "Long"],
            datasets: [
                {
                    data: [0, 0, 0],
                    backgroundColor: [
                        "rgba(34, 197, 94, 0.8)",
                        "rgba(234, 179, 8, 0.8)",
                        "rgba(239, 68, 68, 0.8)",
                    ],
                    borderColor: [
                        "rgb(34, 197, 94)",
                        "rgb(234, 179, 8)",
                        "rgb(239, 68, 68)",
                    ],
                    borderWidth: 2,
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
                        color: "rgba(255, 255, 255, 0.7)",
                    },
                },
            },
        },
    });
}

// Update charts
function updateCharts() {
    // Calculate weekly totals for last 8 weeks
    const weeklyData = calculateWeeklyTotals();
    weeklyChart.data.labels = weeklyData.labels;
    weeklyChart.data.datasets[0].data = weeklyData.data;
    weeklyChart.update();

    // Calculate surface distribution
    let roadMiles = 0;
    let trailMiles = 0;
    runs.forEach((run) => {
        if (run.surface === "road") {
            roadMiles += run.distance;
        } else {
            trailMiles += run.distance;
        }
    });

    surfaceChart.data.datasets[0].data = [roadMiles, trailMiles];
    surfaceChart.update();

    // Calculate run type distribution
    let easyMiles = 0;
    let tempoMiles = 0;
    let longMiles = 0;
    runs.forEach((run) => {
        if (run.runType === "easy") {
            easyMiles += run.distance;
        } else if (run.runType === "tempo") {
            tempoMiles += run.distance;
        } else {
            longMiles += run.distance;
        }
    });

    runTypeChart.data.datasets[0].data = [easyMiles, tempoMiles, longMiles];
    runTypeChart.update();
}

// Calculate weekly totals
function calculateWeeklyTotals() {
    const weeks = 8;
    const labels = [];
    const data = [];
    const now = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - i * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 7);

        let weekTotal = 0;
        runs.forEach((run) => {
            const runDate = new Date(run.date);
            if (runDate >= weekStart && runDate <= weekEnd) {
                weekTotal += run.distance;
            }
        });

        labels.push(`Week ${weeks - i}`);
        data.push(weekTotal);
    }

    return { labels, data };
}

// Show notification
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
        notification.style.transform = "translateX(100%)";
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

