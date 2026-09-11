import qr from "qrcode";

export async function generateQR(text:string): Promise<Buffer> {
    const buffer = await qr.toBuffer(text, {
        type: "png",
        errorCorrectionLevel: "M",
        margin: 2,
    });
    return buffer;
}

export async function generateQRBase64(text:string): Promise <string> {
    const base64 = await qr.toString(text, {
        errorCorrectionLevel: "M",
        margin: 2,
    });
    return base64;
}