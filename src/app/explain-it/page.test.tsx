import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import ExplainItPage from "./page";

describe("ExplainItPage A11y", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<ExplainItPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
