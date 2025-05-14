import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModifProfil from './ModifProfil';
import { Cloudinary } from '@cloudinary/url-gen';
import Axios from 'axios';
import { useSnackbar } from './SnackBar';

// Mock des modules et hooks externes
jest.mock('@cloudinary/url-gen');
jest.mock('@cloudinary/react', () => ({
  AdvancedImage: () => <img data-testid="cloudinary-image" alt="Cloudinary" />
}));
jest.mock('axios');
jest.mock('./SnackBar', () => ({
  useSnackbar: jest.fn()
}));
jest.mock('react-phone-number-input', () => {
  return function PhoneInput(props) {
    return (
      <input
        data-testid="phone-input"
        type="tel"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    );
  };
});

// Mocks globaux
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.fetch = jest.fn();

describe('ModifProfil Component', () => {
  // Configuration avant chaque test
  beforeEach(() => {
    // Réinitialiser tous les mocks
    jest.clearAllMocks();

    // Setup mock pour localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true
    });    
    
    // Mock pour useSnackbar
    useSnackbar.mockReturnValue({
      showSnackbar: jest.fn()
    });

    // Mock pour addEventListener et removeEventListener
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
    
    // Mock pour dispatchEvent
    window.dispatchEvent = jest.fn();

    // Mock pour Cloudinary
    Cloudinary.mockImplementation(() => ({
      image: jest.fn().mockReturnValue({})
    }));
  });

  test('rend le composant correctement sans utilisateur', () => {
    window.localStorage.getItem.mockReturnValue(null);
    const onBackMock = jest.fn();
    
    render(<ModifProfil onBack={onBackMock} />);
    
    // Vérifier que le formulaire est rendu
    expect(screen.getByText(/Modifier mon profil/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email :/i)).toBeInTheDocument();
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    
    // Vérifier que le bouton retour fonctionne
    fireEvent.click(screen.getByText('Retour'));
    expect(onBackMock).toHaveBeenCalled();
  });

  test('charge les données utilisateur artiste correctement', async () => {
    // Mock des données utilisateur dans localStorage
    const mockUser = { id: '123', type: 'artiste' };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
    
    // Mock de la réponse API pour getClientInfo
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '123',
        photo_url: 'test-photo-url',
        nom: 'Test Artiste',
        email: 'test@example.com',
        numero_telephone: '1234567890'
      })
    });
    
    render(<ModifProfil onBack={jest.fn()} />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/clients/info?id=123');
    });
    
    // Vérifier que les données sont bien chargées dans le formulaire
    await waitFor(() => {
      expect(screen.getByLabelText(/Nom :/i).value).toBe('Test Artiste');
      expect(screen.getByLabelText(/Email :/i).value).toBe('test@example.com');
    });
  });

  test('charge les données utilisateur propriétaire correctement', async () => {
    // Mock des données utilisateur dans localStorage
    const mockUser = { id: '456', type: 'proprietaire' };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
    
    // Mock de la réponse API pour getProprioInfo
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '456',
        photo_url: 'proprio-photo-url',
        nom: 'Test Proprio',
        email: 'proprio@example.com',
        numero_telephone: '9876543210'
      })
    });
    
    render(<ModifProfil onBack={jest.fn()} />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/proprietaires/info?id=456');
    });
    
    // Vérifier que les données sont bien chargées dans le formulaire
    await waitFor(() => {
      expect(screen.getByLabelText(/Nom :/i).value).toBe('Test Proprio');
      expect(screen.getByLabelText(/Email :/i).value).toBe('proprio@example.com');
    });
    
    // Vérifier que le type est affiché correctement
    expect(screen.getByText(/\(Propriétaire\)/i)).toBeInTheDocument();
  });

  test('met à jour les champs du formulaire correctement', async () => {
    // Setup initial avec un utilisateur
    const mockUser = { id: '123', type: 'artiste' };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '123',
        photo_url: 'test-photo-url',
        nom: 'Initial Name',
        email: 'initial@example.com',
        numero_telephone: '1234567890'
      })
    });
    
    render(<ModifProfil onBack={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Nom :/i).value).toBe('Initial Name');
    });
    
    // Modifier les champs du formulaire
    fireEvent.change(screen.getByLabelText(/Nom :/i), { target: { value: 'Updated Name' } });
    fireEvent.change(screen.getByLabelText(/Email :/i), { target: { value: 'updated@example.com' } });
    
    // Vérifier que les champs ont bien été mis à jour
    expect(screen.getByLabelText(/Nom :/i).value).toBe('Updated Name');
    expect(screen.getByLabelText(/Email :/i).value).toBe('updated@example.com');
  });

  test('soumet le formulaire et met à jour le profil sans changer la photo', async () => {
    // Setup initial
    const mockUser = { id: '123', type: 'artiste' };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/clients/info')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '123',
            photo_url: 'existing-photo-url',
            nom: 'Initial Name',
            email: 'initial@example.com',
            numero_telephone: '1234567890'
          })
        });
      } else if (url.includes('/api/clients/save')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });
    
    render(<ModifProfil onBack={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Nom :/i).value).toBe('Initial Name');
    });
    
    // Modifier et soumettre le formulaire
    fireEvent.change(screen.getByLabelText(/Nom :/i), { target: { value: 'Updated Name' } });
    fireEvent.submit(screen.getByText(/Enregistrer/i));
    
    // Vérifier que l'API a été appelée avec les bonnes données
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/clients/save', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Updated Name')
      }));
    });
    
    // Vérifier que le snackbar a été appelé
    const { showSnackbar } = useSnackbar();
    expect(showSnackbar).toHaveBeenCalledWith('Profil mis à jour avec succès !', 'success');
    
    // Vérifier que localStorage a été mis à jour
    expect(window.localStorage.setItem).toHaveBeenCalled();
    
    // Vérifier que l'événement userUpdated a été déclenché
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  test('upload une nouvelle photo et supprime l\'ancienne', async () => {
    // Setup initial
    const mockUser = { id: '123', type: 'artiste' };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/clients/info')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '123',
            photo_url: 'old-photo-url',
            nom: 'Test User',
            email: 'test@example.com',
            numero_telephone: '1234567890'
          })
        });
      } else if (url.includes('/api/clients/save')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      } else if (url.includes('/api/cloudinary/delete')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: 'ok' })
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });
    
    // Mock de Axios pour l'upload de la nouvelle photo
    Axios.post.mockResolvedValueOnce({
      data: { public_id: 'new-photo-url' }
    });
    
    render(<ModifProfil onBack={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Nom :/i).value).toBe('Test User');
    });
    
    // Simuler l'upload d'une nouvelle photo
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Changer de photo/i);
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Soumettre le formulaire
    fireEvent.submit(screen.getByText(/Enregistrer/i));
    
    // Vérifier que l'upload a été effectué
    expect(Axios.post).toHaveBeenCalledWith(
      'https://api.cloudinary.com/v1_1/dpszia6xf/image/upload',
      expect.any(FormData)
    );
    
    // Vérifier que l'API de sauvegarde a été appelée avec le nouveau public_id
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/clients/save', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('new-photo-url')
      }));
    });
    
    // Vérifier que l'API de suppression a été appelée pour l'ancienne photo
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cloudinary/delete', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ public_id: 'old-photo-url' })
      }));
    });
  });

  test('gère les erreurs lors de l\'upload de photo', async () => {
    // Setup initial
    const mockUser = { id: '123', type: 'artiste' };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '123',
        photo_url: 'test-photo-url',
        nom: 'Test User',
        email: 'test@example.com',
        numero_telephone: '1234567890'
      })
    });
    
    // Mock de l'erreur lors de l'upload
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    Axios.post.mockRejectedValueOnce(new Error('Upload failed'));
    
    render(<ModifProfil onBack={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Nom :/i).value).toBe('Test User');
    });
    
    // Simuler l'upload d'une nouvelle photo
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Changer de photo/i);
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Soumettre le formulaire
    fireEvent.submit(screen.getByText(/Enregistrer/i));
    
    // Vérifier que l'erreur a été enregistrée
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de l\'upload :', expect.any(Error));
    });
    
    // Vérifier que l'API de sauvegarde n'a pas été appelée
    expect(global.fetch).not.toHaveBeenCalledWith('/api/clients/save', expect.anything());
    
    consoleErrorSpy.mockRestore();
  });

  test('gère les erreurs lors de la mise à jour du profil', async () => {
    // Setup initial
    const mockUser = { id: '123', type: 'artiste' };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/clients/info')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '123',
            photo_url: 'test-photo-url',
            nom: 'Test User',
            email: 'test@example.com',
            numero_telephone: '1234567890'
          })
        });
      } else if (url.includes('/api/clients/save')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<ModifProfil onBack={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Nom :/i).value).toBe('Test User');
    });
    
    // Soumettre le formulaire
    fireEvent.submit(screen.getByText(/Enregistrer/i));
    
    // Vérifier que l'erreur a été enregistrée
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    // Vérifier que le snackbar n'a pas été appelé
    const { showSnackbar } = useSnackbar();
    expect(showSnackbar).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  test('écoute les événements userChanged', async () => {
    // Setup initial sans utilisateur
    window.localStorage.getItem.mockReturnValue(null);
    
    render(<ModifProfil onBack={jest.fn()} />);
    
    // Vérifier que l'event listener a été ajouté
    expect(window.addEventListener).toHaveBeenCalledWith('userChanged', expect.any(Function));
    
    // Simuler un événement userChanged
    const userChangedCallback = window.addEventListener.mock.calls.find(
      call => call[0] === 'userChanged'
    )[1];
    
    const newUser = { id: '789', type: 'artiste' };
    
    // Mock de la réponse API pour le nouvel utilisateur
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '789',
        photo_url: 'new-user-photo',
        nom: 'New User',
        email: 'new@example.com',
        numero_telephone: '5555555555'
      })
    });
    
    // Déclencher l'événement
    userChangedCallback({ detail: newUser });
    
    // Vérifier que l'API a été appelée avec le bon ID
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/clients/info?id=789');
    });
  });
});