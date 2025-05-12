import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReservationForm from "./FormulaireReservation"; 
import { useSnackbar } from './SnackBar'; 

jest.mock('./SnackBar');

// Mock de useSnackbar
const mockShowSnackbar = jest.fn();
useSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });

describe("FormulaireReservation", () => {
  // Test 1: Vérification du rendu du formulaire
  test("should render the reservation form", () => {
    render(<ReservationForm 
      reservation={{}} 
      setReservation={() => {}} 
      prixMin={0} 
      prixMax={1000} 
      noteMin={0} 
      selectedEquipements={[]} 
    />);
    
    expect(screen.getByLabelText(/Votre nom/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Choisir un studio/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date de réservation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de personnes/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heure de début/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heure de fin/)).toBeInTheDocument();
  });

  // Test 2: Vérification des appels API pour récupérer les studios et utilisateurs
  test("should fetch and display studios and users", async () => {
    render(<ReservationForm 
      reservation={{}} 
      setReservation={() => {}} 
      prixMin={0} 
      prixMax={1000} 
      noteMin={0} 
      selectedEquipements={[]} 
    />);
    
    await waitFor(() => {
      expect(screen.getByText("Studio 1")).toBeInTheDocument();
      expect(screen.getByText("Studio 2")).toBeInTheDocument();
    });
  });
  
  // Test 3: Vérification que la fonction showSnackbar est appelée correctement
  test("should call showSnackbar on submit", async () => {
    render(<ReservationForm 
      reservation={{}} 
      setReservation={() => {}} 
      prixMin={0} 
      prixMax={1000} 
      noteMin={0} 
      selectedEquipements={[]} 
    />);
    
    fireEvent.submit(screen.getByTestId("form-reservation"));
    
    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalled();
    });
  });
});
