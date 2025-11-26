// electron/preload.cjs
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke("ping"),
  saveBudgetData: (data) => ipcRenderer.invoke("save-budget-data", data),
  loadBudgetData: () => ipcRenderer.invoke("load-budget-data"),
});
