import React from "react";
import { render, screen } from "@testing-library/react";
import FormulaireEnregiStudio from "./FormulaireEnregiStudio";
import { SnackbarContext } from "./SnackBar"; // ajuste selon ton chemin

const mockSnackbar = { showSnackbar: jest.fn() };

const Wrapper = ({ children }) => (
  <SnackbarContext.Provider value={mockSnackbar}>
    {children}
  </SnackbarContext.Provider>
);

test("le formulaire se rend correctement", () => {
  render(<FormulaireEnregiStudio />, { wrapper: Wrapper });
  expect(screen.getByText(/ajouter un studio/i)).toBeInTheDocument();
});
