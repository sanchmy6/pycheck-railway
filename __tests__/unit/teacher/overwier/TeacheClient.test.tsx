jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

jest.mock("@/app/teacher/components/ImportHelpWindow", () => ({
    ImportHelpWindow: () => <div data-testid="import-help-window">Help</div>,
}));

jest.mock("@/app/teacher/actions", () => ({
    importProblems: jest.fn(),
    getCoursesWithStats: jest.fn(),
    deleteCourseAction: jest.fn(),
    deleteCategoryAction: jest.fn(),
    deleteProblemAction: jest.fn(),
}));

import {render, screen, fireEvent, waitFor, within} from "@testing-library/react";
import { TeacherClient } from "@/app/teacher/overview/TeacherClient";
import * as actions from "@/app/teacher/actions";
import { useRouter } from "next/navigation";

describe("TeacherClient", () => {
    const mockPush = jest.fn();
    const dummyCourses = [
        {
            id: 1,
            name: "Course A",
            description: "Desc A",
            _count: { categories: 1 },
            categories: [
                {
                    id: 10,
                    name: "Category X",
                    _count: { problems: 1 },
                    problems: [
                        { id: 100, name: "Problem 1", description: "Problem Desc" },
                    ],
                },
            ],
        },
    ];

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        sessionStorage.setItem("teacher_token", "dummy_token");
    });

    afterEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
    });

    it("redirects unauthenticated users", () => {
        sessionStorage.removeItem("teacher_token");

        render(<TeacherClient initialCourses={[]} />);
        expect(mockPush).toHaveBeenCalledWith("/teacher");
    });

    it("renders dashboard with courses", () => {
        render(<TeacherClient initialCourses={dummyCourses} />);
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Course A")).toBeInTheDocument();
    });

    it("expands and collapses a course", () => {
        render(<TeacherClient initialCourses={dummyCourses} />);
        const toggleBtn = screen.getByText("Course A");
        fireEvent.click(toggleBtn);
        expect(screen.getByText("Category X")).toBeInTheDocument();
        fireEvent.click(toggleBtn);
        expect(screen.queryByText("Category X")).not.toBeInTheDocument();
    });

    it("expands a category and sees problems", () => {
        render(<TeacherClient initialCourses={dummyCourses} />);
        fireEvent.click(screen.getByText("Course A"));
        fireEvent.click(screen.getByText("Category X"));
        expect(screen.getByText("Problem 1")).toBeInTheDocument();
    });

    it("opens and closes import help window", () => {
        render(<TeacherClient initialCourses={dummyCourses} />);
        fireEvent.click(screen.getByTitle("Import Help"));
        expect(screen.getByTestId("import-help-window")).toBeInTheDocument();
    });

    it("displays error on failed delete", async () => {
        (actions.deleteCategoryAction as jest.Mock).mockRejectedValueOnce({
            success: false
        });

        const badCourses = [
            {
                ...dummyCourses[0],
                categories: [
                    {
                        ...dummyCourses[0].categories[0],
                        id: 999,
                        name: "Category X",
                    },
                ],
            },
        ];

        render(<TeacherClient initialCourses={badCourses} />);
        fireEvent.click(screen.getByText("Course A"));

        const deleteButtons = screen.getAllByText("Delete");
        fireEvent.click(deleteButtons[1]);

        fireEvent.click(screen.getByText("Confirm"));

        await waitFor(() => {
            expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
        });
    });

    it("deletes a course successfully", async () => {
        (actions.deleteCourseAction as jest.Mock).mockResolvedValueOnce({
            success: true,
        });

        render(<TeacherClient initialCourses={dummyCourses} />);
        fireEvent.click(screen.getByText("Course A"));

        const deleteButtons = screen.getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);


        fireEvent.click(screen.getByText("Confirm"));

        await waitFor(() => {
            expect(screen.queryByText("Course A")).not.toBeInTheDocument();
        });
    });

    it("shows import success modal with stats", async () => {
        (actions.importProblems as jest.Mock).mockResolvedValueOnce({
            success: true,
            details: {
                imported: 2,
                updated: 1,
                skipped: 1,
                coursesCreated: 1,
                categoriesCreated: 2,
                errors: [],
            },
        });

        (actions.getCoursesWithStats as jest.Mock).mockResolvedValue([]);
        render(<TeacherClient initialCourses={[]} />);
        fireEvent.click(screen.getByText("Import from Sheet"));

        await waitFor(() => {
            expect(screen.getByText("Import Successful")).toBeInTheDocument();
            expect(screen.getByText("New Problems")).toBeInTheDocument();
            expect(screen.getByText("Courses:")).toBeInTheDocument();
            expect(screen.getByText("Categories:")).toBeInTheDocument();
        });
    });

    it("shows import modal with errors", async () => {
        (actions.importProblems as jest.Mock).mockResolvedValueOnce({
            success: true,
            details: {
                imported: 0,
                updated: 0,
                skipped: 1,
                coursesCreated: 0,
                categoriesCreated: 0,
                errors: ["Row 3: Missing name", "Row 5: Invalid format"],
            },
        });

        (actions.getCoursesWithStats as jest.Mock).mockResolvedValue([]);
        render(<TeacherClient initialCourses={[]} />);
        fireEvent.click(screen.getByText("Import from Sheet"));

        await waitFor(() => {
            expect(screen.getByText("Errors (2)")).toBeInTheDocument();
            expect(screen.getByText("Row 3: Missing name")).toBeInTheDocument();
            expect(screen.getByText("Row 5: Invalid format")).toBeInTheDocument();
        });
    });

    it("closes import modal", async () => {
        (actions.importProblems as jest.Mock).mockResolvedValueOnce({
            success: true,
            details: {
                imported: 1,
                updated: 0,
                skipped: 0,
                coursesCreated: 0,
                categoriesCreated: 0,
                errors: [],
            },
        });

        (actions.getCoursesWithStats as jest.Mock).mockResolvedValue([]);
        render(<TeacherClient initialCourses={[]} />);
        fireEvent.click(screen.getByText("Import from Sheet"));

        await waitFor(() => {
            expect(screen.getByText("Import Successful")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Close"));

        await waitFor(() => {
            expect(screen.queryByText("Import Successful")).not.toBeInTheDocument();
        });
    });
});
