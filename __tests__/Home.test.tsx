//Written by ChatGPT and not working, shame on you ChatGPT

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock getCourses and Home for testing
jest.mock('@/app/courses', () => ({
    getCourses: jest.fn(),
}));

// Import after mocking
import { getCourses } from '@/app/courses/actions';
import Home from '@/app/page';

describe('Home', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders welcome headline', async () => {
        (getCourses as jest.Mock).mockResolvedValueOnce([]);
        render(<Home />);
        expect(await screen.findByText(/Welcome to PyCheck/i)).toBeInTheDocument();
    });

    it('shows course list when courses are available', async () => {
        (getCourses as jest.Mock).mockResolvedValueOnce([
            { id: 'python', name: 'Python Basics', description: 'Learn Python from scratch.' },
            { id: 'advanced', name: 'Advanced Python', description: 'Deep dive into Python.' },
        ]);
        render(<Home />);
        expect(await screen.findByText('Available Courses')).toBeInTheDocument();
        expect(await screen.findByText('Python Basics')).toBeInTheDocument();
        expect(await screen.findByText('Advanced Python')).toBeInTheDocument();
    });

    it('shows launch message when no courses are available', async () => {
        (getCourses as jest.Mock).mockResolvedValueOnce([]);
        render(<Home />);
        expect(await screen.findByText(/Getting Ready for Launch!/i)).toBeInTheDocument();
        expect(screen.getByText(/Check back soon for exciting programming challenges!/i)).toBeInTheDocument();
    });

    it('renders course description', async () => {
        (getCourses as jest.Mock).mockResolvedValueOnce([
            { id: 'python', name: 'Python Basics', description: 'Learn Python from scratch.' },
        ]);
        render(<Home />);
        expect(await screen.findByText('Learn Python from scratch.')).toBeInTheDocument();
    });

    it('renders interactive coding exercises feature', async () => {
        (getCourses as jest.Mock).mockResolvedValueOnce([]);
        render(<Home />);
        expect(await screen.findByText(/Interactive coding exercises/i)).toBeInTheDocument();
    });
});