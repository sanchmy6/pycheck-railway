import { render, screen, fireEvent } from "@testing-library/react";
import { CourseClientPage } from "@/app/courses/[id]/CourseClientPage";
import { useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
    useSearchParams: jest.fn(),
}));

const mockUseSearchParams = useSearchParams as jest.Mock;

const mockCourse = {
    name: "Python Basics",
    description: "Learn the fundamentals of Python",
};

const mockCategories = [
    {
        id: 1,
        name: "Intro",
        problems: [
            {
                id: 101,
                name: "Problem 1",
                description: "Write a program that prints Hello",
                code_snippet: 'console.log("...");',
                correct_lines: "1",
                hint: "Use console.log",
            },
        ],
    },
    {
        id: 2,
        name: "Functions",
        problems: [
            {
                id: 201,
                name: "Add Two Numbers",
                description: "Create a function to add two numbers",
                code_snippet: "function add(a, b) {\n  return ...;\n}",
                correct_lines: "2",
                hint: "Use return a + b",
            },
        ],
    },
];

describe("CourseClientPage", () => {
    beforeEach(() => {
        mockUseSearchParams.mockReturnValue({
            get: jest.fn().mockReturnValue(null),
        });
    });

    it("renders course name and description", () => {
        render(<CourseClientPage course={mockCourse} categoriesWithProblems={mockCategories} />);

        expect(screen.getByText("Python Basics")).toBeInTheDocument();
        expect(screen.getByText("Learn the fundamentals of Python")).toBeInTheDocument();
    });

    it("renders category and problems", () => {
        render(<CourseClientPage course={mockCourse} categoriesWithProblems={mockCategories} />);

        expect(screen.getByText("Intro")).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: "Problem 1" })).toBeInTheDocument();
    });

    it("opens category passed via search param", () => {
        mockUseSearchParams.mockReturnValue({
            get: jest.fn().mockImplementation((key) => (key === "category" ? "2" : null)),
        });

        render(<CourseClientPage course={mockCourse} categoriesWithProblems={mockCategories} />);
        expect(screen.getByRole('heading', { name: "Add Two Numbers" })).toBeInTheDocument();
    });

    it("clicking problem sets it active", () => {
        render(<CourseClientPage course={mockCourse} categoriesWithProblems={mockCategories} />);

        const problemButton = screen.getByText("Add Two Numbers");
        fireEvent.click(problemButton);

        expect(problemButton).toHaveClass("font-medium"); // active styling
    });
});
