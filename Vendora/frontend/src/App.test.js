import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Hero from "./components/Route/Hero/Hero";

test("renders the Vendora home hero", () => {
  render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>
  );
  expect(screen.getByRole("region", { name: /welcome to vendora/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Shop Now" })).toHaveAttribute("href", "/products");
});
