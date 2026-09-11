import { generateQR, generateQRBase64 } from "../src/utils/qrGenerator";
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