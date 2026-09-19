import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import AppShell from "./app-shell";

describe("AppShell A11y", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(
      <AppShell>
        <div>Test Content</div>
      </AppShell>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
