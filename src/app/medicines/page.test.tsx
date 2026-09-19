import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import MedicinesPage from "./page";

describe("MedicinesPage A11y", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<MedicinesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
