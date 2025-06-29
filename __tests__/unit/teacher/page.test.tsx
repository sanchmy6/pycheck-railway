jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));
jest.mock("@/app/teacher/actions", () => ({
    authenticateTeacher: jest.fn(),
    validateAuthToken: jest.fn(),
}));
jest.mock("@/app/teacher/utils", () => ({
    checkExistingAuth: jest.fn(),
    notifyAuthStateChanged: jest.fn(),
}));

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import TeacherLoginPage from "@/app/teacher/page";
import { useRouter } from "next/navigation";
import * as actions from "@/app/teacher/actions";
import * as utils from "@/app/teacher/utils";


describe("TeacherLoginPage", () => {
    const pushMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
        sessionStorage.clear();
    });

    it("renders login form", async () => {
        (utils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: false });
        (actions.validateAuthToken as jest.Mock).mockResolvedValue({ success: false });

        render(<TeacherLoginPage />);

        await waitFor(() => {
            expect(screen.getByText(/Admin Access/i)).toBeInTheDocument();
        });

        expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    });

    it("redirects if already authenticated", async () => {
        (utils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: true, token: "valid-token" });
        (actions.validateAuthToken as jest.Mock).mockResolvedValue({ success: true });

        render(<TeacherLoginPage />);
        await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/teacher/overview"));
    });

    it("shows error if authentication fails", async () => {
        (utils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: false });
        (actions.authenticateTeacher as jest.Mock).mockResolvedValue({ success: false, error: "Invalid password" });

        render(<TeacherLoginPage />);
        await waitFor(() => screen.getByLabelText(/Password/i));

        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: "wrong-password" },
        });

        fireEvent.submit(screen.getByTestId("teacher-login-form"));

        await waitFor(() => {
            expect(screen.getByText(/Invalid password/)).toBeInTheDocument();
        });
    });

    it("authenticates and redirects successfully", async () => {
        (utils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: false });
        (actions.authenticateTeacher as jest.Mock).mockResolvedValue({ success: true, token: "abc123" });

        const setItemMock = jest.spyOn(window.sessionStorage.__proto__, "setItem");

        jest.useFakeTimers();

        render(<TeacherLoginPage />);
        await waitFor(() => screen.getByLabelText(/Password/i));

        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: "correct-password" },
        });

        fireEvent.submit(screen.getByTestId("teacher-login-form"));

        await waitFor(() => {
            expect(screen.getByText(/Logged in successfully/i)).toBeInTheDocument();
        });

        expect(setItemMock).toHaveBeenCalledWith("teacher_token", "abc123");
        expect(utils.notifyAuthStateChanged).toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(pushMock).toHaveBeenCalledWith("/teacher/overview");

        jest.useRealTimers();
    });

    it("shows generic error on thrown exception", async () => {
        (utils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: false });
        (actions.authenticateTeacher as jest.Mock).mockRejectedValue(new Error("Unexpected"));

        render(<TeacherLoginPage />);
        await waitFor(() => screen.getByLabelText(/Password/i));

        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: "crash" },
        });

        fireEvent.submit(screen.getByTestId("teacher-login-form"));

        await waitFor(() => {
            expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
        });
    });
});