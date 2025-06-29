import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CategorySelector } from "@/app/teacher/components/CategorySelector";

describe("CategorySelector", () => {
    const mockCategories = [
        { id: 1, name: "Math" },
        { id: 2, name: "Science" },
    ];

    const onCategoryChange = jest.fn();
    const onCreateCategory = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders select with categories", () => {
        render(
            <CategorySelector
                categories={mockCategories}
                selectedCategoryId="2"
                onCategoryChange={onCategoryChange}
                onCreateCategory={onCreateCategory}
            />
        );

        expect(screen.getByLabelText(/Category \*/i)).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Math" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Science" })).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toHaveValue("2");
    });

    it("calls onCategoryChange when select changes", () => {
        render(
            <CategorySelector
                categories={mockCategories}
                selectedCategoryId=""
                onCategoryChange={onCategoryChange}
                onCreateCategory={onCreateCategory}
            />
        );

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
        expect(onCategoryChange).toHaveBeenCalledWith("1");
    });

    it("toggles to create mode and back", () => {
        render(
            <CategorySelector
                categories={mockCategories}
                selectedCategoryId=""
                onCategoryChange={onCategoryChange}
                onCreateCategory={onCreateCategory}
            />
        );

        const toggleButton = screen.getByRole("button", { name: /Create new/i });
        fireEvent.click(toggleButton);

        expect(screen.getByPlaceholderText(/Enter new category name/i)).toBeInTheDocument();
        expect(onCategoryChange).toHaveBeenCalledWith(""); // reset selection

        fireEvent.click(screen.getByRole("button", { name: /Select existing/i }));
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("shows error if input is empty", async () => {
        render(
            <CategorySelector
                categories={mockCategories}
                selectedCategoryId=""
                onCategoryChange={onCategoryChange}
                onCreateCategory={onCreateCategory}
            />
        );

        fireEvent.click(screen.getByText("Create new"));
        fireEvent.change(screen.getByPlaceholderText(/Enter new category name/i), { target: { value: "" } });
        fireEvent.keyPress(screen.getByPlaceholderText(/Enter new category name/i), { key: "Enter", code: "Enter", charCode: 13 });

        expect(await screen.findByText(/Category name is required/i)).toBeInTheDocument();
    });

    it("validates input length", async () => {
        render(
            <CategorySelector
                categories={mockCategories}
                selectedCategoryId=""
                onCategoryChange={onCategoryChange}
                onCreateCategory={onCreateCategory}
            />
        );

        fireEvent.click(screen.getByText("Create new"));

        fireEvent.change(screen.getByPlaceholderText(/Enter new category name/i), {
            target: { value: "a" },
        });
        fireEvent.click(screen.getByText("Create"));
        expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Enter new category name/i), {
            target: { value: "a".repeat(51) },
        });
        fireEvent.click(screen.getByText("Create"));
        expect(await screen.findByText(/less than 50 characters/i)).toBeInTheDocument();
    });

    it("successfully creates a category", async () => {
        onCreateCategory.mockResolvedValue({
            success: true,
            category: { id: 3, name: "New Cat" },
        });

        render(
            <CategorySelector
                categories={mockCategories}
                selectedCategoryId=""
                onCategoryChange={onCategoryChange}
                onCreateCategory={onCreateCategory}
            />
        );

        fireEvent.click(screen.getByText("Create new"));
        fireEvent.change(screen.getByPlaceholderText(/Enter new category name/i), {
            target: { value: "New Cat" },
        });
        fireEvent.click(screen.getByText("Create"));

        await waitFor(() => {
            expect(onCreateCategory).toHaveBeenCalledWith("New Cat");
            expect(onCategoryChange).toHaveBeenCalledWith("3");
        });
    });

    it("shows error on create failure", async () => {
        onCreateCategory.mockResolvedValue({
            success: false,
            error: "Already exists",
        });

        render(
            <CategorySelector
                categories={mockCategories}
                selectedCategoryId=""
                onCategoryChange={onCategoryChange}
                onCreateCategory={onCreateCategory}
            />
        );

        fireEvent.click(screen.getByText("Create new"));
        fireEvent.change(screen.getByPlaceholderText(/Enter new category name/i), {
            target: { value: "New Cat" },
        });
        fireEvent.click(screen.getByText("Create"));

        expect(await screen.findByText(/Already exists/)).toBeInTheDocument();
    });

    it("shows fallback error on thrown exception", async () => {
        onCreateCategory.mockRejectedValue(new Error("Server error"));

        render(
            <CategorySelector
                categories={mockCategories}
                selectedCategoryId=""
                onCategoryChange={onCategoryChange}
                onCreateCategory={onCreateCategory}
            />
        );

        fireEvent.click(screen.getByText("Create new"));
        fireEvent.change(screen.getByPlaceholderText(/Enter new category name/i), {
            target: { value: "New Cat" },
        });
        fireEvent.click(screen.getByText("Create"));

        expect(await screen.findByText(/unexpected error/i)).toBeInTheDocument();
    });

    it("respects disabled prop", () => {
        render(
            <CategorySelector
                categories={mockCategories}
                selectedCategoryId=""
                onCategoryChange={onCategoryChange}
                onCreateCategory={onCreateCategory}
                disabled
            />
        );

        const select = screen.getByRole("combobox");
        expect(select).toBeDisabled();

        const button = screen.getByRole("button", { name: /Create new/i });
        expect(button).toBeDisabled();
    });
});
