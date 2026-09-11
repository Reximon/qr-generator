import { Router, Request, Response } from "express";
import { generateQR, generateQRBase64 } from "../utils/qrGenerator";

const router = Router();
router.get("/", async (req: Request, res: Response) => {
    const text = req.query.text as string;
    if(!text) {
        return res.status(400).json({error: "Falta el parámetro'text'"});
    }
    try {
        const buffer = await generateQR(text);
        res.setHeader("Content-Type", "png");
        res.send(buffer);
    } catch (err) {
        res.status(500).json({error: "Error generando QR"});
    }
});

router.post("/", async (req: Request, res: Response) =>{
    const { text } = req.body;
    if(!text) {
        return res.status(400).json({error: "Falta ' text' en el body"});
    }
    try {
        const base64 = await generateQRBase64(text);
        res.json({ qr: base64 });
    }catch (err) {
        res.status(500).json({ error: "Error generando QR" });
    }
});

export default router;