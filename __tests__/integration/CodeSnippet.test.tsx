jest.mock("@/app/courses/actions", () => require("../../__mocks__/actions.mock"));

import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {CodeSnippet} from "@/app/courses/components/CodeSnippet";
import {getProblemHint} from "@/app/courses/actions";

const sampleCode = `line1\nline2\nline3\nline4`;

describe("CodeSnippet", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.documentElement.setAttribute("data-theme", "dark");
    });


    it("renders code properly", async () => {
        render(<CodeSnippet code={sampleCode} language="javascript" problemId={1} />);

        expect(await screen.findByText(/line1/)).toBeInTheDocument();
        expect(screen.getByText(/line3/)).toBeInTheDocument();
    });

    it("loads hint from API if not passed via props", async () => {
        (getProblemHint as jest.Mock).mockResolvedValueOnce({hint: "API hint"});

        render(
            <CodeSnippet
                code={sampleCode}
                problemId={1}
                problemData={{correctLinesCount: 2, hint: ""}}
            />
        );

        fireEvent.click(screen.getByRole("button", {name: /show hint/i}));
        expect(await screen.findByText("API hint")).toBeInTheDocument();
    });

    it("shows and hides hint from props", async () => {
        render(
            <CodeSnippet
                code={sampleCode}
                problemId={1}
                problemData={{ correctLinesCount: 2, hint: "Hint here" }}
            />
        );

        const btn = screen.getByRole("button", { name: /show hint/i });
        fireEvent.click(btn);
        expect(await screen.findByText("Hint here")).toBeInTheDocument();
        fireEvent.click(btn);
        expect(screen.queryByText("Hint here")).not.toBeInTheDocument();
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
                code={sampleCode}
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