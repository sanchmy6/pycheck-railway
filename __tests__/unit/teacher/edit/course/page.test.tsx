jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(),
}));

jest.mock("@/app/teacher/actions", () => ({
    getCourseById: jest.fn(),
    updateCourseAction: jest.fn(),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditCoursePage from "@/app/teacher/edit/course/[id]/page";
import { useRouter, useParams } from "next/navigation";
import { getCourseById, updateCourseAction } from "@/app/teacher/actions";

const mockPush = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue({ id: "1" });

    Object.defineProperty(window, "sessionStorage", {
        value: {
            getItem: jest.fn(() => "mock-token"),
        },
        writable: true,
    });
});

const mockCourse = {
    success: true,
    course: {
        name: "Algebra",
        description: "An advanced math course",
    },
};

describe("EditCoursePage", () => {
    it("renders loading initially", async () => {
        (getCourseById as jest.Mock).mockResolvedValue(mockCourse);

        render(<EditCoursePage />);
        expect(screen.getByText(/Loading course/i)).toBeInTheDocument();
        await screen.findByDisplayValue("Algebra");
    });

    it("loads course data and populates fields", async () => {
        (getCourseById as jest.Mock).mockResolvedValue(mockCourse);

        render(<EditCoursePage />);
        expect(await screen.findByDisplayValue("Algebra")).toBeInTheDocument();
        expect(await screen.findByDisplayValue("An advanced math course")).toBeInTheDocument();
    });

    it("shows error if description is too short", async () => {
        (getCourseById as jest.Mock).mockResolvedValue(mockCourse);

        render(<EditCoursePage />);
        const descriptionInput = await screen.findByLabelText(/Description/i);
        fireEvent.change(descriptionInput, { target: { value: "short" } });

        fireEvent.click(screen.getByRole("button", { name: /Update Course/i }));

        expect(await screen.findByText("Course description must be at least 10 characters long")).toBeInTheDocument();
    });

    it("submits and redirects on success", async () => {
        jest.useFakeTimers();

        (getCourseById as jest.Mock).mockResolvedValue(mockCourse);
        (updateCourseAction as jest.Mock).mockResolvedValue({ success: true });

        render(<EditCoursePage />);
        await screen.findByDisplayValue("Algebra");

        fireEvent.click(screen.getByRole("button", { name: /Update Course/i }));

        expect(await screen.findByText("Course updated successfully!")).toBeInTheDocument();

        jest.advanceTimersByTime(1500);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/teacher/overview");
        });

        jest.useRealTimers();

        // await waitFor(() => {
        //     expect(screen.getByText("Course updated successfully!")).toBeInTheDocument();
        // });
        //
        // await waitFor(() => {
        //     expect(mockPush).toHaveBeenCalledWith("/teacher/overview");
        // });
    });

    it("shows error if update fails", async () => {
        (getCourseById as jest.Mock).mockResolvedValue(mockCourse);
        (updateCourseAction as jest.Mock).mockResolvedValue({
            success: false,
            error: "Failed to update",
        });

        render(<EditCoursePage />);
        await screen.findByDisplayValue("Algebra");

        fireEvent.click(screen.getByRole("button", { name: /Update Course/i }));

        expect(await screen.findByText("Failed to update")).toBeInTheDocument();
    });

    it("redirects if no auth token", async () => {
        (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
        render(<EditCoursePage />);
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/teacher");
        });
    });
});
