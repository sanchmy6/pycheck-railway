jest.mock("@/lib/auth", () => ({
    verifyAuthToken: jest.fn(),
}));

import {
    isUniqueConstraintError,
    isForeignKeyConstraintError,
    checkExistingAuth,
    notifyAuthStateChanged,
} from "@/app/teacher/utils";
import { verifyAuthToken } from "@/lib/auth";

describe("error type checks", () => {
    it("detects unique constraint error", () => {
        const err = { code: "P2002" };
        expect(isUniqueConstraintError(err)).toBe(true);
    });

    it("detects foreign key constraint error", () => {
        const err = { code: "P2003" };
        expect(isForeignKeyConstraintError(err)).toBe(true);
    });

    it("returns false for unrelated errors", () => {
        const err = { code: "OTHER" };
        expect(isUniqueConstraintError(err)).toBe(false);
        expect(isForeignKeyConstraintError(err)).toBe(false);
    });

    describe("checkExistingAuth", () => {
        const verifyMock = verifyAuthToken as jest.Mock;

        beforeEach(() => {
            sessionStorage.clear();
            verifyMock.mockReset();
        });

        it("returns invalid if no token", () => {
            const result = checkExistingAuth();
            expect(result).toEqual({ token: null, isValid: false });
        });

        it("returns invalid and removes token if token is invalid", () => {
            sessionStorage.setItem("teacher_token", "bad-token");
            verifyMock.mockReturnValue(false);

            const result = checkExistingAuth();
            expect(result).toEqual({ token: null, isValid: false });
            expect(sessionStorage.getItem("teacher_token")).toBeNull();
        });

        it("returns valid token if token is valid", () => {
            sessionStorage.setItem("teacher_token", "good-token");
            verifyMock.mockReturnValue(true);

            const result = checkExistingAuth();
            expect(result).toEqual({ token: "good-token", isValid: true });
        });

        it("handles unexpected error and cleans up", () => {
            sessionStorage.setItem("teacher_token", "x");
            // simulate error
            verifyMock.mockImplementation(() => {
                throw new Error("broken");
            });

            const result = checkExistingAuth();
            expect(result).toEqual({ token: null, isValid: false });
            expect(sessionStorage.getItem("teacher_token")).toBeNull();
        });
    });

    describe("notifyAuthStateChanged", () => {
        it("dispatches authStateChanged event", () => {
            const spy = jest.spyOn(window, "dispatchEvent");
            notifyAuthStateChanged();
            expect(spy).toHaveBeenCalledWith(expect.any(CustomEvent));
            spy.mockRestore();
        });
    });
});
