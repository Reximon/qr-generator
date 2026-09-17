import { generateQR, generateQRBase64, formatWiFiQR } from "../src/utils/qrGenerator";
import request from "supertest";
import app from "../src/index";

describe("generateQR", () => {
  it("debe retornar un Buffer válido", async () => {
    const buffer = await generateQR("hola mundo");
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});

describe("generateQRBase64", () => {
  it("debe retornar un string no vacío", async () => {
    const base64 = await generateQRBase64("hola mundo");
    expect(typeof base64).toBe("string");
    expect(base64.length).toBeGreaterThan(0);
  });
});

describe("formatWiFiQR", () => {
  it("genera formato WPA con password", () => {
    expect(formatWiFiQR("MiRed", "pass123", "WPA")).toBe("WIFI:T:WPA;S:MiRed;P:pass123;;");
  });
  it("genera formato WEP con password", () => {
    expect(formatWiFiQR("MiRed", "pass123", "WEP")).toBe("WIFI:T:WEP;S:MiRed;P:pass123;;");
  });
  it("sin cifrado omite el campo P", () => {
    expect(formatWiFiQR("MiRed", "", "nop")).toBe("WIFI:T:nop;S:MiRed;;");
  });
  it("escapa caracteres especiales", () => {
    expect(formatWiFiQR("Mi;Red", "pa:ss,1", "WPA")).toBe('WIFI:T:WPA;S:Mi\\;Red;P:pa\\:ss\\,1;;');
  });
});