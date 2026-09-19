import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import TodayPage from "./page";

describe("TodayPage A11y", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<TodayPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
