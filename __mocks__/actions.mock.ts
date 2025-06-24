export const getProblemById = jest.fn().mockResolvedValue({
    id: "1",
    title: "Mock Problem",
    content: "Mock content",
    correctLinesCount: 2,
});

export const getProblemHint = jest.fn().mockResolvedValue({ hint: "Mock hint" });

export const evaluateProblemSelection = jest.fn().mockResolvedValue({
    success: true,
    isCorrect: true,
});