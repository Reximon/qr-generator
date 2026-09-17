import { Router, Request, Response } from "express";
import { generateQR, generateQRBase64, formatWiFiQR } from "../utils/qrGenerator";

const router = Router();
router.get("/", async (req: Request, res: Response) => {
    const type = (req.query.type as string) || "text";
    const text = req.query.text as string;
    const ssid = req.query.ssid as string | undefined;
    const password = req.query.password as string | undefined;
    const encryption = (req.query.encryption as string) || "WPA";
    if(!text && type === "text") {
        return res.status(400).json({error: "Falta el parametro text"});
    }
    if(!ssid && type === "wifi") {
        return res.status(400).json({error: "Falta el parametro ssid"});
    }
    try {
        let qrData: string;
        if (type === "wifi") {
            qrData = formatWiFiQR(ssid!, password || "", encryption);
        } else {
            qrData = text;
        }
        const buffer = await generateQR(qrData, type);
        res.setHeader("Content-Type", "image/png");
        res.send(buffer);
    } catch (err) {
        res.status(500).json({error: "Error generando QR"});
    }
});

router.post("/", async (req: Request, res: Response) =>{
    const { text, type } = req.body;
    if(!text) {
        return res.status(400).json({error: "Falta text en el body"});
    }
    try {
        const base64 = await generateQRBase64(text, type);
        res.json({ qr: base64 });
    }catch (err) {
        res.status(500).json({ error: "Error generando QR" });
    }
});

export default router;
