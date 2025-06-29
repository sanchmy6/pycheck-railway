jest.mock("@/components/Header", () => () => <header data-testid="header">Mock Header</header>);
jest.mock("@/app/providers/QueryProvider", () => ({
    QueryProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="query-provider">{children}</div>,
}));

import RootLayout from "@/app/layout";

describe("RootLayout", () => {
    it("includes correct html attributes", () => {
        const tree = RootLayout({ children: <div /> });
        expect(tree.props.lang).toBe("en");
        expect(tree.props["data-theme"]).toBe("light");
    });
});
