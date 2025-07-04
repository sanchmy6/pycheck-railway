jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(),
}));
jest.mock("@/app/teacher/actions", () => ({
    getCategoryByIdOptimized: jest.fn(),
    getCourses: jest.fn(),
    updateCategoryAction: jest.fn(),
}));

import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import EditCategoryPage from "@/app/teacher/edit/category/[id]/page";
import { useRouter, useParams } from "next/navigation";
import {
    getCategoryByIdOptimized,
    getCourses,
    updateCategoryAction,
} from "@/app/teacher/actions";

const mockPush = jest.fn();
const mockCategory = {
    success: true,
    category: { name: "Math", courseId: 2 },
};
const mockCourses = [
    { id: 1, name: "History" },
    { id: 2, name: "Science" },
];

describe("EditCategoryPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useParams as jest.Mock).mockReturnValue({ id: "42" });
        sessionStorage.setItem("teacher_token", "mock-token");
    });

    it("renders loading state initially", async () => {
        (getCategoryByIdOptimized as jest.Mock).mockResolvedValue(mockCategory);
        (getCourses as jest.Mock).mockResolvedValue(mockCourses);

        const { container } = render(<EditCategoryPage />);
        expect(container).toHaveTextContent("Loading category...");
        await screen.findByDisplayValue("Math");
    });

    it("redirects if no token found", async () => {
        sessionStorage.removeItem("teacher_token");

        render(<EditCategoryPage />);
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/teacher");
        });
    });

    it("loads data and populates form fields", async () => {
        (getCategoryByIdOptimized as jest.Mock).mockResolvedValue(mockCategory);
        (getCourses as jest.Mock).mockResolvedValue(mockCourses);

        render(<EditCategoryPage />);

        expect(await screen.findByDisplayValue("Math")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Science")).toBeInTheDocument();
    });

    it("submits form and shows success message", async () => {
        (getCategoryByIdOptimized as jest.Mock).mockResolvedValue(mockCategory);
        (getCourses as jest.Mock).mockResolvedValue(mockCourses);
        (updateCategoryAction as jest.Mock).mockResolvedValue({ success: true });

        render(<EditCategoryPage />);
        const nameInput = await screen.findByLabelText(/Category Name/i);
        fireEvent.change(nameInput, { target: { value: "Updated Name" } });

        const submitButton = await screen.findByRole("button", { name: /Update Category/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Category updated successfully!")).toBeInTheDocument();
        });
    });

    it("shows error message if update fails", async () => {
        (getCategoryByIdOptimized as jest.Mock).mockResolvedValue(mockCategory);
        (getCourses as jest.Mock).mockResolvedValue(mockCourses);
        (updateCategoryAction as jest.Mock).mockResolvedValue({ success: false, error: "Update failed" });

        render(<EditCategoryPage />);
        const submitButton = await screen.findByRole("button", { name: /Update Category/i });
        fireEvent.click(submitButton);

        await screen.findByText("Update failed");
    });

    it("shows error if fetching category fails", async () => {
        (getCategoryByIdOptimized as jest.Mock).mockResolvedValue({ success: false, error: "Not found" });
        (getCourses as jest.Mock).mockResolvedValue(mockCourses);

        render(<EditCategoryPage />);
        await screen.findByText("Not found");
    });
});
