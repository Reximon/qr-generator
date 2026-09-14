import express from "express";
import cors from "cors";
import qrRouter from "./routes/qr";

const app = express();
const PORT = process.env.PORT || 3000;

const tracking: Map<string, { url: string; visits: number; createdAt: Date }> = new Map();

function generateCode(): string {
    return Math.random().toString(36).substring(2, 8);
}

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/qr", qrRouter);

app.get("/t/:code", (req, res) => {
    const { code } = req.params;
    const entry = tracking.get(code);
    if (!entry) {
        return res.status(404).json({error: "QR no encontrado"});
    }
    entry.visits++;
    res.redirect(entry.url);
});

app.post("/api/track", (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({error: "Falta url"});
    }
    const code = generateCode();
    tracking.set(code, { url, visits: 0, createdAt: new Date() });
    res.json({ code, trackingUrl: `${req.protocol}://${req.get("host")}/t/${code}` });
});

app.get("/api/stats", (_req, res) => {
    const stats = Array.from(tracking.entries()).map(([code, data]) => ({
        code,
        visits: data.visits,
        createdAt: data.createdAt,
        url: data.url
    }));
    res.json({ total: stats.length, qrCodes: stats });
});

app.get("/stats", (_req, res) => {
    res.sendFile("stats.html", { root: "public" });
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

export default app;
