jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

jest.mock("@/app/teacher/utils", () => ({
    checkExistingAuth: jest.fn(),
    notifyAuthStateChanged: jest.fn(),
}));

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Header from "@/components/Header";
import * as authUtils from "@/app/teacher/utils";
import { useRouter } from "next/navigation";

describe("Header", () => {
    const push = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push });
        (authUtils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: false });
        jest.clearAllMocks();
    });

    it("renders and toggles theme", () => {
        render(<Header />);
        const themeButton = screen.getByRole("button", { name: /Switch to dark mode|light mode/i });

        fireEvent.click(themeButton);
        expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

        fireEvent.click(themeButton);
        expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });


    it("redirects to /teacher if not authenticated", () => {
        (authUtils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: false });

        render(<Header />);
        const loginButton = screen.getByRole("button", { name: /Teacher Login/i });

        fireEvent.click(loginButton);
        expect(push).toHaveBeenCalledWith("/teacher");
    });

    it("shows user menu when authenticated and toggles it", () => {
        (authUtils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: true });

        render(<Header />);
        const userMenuBtn = screen.getByRole("button", { name: /User Menu/i });

        fireEvent.click(userMenuBtn);
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("performs logout", async () => {
        (authUtils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: true });
        render(<Header />);

        const userMenuBtn = screen.getByRole("button", { name: /User Menu/i });
        fireEvent.click(userMenuBtn);

        const logoutButton = screen.getByText("Logout");
        fireEvent.click(logoutButton);

        expect(sessionStorage.getItem("teacher_token")).toBeNull();
        expect(authUtils.notifyAuthStateChanged).toHaveBeenCalled();
        expect(push).toHaveBeenCalledWith("/");

        await waitFor(() => {
            expect(screen.getByText("Logged out successfully")).toBeInTheDocument();
        });
    });

    it("initializes toggle state based on existing dark theme", () => {
        document.documentElement.setAttribute("data-theme", "dark");
        render(<Header />);
        const themeButton = screen.getByRole("button", { name: /Switch to light mode/i });
        expect(themeButton).toBeInTheDocument();
    });

    it("hides logout message after 2 seconds", async () => {
        jest.useFakeTimers();

        (authUtils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: true });
        render(<Header />);

        fireEvent.click(screen.getByRole("button", { name: /User Menu/i }));
        fireEvent.click(screen.getByText("Logout"));

        expect(screen.getByText("Logged out successfully")).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(screen.queryByText("Logged out successfully")).not.toBeInTheDocument();
        });

        jest.useRealTimers();
    });

    it("closes user menu when clicking outside", () => {
        (authUtils.checkExistingAuth as jest.Mock).mockReturnValue({ isValid: true });
        render(<Header />);

        fireEvent.click(screen.getByRole("button", { name: /User Menu/i }));
        expect(screen.getByText("Logout")).toBeInTheDocument();

        fireEvent.mouseDown(document.body);
        expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });
});