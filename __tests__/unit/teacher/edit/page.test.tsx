jest.mock("@/app/teacher/actions", () => ({
    getCourses: jest.fn(),
}));

jest.mock("@/app/teacher/edit/problem/[id]/EditProblemClient", () => ({
    EditProblemClient: jest.fn((props) => {
        return <div>Mocked EditProblemClient - {props.problemId}</div>;
    }),
}));

import { render, screen } from "@testing-library/react";
import EditProblemPage from "@/app/teacher/edit/problem/[id]/page";
import { getCourses } from "@/app/teacher/actions";

describe("EditProblemPage", () => {
    it("renders EditProblemClient with correct props", async () => {
        const mockCourses = [{ id: 1, name: "Course A" }];
        (getCourses as jest.Mock).mockResolvedValueOnce(mockCourses);

        const pageParams = Promise.resolve({ id: "123" });

        const PageComponent = await EditProblemPage({ params: pageParams });

        render(PageComponent);

        expect(getCourses).toHaveBeenCalled();

        expect(await screen.findByText("Mocked EditProblemClient - 123")).toBeInTheDocument();
    });
});

