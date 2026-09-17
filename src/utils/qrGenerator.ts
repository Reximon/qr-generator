import qr from "qrcode";

export async function generateQR(text:string, type:string = "text"): Promise<Buffer> {
    const buffer = await qr.toBuffer(text, {
        type: "png",
        errorCorrectionLevel: "H",
        margin: 2,
    });
    return buffer;
}

export async function generateQRBase64(text:string, type:string = "text"): Promise <string> {
    const base64 = await qr.toString(text, {
        errorCorrectionLevel: "H",
        margin: 2,
    });
    return base64;
}

function escapeWiFi(value: string): string {
    return value.replace(/([\\;:,"])/g, "\\$1");
}

export function formatWiFiQR(ssid:string, password:string, encryption:string): string {
    const enc = encryption === "WEP" ? "WEP" : encryption === "nop" ? "nop" : "WPA";
    const ssidE = escapeWiFi(ssid);
    if (enc === "nop") {
        return `WIFI:T:nop;S:${ssidE};;`;
    }
    return `WIFI:T:${enc};S:${ssidE};P:${escapeWiFi(password)};;`;
}
