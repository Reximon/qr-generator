import express from "express";
import cors from "cors";
import qrRouter from "./routes/qr"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/qr", qrRouter);

app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

export default app;