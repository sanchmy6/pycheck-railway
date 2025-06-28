import { isUniqueConstraintError, isForeignKeyConstraintError } from "@/app/teacher/utils";

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
});
