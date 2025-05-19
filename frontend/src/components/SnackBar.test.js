import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SnackbarProvider, useSnackbar } from "./SnackBar";
import { act } from "react";

// Un composant de test pour déclencher l'affichage du snackbar
const TestComponent = () => {
  const { showSnackbar } = useSnackbar();

  return (
    <div>
      <button onClick={() => showSnackbar("Test Message", "success")}>
        Show Snackbar
      </button>
    </div>
  );
};

const severities = ["success", "error", "warning", "info"];

describe("SnackbarProvider", () => {
  it("fournit le contexte sans erreur", () => {
    render(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>
    );

    expect(screen.getByText("Show Snackbar")).toBeInTheDocument();
  });

  it("affiche le snackbar avec un message et une sévérité", async () => {
    render(
        <SnackbarProvider>
        <TestComponent />
        </SnackbarProvider>
    );

    fireEvent.click(screen.getByText("Show Snackbar"));

    const alert = await screen.findByRole("alert"); // plus fiable que findByText
    expect(alert).toHaveTextContent("Test Message");
  });



  it("ferme automatiquement le snackbar après 3 secondes", async () => {
    jest.useFakeTimers();

    render(
        <SnackbarProvider>
        <TestComponent />
        </SnackbarProvider>
    );

    fireEvent.click(screen.getByText("Show Snackbar"));
    expect(await screen.findByText("Test Message")).toBeInTheDocument();

    await act(async () => {
        jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
        expect(screen.queryByText("Test Message")).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });


  it("ferme le snackbar manuellement en cliquant sur la croix", async () => {
    render(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>
    );

    fireEvent.click(screen.getByText("Show Snackbar"));
    const closeButton = await screen.findByRole("button", { name: /close/i });

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Test Message")).not.toBeInTheDocument();
    });
  });
});

severities.forEach((severity) => {
  it(`affiche un snackbar avec la sévérité "${severity}"`, async () => {
    const TestComponent = () => {
      const { showSnackbar } = useSnackbar();
      return (
        <button onClick={() => showSnackbar(`Message ${severity}`, severity)}>
          Show {severity}
        </button>
      );
    };

    render(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>
    );

    fireEvent.click(screen.getByText(`Show ${severity}`));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(`Message ${severity}`);
  });
});

it("remplace l'ancien message si un nouveau est déclenché", async () => {
  const TestComponent = () => {
    const { showSnackbar } = useSnackbar();
    return (
      <>
        <button onClick={() => showSnackbar("Premier message")}>First</button>
        <button onClick={() => showSnackbar("Deuxième message")}>Second</button>
      </>
    );
  };

  render(
    <SnackbarProvider>
      <TestComponent />
    </SnackbarProvider>
  );

  fireEvent.click(screen.getByText("First"));
  expect(await screen.findByText("Premier message")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Second"));
  expect(await screen.findByText("Deuxième message")).toBeInTheDocument();

  expect(screen.queryByText("Premier message")).not.toBeInTheDocument();
});

it("garde le snackbar visible si un nouveau message est affiché juste avant l’expiration", async () => {
  jest.useFakeTimers();
  const TestComponent = () => {
    const { showSnackbar } = useSnackbar();
    return <button onClick={() => showSnackbar("Message persistant")}>Show</button>;
  };

  render(
    <SnackbarProvider>
      <TestComponent />
    </SnackbarProvider>
  );

  fireEvent.click(screen.getByText("Show"));

  // On s'assure que le message est affiché
  await screen.findByText("Message persistant");

  // On simule presque la fin du timeout (2990ms)
  await act(async () => {
    jest.advanceTimersByTime(2990);
  });

  // On redéclenche un message juste avant que le premier ne disparaisse
  fireEvent.click(screen.getByText("Show"));

  // Il doit être encore visible
  await screen.findByText("Message persistant");

  // On attend encore 3000ms (pour tester si le timer a bien été "reset")
  await act(async () => {
    jest.advanceTimersByTime(3000);
  });

  // Le message doit maintenant avoir disparu
  await waitFor(() => {
    expect(screen.queryByText("Message persistant")).not.toBeInTheDocument();
  });
});

it("lance une erreur si useSnackbar est utilisé en dehors du provider", () => {
  const ConsoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  const Component = () => {
    const { showSnackbar } = useSnackbar(); // provoque une erreur si hors provider
    showSnackbar("Ceci devrait planter");
    return null;
  };

  expect(() => render(<Component />)).toThrow();

  ConsoleSpy.mockRestore();
});
