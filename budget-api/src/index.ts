// src/index.ts
import express from "express";
import cors from "cors";
import type { Transaction } from "./types";
import {
  readTransactions,
  writeTransactions,
  getTransactionById,
} from "./storage";
import XLSX from "xlsx";
import multer from "multer";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS (allow all origins for now)
app.use(cors());

app.use(express.json());

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
});

app.post("/import/excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const mode = (req.query.mode as string) || "replace";

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });

    const imported = rows.map((raw) => {
      return {
        id: raw.id ?? Date.now(),
        date: String(raw.date ?? "").slice(0, 10),
        month: String(raw.month ?? "").slice(0, 7),
        type: raw.type === "Income" ? "Income" : "Expense",
        item: String(raw.item ?? ""),
        category:
          raw.category === null ||
          raw.category === undefined ||
          raw.category === ""
            ? undefined
            : String(raw.category),
        isFixed: Boolean(raw.isFixed),
        amount: Number(raw.amount ?? 0),
        planId: raw.planId,
      } as any;
    });

    if (mode === "replace") {
      await writeTransactions(imported);
    } else {
      const existing = await readTransactions();
      const byId = new Map<string, any>();
      for (const t of existing) {
        byId.set(String(t.id), t);
      }
      for (const t of imported) {
        byId.set(String(t.id), t);
      }
      await writeTransactions(Array.from(byId.values()));
    }

    res.json({ ok: true, count: imported.length, mode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to import Excel" });
  }
});

app.get("/export/excel", async (_req, res) => {
  try {
    const transactions = await readTransactions();

    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="transactions.xlsx"'
    );

    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export Excel" });
  }
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// GET /transactions
app.get("/transactions", async (_req, res) => {
  try {
    const transactions = await readTransactions();
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read transactions" });
  }
});

// GET /transactions/:id
app.get("/transactions/:id", async (req, res) => {
  try {
    const tx = await getTransactionById(req.params.id);
    if (!tx) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read transaction" });
  }
});

// POST /transactions
app.post("/transactions", async (req, res) => {
  try {
    const body = req.body as Partial<Transaction>;

    if (!body.item || typeof body.amount !== "number") {
      return res
        .status(400)
        .json({ error: "item and amount are required" });
    }

    const all = await readTransactions();

    const newTx: Transaction = {
      id: (body.id as any) ?? Date.now(),
      date: body.date ?? new Date().toISOString().slice(0, 10),
      month:
        body.month ??
        (body.date
          ? body.date.slice(0, 7)
          : new Date().toISOString().slice(0, 7)),
      type: body.type ?? "Expense",
      item: body.item,
      category: body.category,
      amount: body.amount,
      isFixed: body.isFixed ?? false,
      planId: body.planId,
    };

    all.push(newTx);
    await writeTransactions(all);
    res.status(201).json(newTx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// PUT /transactions/:id
app.put("/transactions/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body as Partial<Transaction>;
    const all = await readTransactions();
    const index = all.findIndex((t) => String(t.id) === id);

    if (index === -1) {
      return res.status(404).json({ error: "Not found" });
    }

    const existing = all[index];

    const updated: Transaction = {
      ...existing,
      ...body,
      id: existing.id,
      month:
        body.month ??
        (body.date
          ? body.date.slice(0, 7)
          : existing.month),
    };

    all[index] = updated;
    await writeTransactions(all);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// DELETE /transactions/:id
app.delete("/transactions/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const all = await readTransactions();
    const next = all.filter((t) => String(t.id) !== id);
    if (next.length === all.length) {
      return res.status(404).json({ error: "Not found" });
    }
    await writeTransactions(next);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

app.listen(PORT, () => {
  console.log(`Budget API running on http://localhost:${PORT}`);
});
