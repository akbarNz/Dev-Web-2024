// FormulaireEnregiStudio.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnregistrementForm from './FormulaireEnregiStudio';
import { SnackbarProvider } from './SnackBar';
import '@testing-library/jest-dom';

// Mocks pour les modules externes
jest.mock('@cloudinary/react', () => ({
  AdvancedImage: ({ style }) => <img data-testid="advanced-image" alt="Studio" style={style} />
}), { virtual: true });

jest.mock('@cloudinary/url-gen', () => ({
  Cloudinary: function() {
    return {
      image: () => 'mocked-image'
    };
  }
}), { virtual: true });

// Mock Axios
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { public_id: 'test-id' } }))
}), { virtual: true });

// Mock global fetch
global.fetch = jest.fn();

describe('EnregistrementForm', () => {
  // Configuration initiale des mocks avant chaque test
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock pour fetch qui retourne des villes
    global.fetch.mockImplementation((url) => {
      if (url === '/api/studio/villes') {
        return Promise.resolve({
          ok: true, 
          json: () => Promise.resolve([
            { code_postal: '75001', nom_ville: 'Paris 1er' },
            { code_postal: '69001', nom_ville: 'Lyon 1er' },
          ])
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
    
    // Réinitialiser tous les mocks
    jest.clearAllMocks();
  });

  const mockShowSnackbar = jest.fn();
  
  // Mock du hook useSnackbar
  jest.mock('./SnackBar', () => ({
    useSnackbar: () => ({
      showSnackbar: mockShowSnackbar
    }),
    SnackbarProvider: ({ children }) => children
  }), { virtual: true });

  const mockSetEnregistrement = jest.fn();
  const mockOnBack = jest.fn();
  const defaultEnregistrement = {
    nom_studio: '',
    description: '',
    adresse: '',
    code_postal: '',
    prix_par_heure: '',
    equipement: '',
    photo_url: '',
    artiste_id: '',
  };

  // Helper pour rendre le composant avec les props nécessaires
  const renderComponent = (props = {}) => {
    return render(
      <SnackbarProvider>
        <EnregistrementForm 
          enregistrement={defaultEnregistrement} 
          setEnregistrement={mockSetEnregistrement} 
          onBack={mockOnBack}
          {...props} 
        />
      </SnackbarProvider>
    );
  };

  test('redirige quand aucun utilisateur n\'est connecté', async () => {
    // Configurer localStorage pour simuler aucun utilisateur connecté
    window.localStorage.getItem.mockImplementation(() => null);
    
    renderComponent();
    
    // Vérifier que onBack a été appelé
    await waitFor(() => {
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  test('affiche le message d\'accès non autorisé quand aucun utilisateur n\'est connecté', async () => {
    // Configurer localStorage pour simuler aucun utilisateur connecté
    window.localStorage.getItem.mockImplementation(() => null);
    
    renderComponent();
    
    // Vérifier que le message d'accès non autorisé est affiché
    await waitFor(() => {
      expect(screen.getByText('Accès non autorisé')).toBeInTheDocument();
    });
  });

  test('affiche le formulaire pour un utilisateur propriétaire JWT', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté avec JWT
    const mockUser = { id: '123', nom: 'Test User', type: 'proprio' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    renderComponent();
    
    // Vérifier que le formulaire est affiché
    await waitFor(() => {
      expect(screen.getByText('Enregistrer un studio')).toBeInTheDocument();
      expect(screen.getByText(/Connecté en tant que/)).toBeInTheDocument();
    });
    
    // Vérifier que setEnregistrement a été appelé avec l'ID de l'utilisateur
    await waitFor(() => {
      expect(mockSetEnregistrement).toHaveBeenCalled();
    });
  });

  test('affiche le formulaire pour un utilisateur propriétaire legacy', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté avec l'ancien système
    const mockUser = { id: '123', nom: 'Legacy User', type: 'proprietaire' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token' || key === 'authUser') return null;
      if (key === 'currentUser') return JSON.stringify(mockUser);
      return null;
    });
    
    renderComponent();
    
    // Vérifier que le formulaire est affiché
    await waitFor(() => {
      expect(screen.getByText('Enregistrer un studio')).toBeInTheDocument();
      expect(screen.getByText(/Connecté en tant que/)).toBeInTheDocument();
    });
    
    // Vérifier que setEnregistrement a été appelé avec l'ID de l'utilisateur
    await waitFor(() => {
      expect(mockSetEnregistrement).toHaveBeenCalled();
    });
  });

  test('redirige quand on clique sur le bouton Retour', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté
    const mockUser = { id: '123', nom: 'Test User', type: 'proprio' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    renderComponent();
    
    // Attendre que le composant soit rendu
    await waitFor(() => {
      expect(screen.getByText('Retour')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton Retour
    fireEvent.click(screen.getByText('Retour'));
    
    // Vérifier que onBack a été appelé
    expect(mockOnBack).toHaveBeenCalled();
  });

  // Tests supplémentaires pour la manipulation du formulaire
  test('met à jour les champs du formulaire lors de la modification', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté
    const mockUser = { id: '123', nom: 'Test User', type: 'proprio' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    renderComponent();
    
    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByText('Enregistrer un studio')).toBeInTheDocument();
    });
    
    // Rechercher le champ par son attribut name
    const nomInput = screen.getByPlaceholderText('Entrer le nom de votre studio');
    fireEvent.change(nomInput, { target: { value: 'Mon Studio Test' } });
    
    // Vérifier que setEnregistrement a été appelé avec la bonne valeur
    expect(mockSetEnregistrement).toHaveBeenCalledWith(
      expect.objectContaining({ nom_studio: 'Mon Studio Test' })
    );
  });

  test('soumet le formulaire correctement avec des données valides', async () => {
    // Configurer localStorage pour simuler un utilisateur connecté
    const mockUser = { id: '123', nom: 'Test User', type: 'proprio' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'authUser') return JSON.stringify(mockUser);
      return null;
    });
    
    // Données de formulaire complètes
    const completeEnregistrement = {
      nom_studio: 'Studio Complet',
      description: 'Description complète',
      adresse: '1 rue de Test',
      code_postal: '75001',
      prix_par_heure: '50',
      equipement: 'Micro, Casque, Console',
      photo_url: 'test-image',
      artiste_id: '123',
    };
    
    renderComponent({ enregistrement: completeEnregistrement });
    
    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByText('Enregistrer un studio')).toBeInTheDocument();
    });
    
    // Soumettre le formulaire
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Vérifier que fetch a été appelé avec les bonnes données
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/studio/enregistrer', 
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token'
          }),
          body: expect.any(String)
        })
      );
      
      // Vérifier que onBack a été appelé (redirection après succès)
      expect(mockOnBack).toHaveBeenCalled();
    });
  });
});