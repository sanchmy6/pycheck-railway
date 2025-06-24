import { render, screen, fireEvent } from "@testing-library/react";
import { CodeSnippet } from "@/app/courses/components/CodeSnippet";
jest.mock("@/app/courses/actions", () => require("../../__mocks__/actions.mock"));

describe("CodeSnippet", () => {
    const sampleCode = `function greet() { return "Hello"; }`;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders code properly", async () => {
        render(<CodeSnippet code={sampleCode} language="javascript" problemId={1} />);

        expect(await screen.findByText(/function greet\(\)/)).toBeInTheDocument();
        expect(screen.getByText(/return "Hello"/)).toBeInTheDocument();
    });

    it("shows hint after clicking the hint button", async () => {
        render(<CodeSnippet code={sampleCode} language="javascript" problemId={1} />);

        const hintButton = await screen.findByRole("button", { name: /show hint/i });
        fireEvent.click(hintButton);

        expect(await screen.findByText("Mock hint")).toBeInTheDocument();
    });

    it("renders different code when props change", async () => {
        const { rerender } = render(
            <CodeSnippet code={"const a = 1;"} language="javascript" problemId={3} />
        );

        const firstCode = await screen.findByText("const a = 1;");
        expect(firstCode).toBeInTheDocument();

        rerender(
            <CodeSnippet code={"console.log('Hello');"} language="javascript" problemId={4} />
        );

        const secondCode = await screen.findByText("console.log('Hello');");
        expect(secondCode).toBeInTheDocument();

        expect(screen.queryByText("const a = 1;")).not.toBeInTheDocument();
    });

    it("does not allow submission with 0 selected lines", () => {
        render(
            <CodeSnippet
                code={`line1\nline2\nline3\nline4`}
                problemId={1}
                language="javascript"
                problemData={{ correctLinesCount: 2, hint: "" }}
            />
        );

        const submitButton = screen.queryByRole("button", { name: /submit selection/i });
        expect(submitButton).toBeNull();

        expect(screen.getByText(/select 2 lines to submit/i)).toBeInTheDocument();
    });

});
