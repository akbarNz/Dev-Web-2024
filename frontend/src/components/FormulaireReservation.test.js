// FormulaireReservation.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ReservationForm from './FormulaireReservation';
import { SnackbarProvider } from './SnackBar';
import '@testing-library/jest-dom';

// Récupérer les studios que nous utiliserons dans les tests
const mockStudios = [
  { id_stud: 1, nom_stud: 'Studio A', prix_par_heure: 50, moyenne_note: 4.5 },
  { id_stud: 2, nom_stud: 'Studio B', prix_par_heure: 75, moyenne_note: 3.8 },
];

// Mocks pour les composants MUI
jest.mock('@mui/material', () => ({
  InputLabel: ({ children, htmlFor, id, ...props }) => (
    <label htmlFor={htmlFor} id={id} {...props}>{children}</label>
  ),
  Select: ({ children, labelId, value, onChange, name, required, id, ...props }) => (
    <select 
      data-testid="studio-select"
      aria-labelledby={labelId}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    >
      {children}
    </select>
  ),
  MenuItem: ({ children, value }) => {
    // Pour éviter le problème avec <em> dans <option>
    if (value === "" && typeof children === 'object' && children.type === 'em') {
      return <option value={value}>{children.props.children}</option>;
    }
    return <option value={value}>{children}</option>;
  },
  CircularProgress: () => <div data-testid="loading-spinner">Loading...</div>,
  Box: ({ children, ...props }) => (
    <div data-testid="mui-box">{children}</div>
  ),
}), { virtual: true });

// Mock global fetch
global.fetch = jest.fn();

// Mock du hook useSnackbar
const mockShowSnackbar = jest.fn();
jest.mock('./SnackBar', () => ({
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar
  }),
  SnackbarProvider: ({ children }) => children
}), { virtual: true });

