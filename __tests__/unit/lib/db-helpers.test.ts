jest.mock('@/prisma', () => ({
    prisma: {
        $queryRaw: jest.fn(),
        course: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
        },
        category: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
        },
        problem: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

import { prisma } from '@/prisma';
import * as helpers from '@/lib/db/db-helpers';

describe('db-helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('warmupDatabase', () => {
        it('should log success if query succeeds', async () => {
            (prisma.$queryRaw as jest.Mock).mockResolvedValue(1);
            const logSpy = jest.spyOn(console, 'log').mockImplementation();
            await helpers.warmupDatabase();
            expect(prisma.$queryRaw).toHaveBeenCalled();
            expect(logSpy).toHaveBeenCalledWith('Database connection warmed up');
            logSpy.mockRestore();
        });

        it('should log error if query fails', async () => {
            const error = new Error('fail');
            (prisma.$queryRaw as jest.Mock).mockRejectedValue(error);
            const logSpy = jest.spyOn(console, 'log').mockImplementation();
            await helpers.warmupDatabase();
            expect(logSpy).toHaveBeenCalledWith('Database warm-up failed:', error);
            logSpy.mockRestore();
        });
    });

    describe('course helpers', () => {
        it('findCourseById', async () => {
            await helpers.findCourseById(1);
            expect(prisma.course.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('createCourse', async () => {
            const data = { name: 'Math', description: 'Algebra' };
            await helpers.createCourse(data);
            expect(prisma.course.create).toHaveBeenCalledWith({ data });
        });

        it('updateCourse', async () => {
            const data = { name: 'Math', description: 'Updated' };
            await helpers.updateCourse(1, data);
            expect(prisma.course.update).toHaveBeenCalledWith({ where: { id: 1 }, data });
        });

        it('deleteCourse', async () => {
            await helpers.deleteCourse(1);
            expect(prisma.course.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('queryCourses', async () => {
            await helpers.queryCourses();
            expect(prisma.course.findMany).toHaveBeenCalledWith({ orderBy: { id: 'asc' } });
        });

        it('queryCoursesWithStats', async () => {
            await helpers.queryCoursesWithStats();
            expect(prisma.course.findMany).toHaveBeenCalled();
        });

        it('queryCoursesWithBasicStats', async () => {
            await helpers.queryCoursesWithBasicStats();
            expect(prisma.course.findMany).toHaveBeenCalled();
        });

        it('queryCoursesWithCompleteData', async () => {
            await helpers.queryCoursesWithCompleteData();
            expect(prisma.course.findMany).toHaveBeenCalled();
        });
    });

    describe('category helpers', () => {
        it('findCategoryById', async () => {
            await helpers.findCategoryById(1);
            expect(prisma.category.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('createCategory', async () => {
            const data = { name: 'Algebra', courseId: 1 };
            await helpers.createCategory(data);
            expect(prisma.category.create).toHaveBeenCalledWith({ data });
        });

        it('updateCategory', async () => {
            const data = { name: 'Geometry', courseId: 1 };
            await helpers.updateCategory(2, data);
            expect(prisma.category.update).toHaveBeenCalledWith({ where: { id: 2 }, data });
        });

        it('deleteCategory', async () => {
            await helpers.deleteCategory(3);
            expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 3 } });
        });

        it('queryCategories', async () => {
            await helpers.queryCategories();
            expect(prisma.category.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
        });

        it('queryCategoriesByCourseId', async () => {
            await helpers.queryCategoriesByCourseId(4);
            expect(prisma.category.findMany).toHaveBeenCalledWith({ where: { courseId: 4 }, orderBy: { name: 'asc' } });
        });

        it('queryCategoriesWithProblemsForCourse', async () => {
            await helpers.queryCategoriesWithProblemsForCourse(1);
            expect(prisma.category.findMany).toHaveBeenCalled();
        });
    });

    describe('problem helpers', () => {
        const problemData = {
            name: 'Problem 1',
            description: 'Description',
            categoryId: 1,
            code_snippet: 'code();',
            correct_lines: '1',
            reason: { why: 'Just because' },
            hint: 'Think!'
        };

        it('findProblemById', async () => {
            await helpers.findProblemById(6);
            expect(prisma.problem.findUnique).toHaveBeenCalledWith({ where: { id: 6 } });
        });

        it('createProblem', async () => {
            await helpers.createProblem(problemData);
            expect(prisma.problem.create).toHaveBeenCalledWith({ data: problemData });
        });

        it('updateProblem', async () => {
            await helpers.updateProblem(5, problemData);
            expect(prisma.problem.update).toHaveBeenCalledWith({ where: { id: 5 }, data: problemData });
        });

        it('deleteProblem', async () => {
            await helpers.deleteProblem(10);
            expect(prisma.problem.delete).toHaveBeenCalledWith({ where: { id: 10 } });
        });

        it('queryProblems', async () => {
            await helpers.queryProblems();
            expect(prisma.problem.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
        });

        it('queryProblemsByCategoryId', async () => {
            await helpers.queryProblemsByCategoryId(8);
            expect(prisma.problem.findMany).toHaveBeenCalledWith({ where: { categoryId: 8 }, orderBy: { name: 'asc' } });
        });

        it('findProblemWithCategoryAndCourse', async () => {
            await helpers.findProblemWithCategoryAndCourse(9);
            expect(prisma.problem.findUnique).toHaveBeenCalled();
        });
    });

    describe('findCategoryWithCourse', () => {
        it('calls prisma.category.findUnique with correct parameters', async () => {
            const mockCategory = {
                id: 1,
                name: 'Algorithms',
                course: {
                    id: 5,
                    name: 'Math',
                    description: 'Algebra course'
                }
            };

            const findUniqueMock = jest.fn().mockResolvedValue(mockCategory);
            prisma.category.findUnique = findUniqueMock;

            const result = await helpers.findCategoryWithCourse(1);

            expect(findUniqueMock).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    course: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        }
                    }
                }
            });

            expect(result).toEqual(mockCategory);
        });
    });
});
