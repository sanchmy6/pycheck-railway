import { hashPassword, generateAuthToken, verifyAuthToken } from "@/lib/auth";

describe("auth utils", () => {
    it("hashPassword returns consistent hash", () => {
        const hash1 = hashPassword("password123");
        const hash2 = hashPassword("password123");
        expect(hash1).toBe(hash2);
    });

    it("generateAuthToken returns a 64-character hex string", () => {
        const token = generateAuthToken();
        expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it("verifyAuthToken validates correct token format", () => {
        const token = "a".repeat(64);
        expect(verifyAuthToken(token)).toBe(true);
        expect(verifyAuthToken("short")).toBe(false);
    });
});
