import { render, screen, waitFor } from "@testing-library/react";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { useQuery } from "@tanstack/react-query";

function TestComponent() {
    const { data, isLoading } = useQuery({
        queryKey: ["test"],
        queryFn: () => Promise.resolve("Hello from query"),
    });

    if (isLoading) return <div>Loading...</div>;
    return <div>{data}</div>;
}

describe("QueryProvider", () => {
    it("renders children correctly", async () => {
        render(
            <QueryProvider>
                <TestComponent />
            </QueryProvider>
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Hello from query")).toBeInTheDocument();
        });
    });
});
