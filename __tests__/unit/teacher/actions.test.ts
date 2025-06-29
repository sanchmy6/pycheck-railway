jest.mock("@/lib/auth");
jest.mock("@/lib/db/db-helpers");
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/app/teacher/utils");

import {
    deleteCourseAction,
    getCategoryById,
    getCourseById,
    getCourses,
    getProblemById,
    authenticateTeacher,
    validateAuthToken,
    createCourseAction,
    updateCourseAction,
    createCategoryAction,
    getCategories,
    createProblemAction,
    updateProblemAction,
    updateCategoryAction,
    deleteCategoryAction,
    deleteProblemAction,
    getProblemByIdOptimized,
    getCategoryByIdOptimized,
    getCoursesBasic,
    getCategoriesWithProblemsForCourseAction,
} from "@/app/teacher/actions";

import * as authLib from "@/lib/auth";
import * as utils from "@/app/teacher/utils";
import * as db from '@/lib/db/db-helpers';
const mockedDb = jest.mocked(db);

describe("teacher actions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("authenticateTeacher", () => {
        it("should return token on valid password", async () => {
            (authLib.verifyTeacherPassword as jest.Mock).mockReturnValue(true);
            (authLib.generateAuthToken as jest.Mock).mockReturnValue("test-token");

            const result = await authenticateTeacher("correct-password");
            expect(result).toEqual({ success: true, token: "test-token" });
        });

        it("should return error on invalid password", async () => {
            (authLib.verifyTeacherPassword as jest.Mock).mockReturnValue(false);

            const result = await authenticateTeacher("wrong-password");
            expect(result).toEqual({ success: false, error: "Invalid password" });
        });
    });

    describe("validateAuthToken", () => {
        it("should return error if no token", async () => {
            const result = await validateAuthToken("");
            expect(result).toEqual({ success: false, error: "No token provided" });
        });

        it("should return success on valid token", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);

            const result = await validateAuthToken("valid-token");
            expect(result).toEqual({ success: true });
        });

        it("should return error on invalid token", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);

            const result = await validateAuthToken("invalid-token");
            expect(result).toEqual({ success: false, error: "Invalid or expired token" });
        });
    });

    describe("createCourseAction", () => {
        it("should return error if token is invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);

            const result = await createCourseAction("bad-token", "JS 101", "Intro course");
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });

        it("should return created course if valid", async () => {
            const fakeCourse = { id: 1, name: "JS 101", description: "Intro course" };
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.createCourse as jest.Mock).mockResolvedValue(fakeCourse);

            const result = await createCourseAction("token", "JS 101", "Intro course");
            expect(result).toEqual({ success: true, course: fakeCourse });
        });

        it("should handle unique constraint error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.createCourse as jest.Mock).mockRejectedValue(new Error("unique_error"));
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(true);

            const result = await createCourseAction("token", "Duplicate", "Desc");
            expect(result).toEqual({
                success: false,
                error: "A course with this name already exists",
            });
        });

        it("should handle general error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.createCourse as jest.Mock).mockRejectedValue(new Error("some error"));
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);

            const result = await createCourseAction("token", "Any", "Desc");
            expect(result).toEqual({
                success: false,
                error: "Failed to create course. Please try again.",
            });
        });
    });

    describe("updateCourseAction", () => {
        it("should return error if token is invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await updateCourseAction("bad-token", 1, "New", "Desc");
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });

        it("should update course on valid token", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            const fakeCourse = { id: 1, name: "Updated", description: "Updated desc" };
            (mockedDb.updateCourse as jest.Mock).mockResolvedValue(fakeCourse);

            const result = await updateCourseAction("token", 1, "Updated", "Updated desc");
            expect(result).toEqual({ success: true, course: fakeCourse });
        });

        it("should handle unique constraint error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.updateCourse as jest.Mock).mockRejectedValue(new Error("unique_error"));
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(true);

            const result = await updateCourseAction("token", 1, "Duplicate", "Desc");
            expect(result).toEqual({
                success: false,
                error: "A course with this name already exists",
            });
        });

        it("should handle general error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.updateCourse as jest.Mock).mockRejectedValue(new Error("some error"));
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);

            const result = await updateCourseAction("token", 1, "Any", "Desc");
            expect(result).toEqual({
                success: false,
                error: "Failed to update course. Please try again.",
            });
        });
    });

    describe("createCategoryAction", () => {
        it("returns error if token is invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await createCategoryAction("bad-token", "Frontend", 1);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });

        it("creates category successfully", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            const fakeCategory = { id: 1, name: "Frontend", courseId: 1 };
            (mockedDb.createCategory as jest.Mock).mockResolvedValue(fakeCategory);
            const result = await createCategoryAction("token", "Frontend", 1);
            expect(result).toEqual({ success: true, category: fakeCategory });
        });

        it("handles unique constraint error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.createCategory as jest.Mock).mockRejectedValue(new Error("unique_error"));
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(true);
            const result = await createCategoryAction("token", "Duplicate", 1);
            expect(result).toEqual({ success: false, error: "A category with this name already exists" });
        });

        it("handles general error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.createCategory as jest.Mock).mockRejectedValue(new Error("some error"));
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);
            const result = await createCategoryAction("token", "Any", 1);
            expect(result).toEqual({ success: false, error: "Failed to create category. Please try again." });
        });
    });

    describe("getCourses", () => {
        it("returns list of courses", async () => {
            const fakeCourses = [{ id: 1, name: "Math" }];
            (mockedDb.queryCourses as jest.Mock).mockResolvedValue(fakeCourses);
            const result = await getCourses();
            expect(result).toEqual(fakeCourses);
        });
    });

    describe("getCategories", () => {
        it("returns list of categories", async () => {
            const fakeCategories = [{ id: 1, name: "React" }];
            (mockedDb.queryCategories as jest.Mock).mockResolvedValue(fakeCategories);
            const result = await getCategories();
            expect(result).toEqual(fakeCategories);
        });
    });

    describe("getCourseById", () => {
        it("returns error if token is invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await getCourseById("bad-token", 1);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });

        it("returns course if found", async () => {
            const course = { id: 1, name: "Math" };
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.findCourseById as jest.Mock).mockResolvedValue(course);
            const result = await getCourseById("token", 1);
            expect(result).toEqual({ success: true, course });
        });

        it("handles db error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.findCourseById as jest.Mock).mockRejectedValue(new Error("DB error"));
            const result = await getCourseById("token", 1);
            expect(result).toEqual({ success: false, error: "Failed to fetch course" });
        });
    });

    describe("getCategoryById", () => {
        it("returns error if token is invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await getCategoryById("bad-token", 2);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });

        it("returns category if found", async () => {
            const category = { id: 2, name: "React" };
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.findCategoryById as jest.Mock).mockResolvedValue(category);
            const result = await getCategoryById("token", 2);
            expect(result).toEqual({ success: true, category });
        });

        it("handles db error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.findCategoryById as jest.Mock).mockRejectedValue(new Error("DB error"));
            const result = await getCategoryById("token", 2);
            expect(result).toEqual({ success: false, error: "Failed to fetch category" });
        });
    });

    describe("getProblemById", () => {
        it("returns error if token is invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await getProblemById("bad-token", 3);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });

        it("returns problem if found", async () => {
            const problem = { id: 3, name: "Find Max", categoryId: 2 };
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.findProblemById as jest.Mock).mockResolvedValue(problem);
            const result = await getProblemById("token", 3);
            expect(result).toEqual({ success: true, problem });
        });

        it("handles db error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.findProblemById as jest.Mock).mockRejectedValue(new Error("DB error"));
            const result = await getProblemById("token", 3);
            expect(result).toEqual({ success: false, error: "Failed to fetch problem" });
        });
    });

    describe("deleteCourseAction", () => {
        it("returns an error if the token is invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await deleteCourseAction("bad-token", 1);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });

        it("successfully deletes the course", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.deleteCourse as jest.Mock).mockResolvedValue(undefined);
            const result = await deleteCourseAction("token", 1);
            expect(result).toEqual({ success: true });
        });

        it("handles deletion error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.deleteCourse as jest.Mock).mockRejectedValue(new Error("Delete failed"));
            const result = await deleteCourseAction("token", 1);
            expect(result).toEqual({ success: false, error: "Failed to delete course. Please try again." });
        });
    });

    describe("createProblemAction", () => {
        const formData = {
            name: "Sample Problem",
            description: "Description",
            categoryId: 1,
            codeSnippet: "const x = 1;",
            correctLines: [1, 2],
            reasons: { 1: "Reason 1" },
            hint: "Hint here"
        };

        it("returns error if token invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await createProblemAction("bad-token", formData);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });

        it("creates problem successfully", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.createProblem as jest.Mock).mockResolvedValue(undefined);

            const result = await createProblemAction("token", formData);
            expect(result).toEqual({ success: true });
        });

        it("handles unique name error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            const error = { meta: { target: ["name"] } };
            (mockedDb.createProblem as jest.Mock).mockRejectedValue(error);
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(true);

            const result = await createProblemAction("token", formData);
            expect(result.error).toMatch(/already exists/);
        });

        it("handles foreign key constraint error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.createProblem as jest.Mock).mockRejectedValue({});
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);
            (utils.isForeignKeyConstraintError as jest.Mock).mockReturnValue(true);

            const result = await createProblemAction("token", formData);
            expect(result.error).toMatch(/invalid/);
        });

        it("handles JSON error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.createProblem as jest.Mock).mockRejectedValue({ message: "JSON invalid" });
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);
            (utils.isForeignKeyConstraintError as jest.Mock).mockReturnValue(false);

            const result = await createProblemAction("token", formData);
            expect(result.error).toMatch(/data format/);
        });

        it("handles generic error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.createProblem as jest.Mock).mockRejectedValue({});
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);
            (utils.isForeignKeyConstraintError as jest.Mock).mockReturnValue(false);

            const result = await createProblemAction("token", formData);
            expect(result.error).toMatch(/Failed to create/);
        });
    });

    describe("updateProblemAction", () => {
        const formData = {
            name: "Updated",
            description: "New desc",
            categoryId: 2,
            codeSnippet: "let y = 2;",
            correctLines: [2],
            reasons: { 2: "Reason" },
            hint: "Updated hint"
        };

        it("returns error if token invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await updateProblemAction("bad-token", 5, formData);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });

        it("updates successfully", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.updateProblem as jest.Mock).mockResolvedValue(undefined);

            const result = await updateProblemAction("token", 5, formData);
            expect(result).toEqual({ success: true });
        });
    });

    describe("updateCategoryAction", () => {
        it("returns error on invalid token", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await updateCategoryAction("bad", 1, "Cat", 2);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });
    });

    describe("deleteCategoryAction", () => {
        it("returns error if token is invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await deleteCategoryAction("bad", 1);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });
    });

    describe("deleteProblemAction", () => {
        it("returns error if token is invalid", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await deleteProblemAction("bad", 3);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });
    });

    describe("getProblemByIdOptimized", () => {
        it("returns success if found", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.findProblemWithCategoryAndCourse as jest.Mock).mockResolvedValue({ id: 1 });
            const result = await getProblemByIdOptimized("token", 1);
            expect(result).toEqual({ success: true, problem: { id: 1 } });
        });

        it("returns error on DB failure", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.findProblemWithCategoryAndCourse as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await getProblemByIdOptimized("token", 1);
            expect(result).toEqual({ success: false, error: "Failed to fetch problem" });
        });
    });

    describe("getCategoryByIdOptimized", () => {
        it("returns category if found", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.findCategoryWithCourse as jest.Mock).mockResolvedValue({ id: 2 });
            const result = await getCategoryByIdOptimized("token", 2);
            expect(result).toEqual({ success: true, category: { id: 2 } });
        });

        it("returns error on DB failure", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.findCategoryWithCourse as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await getCategoryByIdOptimized("token", 2);
            expect(result).toEqual({ success: false, error: "Failed to fetch category" });
        });
    });

    describe("getCoursesBasic", () => {
        it("returns data", async () => {
            (mockedDb.queryCoursesWithBasicStats as jest.Mock).mockResolvedValue([{ id: 1 }]);
            const result = await getCoursesBasic();
            expect(result).toEqual([{ id: 1 }]);
        });

        it("returns categories if found", async () => {
            const categories = [{ id: 1, name: "Arrays" }];
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.queryCategoriesWithProblemsForCourse as jest.Mock).mockResolvedValue(categories);

            const result = await getCategoriesWithProblemsForCourseAction("token", 1);
            expect(result).toEqual({ success: true, categories });
        });

        it("returns error on DB failure", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.queryCategoriesWithProblemsForCourse as jest.Mock).mockRejectedValue(new Error("fail"));

            const result = await getCategoriesWithProblemsForCourseAction("token", 1);
            expect(result).toEqual({ success: false, error: "Failed to fetch categories" });
        });
    });

    describe("getCategoriesWithProblemsForCourseAction", () => {
        it("returns error on invalid token", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(false);
            const result = await getCategoriesWithProblemsForCourseAction("bad", 1);
            expect(result).toEqual({ success: false, error: "Invalid authentication" });
        });
    });

    describe("updateProblemAction ", () => {
        const formData = {
            name: "Updated",
            description: "New desc",
            categoryId: 2,
            codeSnippet: "let y = 2;",
            correctLines: [2],
            reasons: { 2: "Reason" },
            hint: "Updated hint"
        }
        it("handles unique name constraint error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            const error = { meta: { target: ["name"] } };
            (mockedDb.updateProblem as jest.Mock).mockRejectedValue(error);
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(true);

            const result = await updateProblemAction("token", 5, formData);
            expect(result.error).toMatch(/already exists/);
        });

        it("handles foreign key constraint error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.updateProblem as jest.Mock).mockRejectedValue({});
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);
            (utils.isForeignKeyConstraintError as jest.Mock).mockReturnValue(true);

            const result = await updateProblemAction("token", 5, formData);
            expect(result.error).toMatch(/invalid/);
        });

        it("handles JSON format error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.updateProblem as jest.Mock).mockRejectedValue({ message: "JSON invalid" });
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);
            (utils.isForeignKeyConstraintError as jest.Mock).mockReturnValue(false);

            const result = await updateProblemAction("token", 5, formData);
            expect(result.error).toMatch(/data format/);
        });

        it("handles generic error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.updateProblem as jest.Mock).mockRejectedValue({});
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);
            (utils.isForeignKeyConstraintError as jest.Mock).mockReturnValue(false);

            const result = await updateProblemAction("token", 5, formData);
            expect(result.error).toMatch(/Failed to update/);
        });
    });

    describe("updateCategoryAction", () => {
        it("updates category successfully", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            const category = { id: 1, name: "Updated", courseId: 2 };
            (mockedDb.updateCategory as jest.Mock).mockResolvedValue(category);

            const result = await updateCategoryAction("token", 1, "Updated", 2);
            expect(result).toEqual({ success: true, category });
        });

        it("handles unique constraint error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.updateCategory as jest.Mock).mockRejectedValue({});
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(true);

            const result = await updateCategoryAction("token", 1, "Name", 1);
            expect(result.error).toMatch(/already exists/);
        });

        it("handles foreign key constraint error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.updateCategory as jest.Mock).mockRejectedValue({});
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);
            (utils.isForeignKeyConstraintError as jest.Mock).mockReturnValue(true);

            const result = await updateCategoryAction("token", 1, "Name", 1);
            expect(result.error).toMatch(/invalid/);
        });

        it("handles generic error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.updateCategory as jest.Mock).mockRejectedValue({});
            (utils.isUniqueConstraintError as jest.Mock).mockReturnValue(false);
            (utils.isForeignKeyConstraintError as jest.Mock).mockReturnValue(false);

            const result = await updateCategoryAction("token", 1, "Name", 1);
            expect(result.error).toMatch(/Failed to update category/);
        });
    });

    describe("deleteCategoryAction", () => {
        it("successfully deletes the category", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.deleteCategory as jest.Mock).mockResolvedValue(undefined);

            const result = await deleteCategoryAction("token", 1);
            expect(result).toEqual({ success: true });
        });

        it("handles deletion error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.deleteCategory as jest.Mock).mockRejectedValue(new Error("Fail"));

            const result = await deleteCategoryAction("token", 1);
            expect(result).toEqual({
                success: false,
                error: "Failed to delete category. Please try again.",
            });
        });
    });

    describe("deleteProblemAction", () => {
        it("successfully deletes the problem", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.deleteProblem as jest.Mock).mockResolvedValue(undefined);

            const result = await deleteProblemAction("token", 3);
            expect(result).toEqual({ success: true });
        });

        it("handles deletion error", async () => {
            (authLib.verifyAuthToken as jest.Mock).mockReturnValue(true);
            (mockedDb.deleteProblem as jest.Mock).mockRejectedValue(new Error("Fail"));

            const result = await deleteProblemAction("token", 3);
            expect(result).toEqual({
                success: false,
                error: "Failed to delete problem. Please try again.",
            });
        });
    });
});
