import { render, screen, fireEvent } from "@testing-library/react";
import { ImportHelpWindow } from "@/app/teacher/components/ImportHelpWindow";

describe("ImportHelpWindow", () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("does not render when isOpen is false", () => {
        const { container } = render(<ImportHelpWindow isOpen={false} onClose={mockOnClose} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders when isOpen is true", () => {
        render(<ImportHelpWindow isOpen={true} onClose={mockOnClose} />);
        expect(screen.getByText(/Google Sheets Import Help/i)).toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", () => {
        render(<ImportHelpWindow isOpen={true} onClose={mockOnClose} />);
        const closeButton = screen.getAllByRole("button")[0]; // First button (top right X)
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("renders Overview tab content by default", () => {
        render(<ImportHelpWindow isOpen={true} onClose={mockOnClose} />);
        expect(screen.getByText(/How It Works/i)).toBeInTheDocument();
        expect(screen.getByText(/Quick Start/i)).toBeInTheDocument();
    });

    it("switches to Setup tab when clicked", () => {
        render(<ImportHelpWindow isOpen={true} onClose={mockOnClose} />);
        fireEvent.click(screen.getByText(/Setup/i));
        expect(screen.getByText(/Environment Variable/i)).toBeInTheDocument();
        expect(screen.getByText(/Make Sheet Public/i)).toBeInTheDocument();
    });
});
