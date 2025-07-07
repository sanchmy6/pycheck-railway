const ORIGINAL_ENV = process.env;

describe("auth utils", () => {
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    it("hashPassword returns consistent hash", () => {
        const { hashPassword } = require("@/lib/auth");
        const hash1 = hashPassword("password123");
        const hash2 = hashPassword("password123");
        expect(hash1).toBe(hash2);
    });

    it("generateAuthToken returns a 64-character hex string", () => {
        const { generateAuthToken } = require("@/lib/auth");
        const token = generateAuthToken();
        expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it("verifyAuthToken validates correct token format", () => {
        const { verifyAuthToken } = require("@/lib/auth");
        const token = "a".repeat(64);
        expect(verifyAuthToken(token)).toBe(true);
        expect(verifyAuthToken("short")).toBe(false);
        expect(verifyAuthToken("G".repeat(64))).toBe(false);
    });

    describe("verifyTeacherPassword", () => {

        it("returns false when password does not match TEACHER_KEY", () => {
            jest.resetModules();

            process.env.TEACHER_KEY = "mockedhash";

            jest.mock("@/lib/auth", () => {
                const actual = jest.requireActual("@/lib/auth");
                return {
                    ...actual,
                    hashPassword: jest.fn(() => "wronghash"),
                };
            });

            const { verifyTeacherPassword } = require("@/lib/auth");

            expect(verifyTeacherPassword("wrong")).toBe(false);
        });

        it("returns false and logs error when TEACHER_KEY is not set", () => {
            jest.resetModules();

            delete process.env.TEACHER_KEY;

            jest.mock("@/lib/auth", () => {
                const actual = jest.requireActual("@/lib/auth");
                return {
                    ...actual,
                    hashPassword: jest.fn(() => "anything"),
                };
            });

            const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            const { verifyTeacherPassword } = require("@/lib/auth");

            expect(verifyTeacherPassword("anything")).toBe(false);
            expect(errorSpy).toHaveBeenCalledWith("TEACHER_KEY environment variable not set");

            errorSpy.mockRestore();
        });
    });
});
