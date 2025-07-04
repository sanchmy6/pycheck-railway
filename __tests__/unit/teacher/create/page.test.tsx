jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

jest.mock("@/app/teacher/actions", () => ({
    getCourses: jest.fn(),
    getCategoriesByCourse: jest.fn(),
    createProblemAction: jest.fn(),
    createCategoryAction: jest.fn(),
    createCourseAction: jest.fn(),
}));

import { render, screen } from "@testing-library/react";
import CreateProblemPage from "@/app/teacher/create/page";
import * as actions from "@/app/teacher/actions";
import { useRouter } from "next/navigation";

const mockRouterPush = jest.fn();

describe("CreateProblemPage", () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
        sessionStorage.setItem("teacher_token", "fake_token");
    });

    afterEach(() => {
        sessionStorage.clear();
        jest.clearAllMocks();
    });

    it("renders the form when authenticated", async () => {
        (actions.getCourses as jest.Mock).mockResolvedValue([]);

        render(<CreateProblemPage />);

        expect(await screen.findByText(/Create New Problem/i)).toBeInTheDocument();
    });
});
