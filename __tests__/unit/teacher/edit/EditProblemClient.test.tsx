jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));

jest.mock("@/app/teacher/actions", () => ({
    getProblemByIdOptimized: jest.fn(),
    updateProblemAction: jest.fn(),
    getCategoriesByCourse: jest.fn(),
    createCategoryAction: jest.fn(),
    createCourseAction: jest.fn(),
}));

import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import { EditProblemClient } from "@/app/teacher/edit/problem/[id]/EditProblemClient";
import * as actions from "@/app/teacher/actions";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const renderWithQueryClient = (ui: React.ReactElement) =>
    render(
        <QueryClientProvider client={queryClient}>
            {ui}
        </QueryClientProvider>
    );

const dummyProblem = {
    id: 1,
    name: "Example Problem",
    description: "Description here",
    category: { id: 10, courseId: 5 },
    categoryId: 10,
    code_snippet: "line1\nline2\nline3",
    correct_lines: "1,3",
    reason: { "1": "Reason 1", "3": "Reason 3" },
    hint: "Helpful hint",
};

const dummyCourses = [
    { id: 5, name: "Course A" },
    { id: 6, name: "Course B" },
];

describe("EditProblemClient", () => {
    const push = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push });
        sessionStorage.setItem("teacher_token", "dummy_token");
    });

    afterEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
    });

    it("redirects unauthenticated users", () => {
        sessionStorage.removeItem("teacher_token");
        renderWithQueryClient(<EditProblemClient problemId={1} initialCourses={dummyCourses} />);
        expect(push).toHaveBeenCalledWith("/teacher");
    });

    it("shows loading state initially", async () => {
        (actions.getProblemByIdOptimized as jest.Mock).mockResolvedValueOnce({
            success: true,
            problem: dummyProblem,
        });
        renderWithQueryClient(<EditProblemClient problemId={1} initialCourses={dummyCourses} />);
        expect(await screen.findByText("Loading problem...")).toBeInTheDocument();
    });

    it("renders form with fetched problem data", async () => {
        (actions.getProblemByIdOptimized as jest.Mock).mockResolvedValueOnce({
            success: true,
            problem: dummyProblem,
        });
        (actions.getCategoriesByCourse as jest.Mock).mockResolvedValueOnce([
            { id: 10, name: "Category A" },
        ]);

        renderWithQueryClient(<EditProblemClient problemId={1} initialCourses={dummyCourses} />);

        expect(await screen.findByDisplayValue("Example Problem")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Description here")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Helpful hint")).toBeInTheDocument();
    });

    it("submits form successfully", async () => {
        (actions.getProblemByIdOptimized as jest.Mock).mockResolvedValueOnce({
            success: true,
            problem: dummyProblem,
        });
        (actions.getCategoriesByCourse as jest.Mock).mockResolvedValueOnce([
            { id: 10, name: "Category A" },
        ]);
        (actions.updateProblemAction as jest.Mock).mockResolvedValueOnce({
            success: true,
        });

        renderWithQueryClient(<EditProblemClient problemId={1} initialCourses={dummyCourses} />);
        await screen.findByDisplayValue("Example Problem");

        fireEvent.click(screen.getByText("Update Problem"));
        expect(await screen.findByText("Problem updated successfully!")).toBeInTheDocument();
    });

    it("displays error on failed update", async () => {
        (actions.getProblemByIdOptimized as jest.Mock).mockResolvedValueOnce({
            success: true,
            problem: dummyProblem,
        });
        (actions.getCategoriesByCourse as jest.Mock).mockResolvedValueOnce([
            { id: 10, name: "Category A" },
        ]);
        (actions.updateProblemAction as jest.Mock).mockResolvedValueOnce({
            success: false,
            error: "Update failed",
        });

        renderWithQueryClient(<EditProblemClient problemId={1} initialCourses={dummyCourses} />);
        await screen.findByDisplayValue("Example Problem");

        fireEvent.click(screen.getByText("Update Problem"));
        expect(await screen.findByText("Update failed")).toBeInTheDocument();
    });

    it("shows validation error if hint is empty", async () => {
        const problemWithEmptyHint = { ...dummyProblem, hint: "" };
        (actions.getProblemByIdOptimized as jest.Mock).mockResolvedValueOnce({
            success: true,
            problem: problemWithEmptyHint,
        });
        (actions.getCategoriesByCourse as jest.Mock).mockResolvedValueOnce([
            { id: 10, name: "Category A" },
        ]);

        renderWithQueryClient(<EditProblemClient problemId={1} initialCourses={dummyCourses} />);
        await screen.findByDisplayValue("Example Problem");

        fireEvent.click(screen.getByText("Update Problem"));
        expect(await screen.findByRole("alert")).toHaveTextContent("An unexpected error occurred");
    });

    it("loads categories when a new course is selected", async () => {
        (actions.getProblemByIdOptimized as jest.Mock).mockResolvedValueOnce({
            success: true,
            problem: dummyProblem,
        });
        (actions.getCategoriesByCourse as jest.Mock).mockResolvedValueOnce([
            { id: 10, name: "Category A" },
        ]);

        renderWithQueryClient(<EditProblemClient problemId={1} initialCourses={dummyCourses} />);
        await screen.findByDisplayValue("Example Problem");

        const courseSelect = screen.getAllByRole("combobox")[0];
        fireEvent.change(courseSelect, { target: { value: "6" } });

        await waitFor(() => {
            expect(actions.getCategoriesByCourse).toHaveBeenCalledWith(6);
        });
    });

    it("updates reasons when line selection changes", async () => {
        (actions.getProblemByIdOptimized as jest.Mock).mockResolvedValueOnce({
            success: true,
            problem: dummyProblem,
        });
        (actions.getCategoriesByCourse as jest.Mock).mockResolvedValueOnce([
            { id: 10, name: "Category A" },
        ]);

        renderWithQueryClient(<EditProblemClient problemId={1} initialCourses={dummyCourses} />);
        await screen.findByDisplayValue("Example Problem");

        expect(screen.getByText("Line 1 - Reason")).toBeInTheDocument();
        expect(screen.getByText("Line 3 - Reason")).toBeInTheDocument();
    });
});
