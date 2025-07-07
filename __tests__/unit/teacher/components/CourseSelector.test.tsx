import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CourseSelector } from "@/app/teacher/components/CourseSelector";

describe("CourseSelector", () => {
    const mockOnCourseChange = jest.fn();
    const mockOnCreateCourse = jest.fn();
    const sampleCourses = [
        { id: 1, name: "Math" },
        { id: 2, name: "Science" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders course select by default", () => {
        render(
            <CourseSelector
                courses={sampleCourses}
                selectedCourseId="2"
                onCourseChange={mockOnCourseChange}
                onCreateCourse={mockOnCreateCourse}
            />
        );

        expect(screen.getByLabelText(/Course \*/i)).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Math" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Science" })).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toHaveValue("2");
    });

    it("calls onCourseChange when selection changes", () => {
        render(
            <CourseSelector
                courses={sampleCourses}
                selectedCourseId=""
                onCourseChange={mockOnCourseChange}
                onCreateCourse={mockOnCreateCourse}
            />
        );

        fireEvent.change(screen.getByLabelText(/Course/i), {
            target: { value: "1" },
        });
        expect(mockOnCourseChange).toHaveBeenCalledWith("1");
    });

    it("toggles to creation mode when 'Create new' is clicked", () => {
        render(
            <CourseSelector
                courses={sampleCourses}
                selectedCourseId="2"
                onCourseChange={mockOnCourseChange}
                onCreateCourse={mockOnCreateCourse}
            />
        );

        fireEvent.click(screen.getByText(/Create new/i));
        expect(screen.getByPlaceholderText(/Enter new course name/i)).toBeInTheDocument();
        expect(mockOnCourseChange).toHaveBeenCalledWith("");
    });

    it("shows validation errors when fields are invalid", async () => {
        render(
            <CourseSelector
                courses={sampleCourses}
                selectedCourseId=""
                onCourseChange={mockOnCourseChange}
                onCreateCourse={mockOnCreateCourse}
            />
        );

        fireEvent.click(screen.getByText(/Create new/i));
        fireEvent.change(screen.getByPlaceholderText(/Enter new course name/i), { target: { value: "" } });
        fireEvent.keyPress(screen.getByPlaceholderText(/Enter new course name/i), { key: "Enter", code: "Enter", charCode: 13 });
        expect(await screen.findByText(/Course name is required/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Enter new course name/i), {
            target: { value: "Hi" },
        });
        fireEvent.keyPress(screen.getByPlaceholderText(/Enter new course name/i), { key: "Enter", code: "Enter", charCode: 13 });
        expect(await screen.findByText(/at least 3 characters/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Enter new course name/i), {
            target: { value: "A".repeat(101) },
        });
        fireEvent.keyPress(screen.getByPlaceholderText(/Enter new course name/i), { key: "Enter", code: "Enter", charCode: 13 });
        expect(await screen.findByText(/less than 100 characters/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Enter new course name/i), {
            target: { value: "Valid Course" },
        });
        fireEvent.keyPress(screen.getByPlaceholderText(/Enter new course name/i), { key: "Enter", code: "Enter", charCode: 13 });
        expect(await screen.findByText(/Course description is required/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Enter course description/i), {
            target: { value: "Too short" },
        });
        fireEvent.keyPress(screen.getByPlaceholderText(/Enter course description/i), { key: "Enter", code: "Enter", charCode: 13 });
        fireEvent.click(screen.getByRole("button", { name: /Create Course/i }));
        expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument();
    });

    it("submits valid course creation", async () => {
        mockOnCreateCourse.mockResolvedValue({
            success: true,
            course: { id: 3, name: "New Course" },
        });

        render(
            <CourseSelector
                courses={sampleCourses}
                selectedCourseId=""
                onCourseChange={mockOnCourseChange}
                onCreateCourse={mockOnCreateCourse}
            />
        );

        fireEvent.click(screen.getByText(/Create new/i));
        fireEvent.change(screen.getByPlaceholderText(/Enter new course name/i), {
            target: { value: "My Course" },
        });
        fireEvent.keyPress(screen.getByPlaceholderText(/Enter new course name/i), { key: "Enter", code: "Enter", charCode: 13 });
        fireEvent.change(screen.getByPlaceholderText(/Enter course description/i), {
            target: { value: "This is a great course." },
        });
        fireEvent.click(screen.getByRole("button", { name: /Create Course/i }));

        await waitFor(() => {
            expect(mockOnCreateCourse).toHaveBeenCalledWith("My Course", "This is a great course.");
            expect(mockOnCourseChange).toHaveBeenCalledWith("3");
        });
    });

    it("shows error if create fails", async () => {
        mockOnCreateCourse.mockResolvedValue({
            success: false,
            error: "Server error",
        });

        render(
            <CourseSelector
                courses={sampleCourses}
                selectedCourseId=""
                onCourseChange={mockOnCourseChange}
                onCreateCourse={mockOnCreateCourse}
            />
        );

        fireEvent.click(screen.getByText(/Create new/i));
        fireEvent.change(screen.getByPlaceholderText(/Enter new course name/i), {
            target: { value: "Fail Course" },
        });
        fireEvent.keyPress(screen.getByPlaceholderText(/Enter new course name/i), { key: "Enter", code: "Enter", charCode: 13 });
        fireEvent.change(screen.getByPlaceholderText(/Enter course description/i), {
            target: { value: "Valid long description." },
        });
        fireEvent.click(screen.getByRole("button", { name: /Create Course/i }));


        expect(await screen.findByText(/Server error/i)).toBeInTheDocument();
    });
});