describe('ReservationForm', () => {
  // Configuration initiale des mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock pour fetch qui retourne des studios
    global.fetch.mockImplementation((url) => {
      if (url === '/api/studio') {
        return Promise.resolve({
          ok: true, 
          json: () => Promise.resolve(mockStudios)
        });
      } else if (url.startsWith('/api/studio/filter')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockStudios[0]])
        });
      } else if (url === '/api/firebase') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      } else if (url === '/api/reservations') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, id: 123 })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  
  const defaultReservation = {
    client_id: '',
    studio_id: '',
    date_reservation: '',
    nbr_personne: 1,
    heure_debut: '',
    heure_fin: '',
    prix_total: 0,
  };

  // Helper pour rendre le composant avec les props nécessaires
  const renderComponent = (props = {}) => {
    // Nettoyer toute instance précédente du composant
    if (screen.queryByText('Réserver un studio')) {
      screen.unmount();
    }
    
    // Créer un mock statique pour setReservation
    const mockSetReservation = jest.fn();
    
    const result = render(
      <SnackbarProvider>
        <ReservationForm 
          reservation={defaultReservation} 
          setReservation={mockSetReservation} 
          prixMin={null}
          prixMax={null}
          noteMin={null}
          selectedEquipements={[]}
          {...props} 
        />
      </SnackbarProvider>
    );
    
    return { ...result, mockSetReservation };
  };

  test('affiche un message si aucun utilisateur n\'est connecté', async () => {
    // Configurer localStorage pour simuler aucun utilisateur connecté
    window.localStorage.getItem.mockImplementation(() => null);
    
    renderComponent();
    
    // Vérifier que le message d'accès non autorisé est affiché
    await waitFor(() => {
      expect(screen.getByText('Vous devez être connecté en tant qu\'artiste pour faire une réservation.')).toBeInTheDocument();
    });
  });

  test('affiche le formulaire pour un utilisateur artiste JWT', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté avec JWT
    const mockUser = { id: '123', nom: 'Test Artiste', type: 'client' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    const { mockSetReservation } = renderComponent();
    
    // Vérifier que le formulaire est affiché
    await waitFor(() => {
      expect(screen.getByText('Réserver un studio')).toBeInTheDocument();
      expect(screen.getByText(/Connecté en tant que/)).toBeInTheDocument();
    });
    
    // Vérifier que setReservation a été appelé
    expect(mockSetReservation).toHaveBeenCalled();
  });

  test('affiche le formulaire pour un utilisateur artiste legacy', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté avec l'ancien système
    const mockUser = { id: '123', nom: 'Legacy Artiste', type: 'artiste' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token' || key === 'authUser') return null;
      if (key === 'currentUser') return JSON.stringify(mockUser);
      return null;
    });
    
    const { mockSetReservation } = renderComponent();
    
    // Vérifier que le formulaire est affiché
    await waitFor(() => {
      expect(screen.getByText('Réserver un studio')).toBeInTheDocument();
      expect(screen.getByText(/Connecté en tant que/)).toBeInTheDocument();
    });
    
    // Vérifier que setReservation a été appelé
    expect(mockSetReservation).toHaveBeenCalled();
  });

  test('affiche un spinner de chargement pendant le chargement des données', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté
    const mockUser = { id: '123', nom: 'Test Artiste', type: 'client' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    // Retarder la résolution de la promesse fetch pour forcer l'état de chargement
    global.fetch.mockImplementation(() => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([])
          });
        }, 100);
      })
    );
    
    renderComponent();
    
    // Vérifier que le spinner de chargement est affiché
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('charge et affiche correctement la liste des studios', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté
    const mockUser = { id: '123', nom: 'Test Artiste', type: 'client' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    renderComponent();
    
    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByText('Réserver un studio')).toBeInTheDocument();
    });
    
    // Vérifier que le select des studios est présent
    const studioSelect = screen.getByTestId('studio-select');
    expect(studioSelect).toBeInTheDocument();
    
    // Vérifier que l'option par défaut est présente
    expect(screen.getByText('Sélectionnez un studio')).toBeInTheDocument();
    
    // Vérifier que les données de studio ont été récupérées et l'appel API a été fait
    expect(global.fetch).toHaveBeenCalledWith('/api/studio');
  });

  test('soumet correctement le formulaire', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté
    const mockUser = { id: '123', nom: 'Test Artiste', type: 'client' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    // Données de formulaire complètes pour la réservation
    const completeReservation = {
      client_id: '123',
      studio_id: '1',
      date_reservation: '2025-06-01',
      nbr_personne: 3,
      heure_debut: '14:00',
      heure_fin: '16:00',
      prix_total: 100,
    };
    
    renderComponent({ reservation: completeReservation });
    
    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByText('Réserver un studio')).toBeInTheDocument();
    });
    
    // Trouver le bouton de soumission et soumettre le formulaire
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: 'Réserver' });
      fireEvent.click(submitButton);
    });
    
    // Vérifier que fetch a été appelé avec les bonnes données
    await waitFor(() => {
      // Vérifier l'appel à Firebase
      expect(global.fetch).toHaveBeenCalledWith('/api/firebase', 
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"nbr_personne":3')
        })
      );
      
      // Vérifier l'appel pour la réservation
      expect(global.fetch).toHaveBeenCalledWith('/api/reservations', 
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token'
          }),
          body: expect.any(String)
        })
      );
    });
  });

  test('gère correctement les erreurs lors de la soumission', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté
    const mockUser = { id: '123', nom: 'Test Artiste', type: 'client' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    // Simuler une erreur lors de la soumission
    global.fetch.mockImplementation((url) => {
      if (url === '/api/studio') {
        return Promise.resolve({
          ok: true, 
          json: () => Promise.resolve(mockStudios)
        });
      } else if (url === '/api/firebase') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      } else if (url === '/api/reservations') {
        throw new Error('Erreur backend');
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
    
    // Données de formulaire complètes pour la réservation
    const completeReservation = {
      client_id: '123',
      studio_id: '1',
      date_reservation: '2025-06-01',
      nbr_personne: 3,
      heure_debut: '14:00',
      heure_fin: '16:00',
      prix_total: 100,
    };
    
    renderComponent({ reservation: completeReservation });
    
    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByText('Réserver un studio')).toBeInTheDocument();
    });
    
    // Trouver le bouton de soumission et soumettre le formulaire
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: 'Réserver' });
      fireEvent.click(submitButton);
    });
    
    // Vérifier que l'erreur est gérée et que le snackbar est appelé
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/firebase', expect.any(Object));
      
      // Vérifier que showSnackbar a été appelé avec un message d'erreur
      expect(mockShowSnackbar).toHaveBeenCalled();
      const args = mockShowSnackbar.mock.calls[0];
      expect(args[0]).toContain('Erreur lors de l\'enregistrement');
      expect(args[1]).toBe('error');
    });
  });
  
  test('désactive le bouton pendant la soumission', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté
    const mockUser = { id: '123', nom: 'Test Artiste', type: 'client' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    // Retarder la résolution des promesses fetch pour tester l'état de soumission
    global.fetch.mockImplementation((url) => {
      if (url === '/api/studio') {
        return Promise.resolve({
          ok: true, 
          json: () => Promise.resolve(mockStudios)
        });
      } else if (url === '/api/firebase' || url === '/api/reservations') {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true })
            });
          }, 500);
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
    
    // Données de formulaire complètes pour la réservation
    const completeReservation = {
      client_id: '123',
      studio_id: '1',
      date_reservation: '2025-06-01',
      nbr_personne: 3,
      heure_debut: '14:00',
      heure_fin: '16:00',
      prix_total: 100,
    };
    
    renderComponent({ reservation: completeReservation });
    
    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByText('Réserver un studio')).toBeInTheDocument();
    });
    
    // Trouver le bouton de soumission et soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: 'Réserver' });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Vérifier que le bouton est désactivé pendant la soumission
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveStyle('backgroundColor: rgb(204, 204, 204)');
    
    // Vérifier que le texte du bouton change
    expect(screen.getByText('Enregistrement...')).toBeInTheDocument();
  });

  test('réinitialise le formulaire après une soumission réussie', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté
    const mockUser = { id: '123', nom: 'Test Artiste', type: 'client' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    // Créer un mock pour setReservation
    const setReservationMock = jest.fn();
    
    // Rendre le composant avec une réservation complète
    render(
      <SnackbarProvider>
        <ReservationForm 
          reservation={{
            client_id: '123',
            studio_id: '1',
            date_reservation: '2025-06-01',
            nbr_personne: 3,
            heure_debut: '14:00',
            heure_fin: '16:00',
            prix_total: 100,
          }}
          setReservation={setReservationMock}
          prixMin={null}
          prixMax={null}
          noteMin={null}
          selectedEquipements={[]}
        />
      </SnackbarProvider>
    );
    
    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByText('Réserver un studio')).toBeInTheDocument();
    });
    
    // Soumettre le formulaire
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: 'Réserver' });
      fireEvent.click(submitButton);
    });
    
    // Vérifier que le formulaire a été réinitialisé
    await waitFor(() => {
      // Vérifier que setReservation a été appelé avec les valeurs réinitialisées
      expect(setReservationMock).toHaveBeenCalledWith(expect.objectContaining({
        client_id: '123',  // L'ID du client reste
        studio_id: "",     // Les autres champs sont réinitialisés
        date_reservation: "",
        nbr_personne: 1,
        heure_debut: "",
        heure_fin: "",
        prix_total: 0
      }));
    });
  });
});