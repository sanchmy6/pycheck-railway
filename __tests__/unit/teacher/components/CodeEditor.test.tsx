import { render, screen, fireEvent, cleanup  } from "@testing-library/react";
import { CodeEditor } from "@/app/teacher/components/CodeEditor";

class MockMutationObserver {
    observe() {}
    disconnect() {}
}

describe("CodeEditor", () => {
    const mockOnCodeChange = jest.fn();
    const mockOnLineSelectionChange = jest.fn();

    const codeSample = `print("Hello World")\nprint("Line 2")`;
    const originalTheme = document.documentElement.getAttribute("data-theme");
    const originalMutationObserver = global.MutationObserver;

    beforeEach(() => {
        jest.clearAllMocks();
        document.documentElement.setAttribute("data-theme", "dark");
        global.MutationObserver = MockMutationObserver as any;
    });

    afterEach(() => {
        cleanup();
        if (originalTheme) {
            document.documentElement.setAttribute("data-theme", originalTheme);
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
        global.MutationObserver = originalMutationObserver;
    });

    it("renders textarea and labels", () => {
        render(
            <CodeEditor
                code=""
                onCodeChange={mockOnCodeChange}
                selectedLines={[]}
                onLineSelectionChange={mockOnLineSelectionChange}
            />
        );

        expect(screen.getByLabelText(/Code Snippet/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your Python code here/i)).toBeInTheDocument();
    });

    it("calls onCodeChange on textarea change", () => {
        render(
            <CodeEditor
                code=""
                onCodeChange={mockOnCodeChange}
                selectedLines={[]}
                onLineSelectionChange={mockOnLineSelectionChange}
            />
        );

        const textarea = screen.getByPlaceholderText(/Enter your Python code here/i);
        fireEvent.change(textarea, { target: { value: "new code" } });

        expect(mockOnCodeChange).toHaveBeenCalledWith("new code");
    });

    it("displays selected problematic lines", () => {
        render(
            <CodeEditor
                code={codeSample}
                onCodeChange={mockOnCodeChange}
                selectedLines={[1, 2]}
                onLineSelectionChange={mockOnLineSelectionChange}
            />
        );

        expect(screen.getByText(/Selected problematic lines: 1, 2/i)).toBeInTheDocument();
    });

    it("toggles dark/light mode based on data-theme attribute", () => {
        render(
            <CodeEditor
                code={codeSample}
                onCodeChange={mockOnCodeChange}
                selectedLines={[]}
                onLineSelectionChange={mockOnLineSelectionChange}
            />
        );
        expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

        document.documentElement.setAttribute("data-theme", "light");
    });
});
