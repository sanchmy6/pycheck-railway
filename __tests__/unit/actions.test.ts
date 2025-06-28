import {
    getCourses,
    getCourseById,
    getCategoriesWithProblems,
    getProblemById,
    evaluateProblemSelection,
    getProblemHint,
} from "@/app/courses/actions";

jest.mock('@/lib/db/db-helpers');

import * as db from '@/lib/db/db-helpers';
const mockedDb = jest.mocked(db);

describe("actions.ts", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("getCourses returns list from queryCourses", async () => {
        mockedDb.queryCourses.mockResolvedValue([
            {
                id: 1,
                name: "Course 1",
                description: "Desc",
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
        const result = await getCourses();
        expect(result).toEqual([
            {
                id: 1,
                name: "Course 1",
                description: "Desc",
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
            },
        ]);
    });

    it("getCourseById parses id and calls findCourseById", async () => {
        mockedDb.findCourseById.mockResolvedValue({
            id: 42,
            name: "Course 42",
            description: "Desc",
            created_at: new Date(),
            updated_at: new Date(),
        });
        const result = await getCourseById("42");
        expect(mockedDb.findCourseById).toHaveBeenCalledWith(42);
        expect(result).toEqual({
            id: 42,
            name: "Course 42",
            description: "Desc",
            created_at: expect.any(Date),
            updated_at: expect.any(Date),
        });
    });

    it("getCategoriesWithProblems returns categories with problems", async () => {
        mockedDb.queryCategoriesByCourseId.mockResolvedValue([
            {
                id: 1,
                name: "Category 1",
                created_at: new Date(),
                updated_at: new Date(),
                courseId: 1,
            },
        ]);
        mockedDb.queryProblemsByCategoryId.mockResolvedValue([
            {
                id: 101,
                name: "Problem 1",
                description: "Desc",
                created_at: new Date(),
                updated_at: new Date(),
                code_snippet: "code",
                correct_lines: "1",
                reason: {},
                hint: "Hint",
                categoryId: 1,
            },
        ]);

        const result = await getCategoriesWithProblems("1");

        expect(result).toEqual([
            {
                id: 1,
                name: "Category 1",
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
                courseId: 1,
                problems: [
                    {
                        id: 101,
                        name: "Problem 1",
                        description: "Desc",
                        created_at: expect.any(Date),
                        updated_at: expect.any(Date),
                        code_snippet: "code",
                        correct_lines: "1",
                        reason: {},
                        hint: "Hint",
                        categoryId: 1,
                    },
                ],
            },
        ]);
    });

    it("getProblemById returns correct line count", async () => {
        mockedDb.findProblemById.mockResolvedValue({
            id: 10,
            name: "Problem 10",
            description: "Desc",
            created_at: new Date(),
            updated_at: new Date(),
            code_snippet: "snippet",
            correct_lines: "1,2,3",
            reason: {},
            hint: "hint",
            categoryId: 1,
        });

        const result = await getProblemById(10);

        expect(result).toEqual({
            id: 10,
            correctLinesCount: 3,
        });
    });

    it("getProblemHint returns hint", async () => {
        mockedDb.findProblemById.mockResolvedValue({
            id: 20,
            name: "Problem 20",
            description: "Desc",
            created_at: new Date(),
            updated_at: new Date(),
            code_snippet: "snippet",
            correct_lines: "1,2",
            reason: {},
            hint: "Test hint",
            categoryId: 2,
        });

        const result = await getProblemHint(20);
        expect(result).toEqual({ hint: "Test hint" });
    });

    it("evaluateProblemSelection returns correct result", async () => {
        mockedDb.findProblemById.mockResolvedValue({
            id: 30,
            name: "Problem 30",
            description: "Desc",
            created_at: new Date(),
            updated_at: new Date(),
            code_snippet: "snippet",
            correct_lines: "1,2",
            reason: {
                "1": "Line 1 is correct",
                "3": "Line 3 is incorrect",
            },
            hint: "hint",
            categoryId: 2,
        });

        const result = await evaluateProblemSelection(1, [1, 3]);

        expect(result).toEqual({
            success: true,
            isCorrect: false,
            correctSelectionsCount: 1,
            missingLinesCount: 1,
            expectedLinesCount: 2,
            correctSelections: [{ line: 1, reason: "Line 1 is correct" }],
            incorrectSelections: [{ line: 3, reason: "Line 3 is incorrect" }],
        });
    });
});
