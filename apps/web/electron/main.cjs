// electron/main.cjs
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const xlsx = require("xlsx");

// Disable GPU to avoid crashes (as you saw earlier)
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-gpu-compositing");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("no-sandbox");
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disk-cache-size", "0");

// Store files in a dedicated folder under the home directory
const userDataPath = path.join(app.getPath("home"), ".budget-app");
app.setPath("userData", userDataPath);

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL("http://localhost:5173");
    // win.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "..", "dist", "index.html");
    win.loadFile(indexPath);
  }
}

// Simple ping handler (optional)
ipcMain.handle("ping", async () => {
  return "pong from main process";
});

// Save: JSON + Excel
ipcMain.handle("save-budget-data", async (_event, data) => {
  try {
    console.log("[main] save-budget-data called, items:", data.length);

    if (!Array.isArray(data)) {
      throw new Error("Expected data to be an array");
    }

    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    // 1) Save JSON
    const jsonPath = path.join(userDataPath, "budget-data.json");
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    // 2) Create Workbook
    const workbook = xlsx.utils.book_new();

    // Group by month (prefer date -> YYYY-MM, fallback to t.month)
    const byMonth = {};

    for (const t of data) {
      const date = t.date || "";
      let monthKey = "Unknown";

      if (date && typeof date === "string" && date.length >= 7) {
        // e.g. 2025-11-03 -> 2025-11
        monthKey = date.slice(0, 7);
      } else if (t.month) {
        monthKey = t.month;
      }

      if (!byMonth[monthKey]) byMonth[monthKey] = [];

      byMonth[monthKey].push({
        Date: t.date,
        Month: monthKey, // burada ayı normalize ediyoruz
        Type: t.type,
        Item: t.item,
        Category: t.category ?? "",
        Fixed: t.isFixed ? "Yes" : "No",
        Amount: t.amount,
      });
    }

    // 3) Add monthly sheets
    const sortedMonths = Object.keys(byMonth).sort(); // chronological

    console.log("[main] months detected for sheets:", sortedMonths);

    sortedMonths.forEach((monthKey) => {
      const sheetData = byMonth[monthKey];
      const worksheet = xlsx.utils.json_to_sheet(sheetData);
      xlsx.utils.book_append_sheet(workbook, worksheet, monthKey);
    });

    // (Optional) Add full table as summary sheet
    const allSheet = xlsx.utils.json_to_sheet(
      data.map((t) => ({
        Date: t.date,
        Month:
          t.date && typeof t.date === "string" && t.date.length >= 7
            ? t.date.slice(0, 7)
            : t.month ?? "",
        Type: t.type,
        Item: t.item,
        Category: t.category ?? "",
        Fixed: t.isFixed ? "Yes" : "No",
        Amount: t.amount,
      }))
    );
    xlsx.utils.book_append_sheet(workbook, allSheet, "All-Transactions");

    // 4) Save Excel
    const excelPath = path.join(userDataPath, "budget-data.xlsx");
    xlsx.writeFile(workbook, excelPath);

    console.log("[main] saved monthly Excel:", excelPath);

    return { ok: true, jsonPath, excelPath };
  } catch (error) {
    console.error("Failed to save budget data:", error);
    return { ok: false, error: String(error) };
  }
});

// Load: only JSON (Excel is for viewing)
// Load: only JSON (Excel is for viewing)
ipcMain.handle("load-budget-data", async () => {
  try {
    const jsonPath = path.join(userDataPath, "budget-data.json");

    // If file does not exist yet, return empty
    if (!fs.existsSync(jsonPath)) {
      console.log("[main] load-budget-data: no file yet");
      return { ok: true, data: null };
    }

    const content = fs.readFileSync(jsonPath, "utf-8");
    const parsed = JSON.parse(content);

    console.log(
      "[main] load-budget-data: loaded items:",
      Array.isArray(parsed) ? parsed.length : "not-array"
    );
    console.log("[main] JSON path:", jsonPath);

    return { ok: true, data: parsed };
  } catch (error) {
    console.error("Failed to load budget data:", error);
    return { ok: false, error: String(error) };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
