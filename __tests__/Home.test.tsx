import { render, screen } from '@testing-library/react'
import { HomeClient } from '@/app/HomeClient'

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe('HomeClient', () => {
  const mockActiveCourses = [
    {
      id: 1,
      name: "Test Course",
      description: "Test Description",
      status: "Active"
    }
  ];

  const mockArchivedCourses = [
    {
      id: 2,
      name: "Archived Course", 
      description: "Archived Description",
      status: "Archived"
    }
  ];

  it('renders page title', () => {
    render(
      <HomeClient
        activeCourses={mockActiveCourses}
        archivedCourses={mockArchivedCourses}
      />
    );

    expect(screen.getByText("Welcome to PyCheck")).toBeInTheDocument();
  });

  it('renders active courses', () => {
    render(
      <HomeClient
        activeCourses={mockActiveCourses}
        archivedCourses={mockArchivedCourses}
      />
    );

    expect(screen.getByText("Test Course")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it('shows empty state when no courses', () => {
    render(
      <HomeClient
        activeCourses={[]}
        archivedCourses={[]}
      />
    );

    expect(screen.getByText("Getting Ready for Launch!")).toBeInTheDocument();
  });
});
