import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import FamilyPage from "./page";

describe("FamilyPage A11y", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<FamilyPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
