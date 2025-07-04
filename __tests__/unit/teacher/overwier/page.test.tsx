jest.mock("@/app/teacher/actions", () => ({
    getCoursesWithStats: jest.fn(),
}));

jest.mock("@/app/teacher/overview/TeacherClient", () => ({
    TeacherClient: jest.fn((props) => {
        return <div>Mocked TeacherClient - {props.initialCourses?.[0]?.name}</div>;
    }),
}));

import { render, screen } from "@testing-library/react";
import TeacherOverviewPage from "@/app/teacher/overview/page";
import { getCoursesWithStats } from "@/app/teacher/actions";

describe("TeacherOverviewPage", () => {
    it("fetches courses and renders TeacherClient with them", async () => {
        const mockCourses = [{ id: 1, name: "Course A" }];
        (getCoursesWithStats as jest.Mock).mockResolvedValueOnce(mockCourses);

        const PageComponent = await TeacherOverviewPage();
        render(PageComponent);

        expect(getCoursesWithStats).toHaveBeenCalled();

        expect(await screen.findByText("Mocked TeacherClient - Course A")).toBeInTheDocument();
    });
});