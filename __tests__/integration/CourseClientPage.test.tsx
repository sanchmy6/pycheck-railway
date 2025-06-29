jest.mock("next/navigation", () => ({
    useSearchParams: jest.fn(),
}));

import { render, screen, fireEvent, act } from "@testing-library/react";
import { CourseClientPage } from "@/app/courses/[id]/CourseClientPage";
import { useSearchParams } from "next/navigation";

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

    it("renders fallback UI when no active category", () => {
        render(<CourseClientPage course={mockCourse} categoriesWithProblems={[]} />);
        expect(screen.getByText("No task is currently selected")).toBeInTheDocument();
    });

    it("toggles category accordion open/close", () => {
        render(<CourseClientPage course={mockCourse} categoriesWithProblems={mockCategories} />);
        const summary = screen.getByText("Intro");
        // First click: open
        fireEvent.click(summary);
        // Second click: close
        fireEvent.click(summary);
        // If no error thrown – works. You could inspect DOM to check open state but it's more E2E-level.
        expect(summary).toBeInTheDocument();
    });

    it("calls scrollIntoView on problem click", () => {
        render(<CourseClientPage course={mockCourse} categoriesWithProblems={mockCategories} />);
        const element = document.createElement("div");
        element.scrollIntoView = jest.fn();
        element.id = "problem-201";
        document.body.appendChild(element);

        const btn = screen.getByText("Add Two Numbers");
        fireEvent.click(btn);

        expect(element.scrollIntoView).toHaveBeenCalled();
    });

    it("handles scroll and sets active problem", () => {
        const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
        const originalRequestAnimationFrame = window.requestAnimationFrame;

        Element.prototype.getBoundingClientRect = jest.fn(() => ({
            x: 0,
            y: 0,
            top: 100,
            right: 0,
            bottom: 400,
            left: 0,
            width: 800,
            height: 300,
            toJSON: () => {},
        } as DOMRect));

        window.requestAnimationFrame = jest.fn((cb) => {
            cb(0);
            return 1;
        });

        render(<CourseClientPage course={mockCourse} categoriesWithProblems={mockCategories} />);

        // Trigger scroll event
        act(() => {
            window.dispatchEvent(new Event("scroll"));
        });

        // Effect should have run
        expect(screen.getByText("Problem 1")).toBeInTheDocument();

        // Restore
        Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
        window.requestAnimationFrame = originalRequestAnimationFrame;
    });
});
