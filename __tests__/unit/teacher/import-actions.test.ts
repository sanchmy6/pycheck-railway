jest.mock("@/lib/auth");
jest.mock("@/lib/db/db-helpers");
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("csv-parse/sync", () => ({ parse: jest.fn() }));

import { importProblems } from "@/app/teacher/import-actions";
import * as authLib from "@/lib/auth";
import { parse } from "csv-parse/sync";
import * as db from '@/lib/db/db-helpers';
const mockedDb = jest.mocked(db);

describe("importProblems", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GOOGLE_SHEET_ID = "test-sheet-id";
    });

    it("returns error if auth token is invalid", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
        const result = await importProblems("bad-token");
        expect(result).toEqual({ success: false, error: "Invalid authentication" });
    });

    it("returns error if GOOGLE_SHEET_ID is missing", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
        delete process.env.GOOGLE_SHEET_ID;
        const result = await importProblems("token");
        expect(result).toEqual({ success: false, error: "Google Sheet ID not configured" });
    });

    it("returns error if fetch fails with non-ok status", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403 });

        const result = await importProblems("token");
        expect(result).toEqual({
            success: false,
            error: "Failed to fetch Google Sheet (Status: 403). Make sure it's publicly accessible.",
        });
    });

    it("returns error if CSV parsing fails", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
        global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("bad csv") });
        (parse as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid CSV");
        });

        const result = await importProblems("token");
        expect(result).toEqual({ success: false, error: "Failed to parse CSV: Invalid CSV" });
    });

    it("returns error if CSV has fewer than 2 rows", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
        global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("header only") });
        (parse as jest.Mock).mockReturnValue([["name", "description"]]);

        const result = await importProblems("token");
        expect(result).toEqual({ success: false, error: "CSV file appears to be empty or only has headers" });
    });

    it("returns error if required header is missing", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
        global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("header + data") });
        (parse as jest.Mock).mockReturnValue([
            ["name", "description", "codeSnippet"],
            ["prob1", "desc", "code"]
        ]);

        const result = await importProblems("token");
        expect(result).toEqual({ success: false, error: "Missing required column: courseName" });
    });

    it("creates new course, category and problem (happy path)", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);

        const headers = [
            "name", "description", "courseName", "lectureName",
            "codeSnippet", "correctLines", "hint", "reasons"
        ];

        const csvRows = [
            headers,
            [
                "FizzBuzz", "Simple fizzbuzz", "Intro Course", "Week 1",
                "for (let i = 1; i <= 100; i++)", "1,2", "Think modulo",
                '{"1":"Div by 3","2":"Div by 5"}'
            ]
        ];

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: () => Promise.resolve("csv content")
        });

        (parse as jest.Mock).mockReturnValue(csvRows);

        (mockedDb.queryCourses as jest.Mock).mockResolvedValue([]);
        (mockedDb.createCourse as jest.Mock).mockResolvedValue({ id: 1, name: "Intro Course" });

        (mockedDb.queryCategoriesByCourseId as jest.Mock).mockResolvedValue([]);
        (mockedDb.createCategory as jest.Mock).mockResolvedValue({ id: 10, name: "Week 1", courseId: 1 });

        (mockedDb.queryCategoriesWithProblemsForCourse as jest.Mock).mockResolvedValue([]);

        (mockedDb.createProblem as jest.Mock).mockResolvedValue(undefined);

        const result = await importProblems("token");

        expect(result).toEqual({
            success: true,
            details: expect.objectContaining({
                imported: 1,
                updated: 0,
                skipped: 0,
                coursesCreated: 1,
                categoriesCreated: 1,
                errors: []
            })
        });

        expect(mockedDb.createCourse).toHaveBeenCalled();
        expect(mockedDb.createCategory).toHaveBeenCalled();
        expect(mockedDb.createProblem).toHaveBeenCalled();
    });

    it("skips row with column mismatch", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
        global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("data") });

        const headers = ["name", "description", "courseName", "lectureName", "codeSnippet", "correctLines", "hint", "reasons"];
        (parse as jest.Mock).mockReturnValue([
            headers,
            ["only", "7", "columns", "instead", "of", "8", "here"] // 7 columns
        ]);

        (mockedDb.queryCourses as jest.Mock).mockResolvedValue([]);

        const result = await importProblems("token");

        if (result.success) {
            expect(result.details!.skipped).toBe(1);
            expect(result.details!.errors[0]).toMatch(/Column count mismatch/);
        }
    });

    it("skips row with missing required fields", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
        global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("data") });

        const headers = ["name", "description", "courseName", "lectureName", "codeSnippet", "correctLines", "hint", "reasons"];
        (parse as jest.Mock).mockReturnValue([
            headers,
            ["", "", "Intro", "Week 1", "code", "1,2", "hint", '{"1":"reason"}'] // name is empty
        ]);

        (mockedDb.queryCourses as jest.Mock).mockResolvedValue([]);

        const result = await importProblems("token");

        if (result.success) {
            expect(result.details!.skipped).toBe(1);
            expect(result.details!.errors[0]).toMatch(/Missing required fields/);
        }
    });

    it("skips row with invalid JSON in reasons", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
        global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("data") });

        const headers = ["name", "description", "courseName", "lectureName", "codeSnippet", "correctLines", "hint", "reasons"];
        (parse as jest.Mock).mockReturnValue([
            headers,
            ["Fizz", "desc", "Intro", "Week", "code", "1", "hint", "{invalid: json}"]
        ]);

        (mockedDb.queryCourses as jest.Mock).mockResolvedValue([]);
        (mockedDb.createCourse as jest.Mock).mockResolvedValue({ id: 1, name: "Intro" });
        (mockedDb.queryCategoriesByCourseId as jest.Mock).mockResolvedValue([]);
        (mockedDb.createCategory as jest.Mock).mockResolvedValue({ id: 10, name: "Week", courseId: 1 });

        const result = await importProblems("token");

        if (result.success) {
            expect(result.details!.skipped).toBe(1);
            expect(result.details!.errors[0]).toMatch(/Invalid JSON format/);
        }
    });

    it("handles multiple problems with same category name in same course", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);

        const headers = [
            "name", "description", "courseName", "lectureName",
            "codeSnippet", "correctLines", "hint", "reasons"
        ];

        const csvRows = [
            headers,
            [
                "Valid Problem", "A valid problem for comparison", "Test", "Lecture 1",
                "def hello():\n    print('Hello World')", "1,2", "Check the syntax",
                '{"1": "Missing return statement"}'
            ],
            [
                "Test Problem", "T", "Test", "Lecture 1",
                "def hello():\n    print('Hello World')", "1,2", "Check the syntax",
                '{"1": "Missing return statement"}'
            ],
            [
                "Test2 Problem", "T", "Test", "Lecture 1",
                "def hello():\n    print('Hello World')", "1,2", "Check the syntax",
                '{"1": "Missing return statement"}'
            ]
        ];

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: () => Promise.resolve("csv content")
        });

        (parse as jest.Mock).mockReturnValue(csvRows);

        (mockedDb.queryCourses as jest.Mock).mockResolvedValue([]);
        (mockedDb.createCourse as jest.Mock).mockResolvedValue({ id: 1, name: "Test" });

        let categoryCallCount = 0;
        (mockedDb.queryCategoriesByCourseId as jest.Mock).mockImplementation(() => {
            categoryCallCount++;
            if (categoryCallCount === 1) {
                return Promise.resolve([]);
            } else {
                return Promise.resolve([{ id: 10, name: "Lecture 1", courseId: 1 }]);
            }
        });

        (mockedDb.createCategory as jest.Mock).mockResolvedValue({ id: 10, name: "Lecture 1", courseId: 1 });

        (mockedDb.queryCategoriesWithProblemsForCourse as jest.Mock).mockResolvedValue([
            { id: 10, problems: [] }
        ]);

        (mockedDb.createProblem as jest.Mock).mockResolvedValue(undefined);

        const result = await importProblems("token");

        expect(result.success).toBe(true);
        expect(result.details?.imported).toBe(3); // All 3 problems should be imported
        expect(result.details?.coursesCreated).toBe(1); // 1 course created
        expect(result.details?.categoriesCreated).toBe(1); // Only 1 category created (not 3)
        expect(result.details?.errors).toEqual([]); // No errors
        expect(mockedDb.createCategory).toHaveBeenCalledTimes(1);
        expect(mockedDb.createProblem).toHaveBeenCalledTimes(3);
    });

    it("updates existing problem instead of creating", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);

        const headers = ["name", "description", "courseName", "lectureName", "codeSnippet", "correctLines", "hint", "reasons"];
        (parse as jest.Mock).mockReturnValue([
            headers,
            ["SameName", "desc", "Intro", "Week", "code", "1", "hint", '{"1":"r"}']
        ]);

        global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("data") });

        (mockedDb.queryCourses as jest.Mock).mockResolvedValue([{ id: 1, name: "Intro" }]);
        (mockedDb.queryCategoriesByCourseId as jest.Mock).mockResolvedValue([{ id: 10, name: "Week", courseId: 1 }]);
        (mockedDb.queryCategoriesWithProblemsForCourse as jest.Mock).mockResolvedValue([
            {
                id: 10,
                problems: [{ id: 999, name: "SameName" }]
            }
        ]);
        (mockedDb.updateProblem as jest.Mock).mockResolvedValue(undefined);

        const result = await importProblems("token");

        expect(mockedDb.updateProblem).toHaveBeenCalledWith(999, expect.any(Object));
        if (result.success) {
            expect(result.details!.updated).toBe(1);
            expect(result.details!.imported).toBe(0);
        }
    });

    it("finds existing problem and handles error during update", async () => {
        (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);

        const headers = ["name", "description", "courseName", "lectureName", "codeSnippet", "correctLines", "hint", "reasons"];
        (parse as jest.Mock).mockReturnValue([
            headers,
            ["Duplicate", "desc", "Intro", "Week", "code", "1", "hint", '{"1":"reason"}']
        ]);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: () => Promise.resolve("data")
        });

        (mockedDb.queryCourses as jest.Mock).mockResolvedValue([{ id: 1, name: "Intro" }]);
        (mockedDb.queryCategoriesByCourseId as jest.Mock).mockResolvedValue([{ id: 10, name: "Week", courseId: 1 }]);

        (mockedDb.queryCategoriesWithProblemsForCourse as jest.Mock).mockResolvedValue([
            {
                id: 10,
                problems: [{ id: 42, name: "Duplicate" }]
            }
        ]);

        (mockedDb.updateProblem as jest.Mock).mockRejectedValue(new Error("Update failed"));

        const result = await importProblems("token");

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.details!.skipped).toBe(1);
            expect(result.details!.updated).toBe(0);
            expect(result.details!.errors[0]).toMatch(/Update failed/);
        }

        expect(mockedDb.queryCategoriesWithProblemsForCourse).toHaveBeenCalled();
        expect(mockedDb.updateProblem).toHaveBeenCalledWith(42, expect.any(Object));
    });
});