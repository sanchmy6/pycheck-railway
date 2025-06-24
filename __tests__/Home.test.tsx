import { render, screen } from '@testing-library/react'
import { CourseClientPage } from '@/app/courses/[id]/CourseClientPage'

jest.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams("category=1"),
}));

describe('CourseClientPage', () => {
    it('renders course name and description', () => {
        render(
            <CourseClientPage
                course={{ name: "Test Course", description: "Test Description" }}
                categoriesWithProblems={[]}
            />
        );

        expect(screen.getByText("Test Course")).toBeInTheDocument();
        expect(screen.getByText("Test Description")).toBeInTheDocument();
    });
});
