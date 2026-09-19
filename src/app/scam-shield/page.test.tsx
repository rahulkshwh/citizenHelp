import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import ScamShieldPage from "./page";

describe("ScamShieldPage A11y", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<ScamShieldPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
