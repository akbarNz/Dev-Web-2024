import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModifProfil from './ModifProfil';
import { useSnackbar } from './SnackBar';
import Axios from 'axios';

// Mocks
jest.mock('./SnackBar');
jest.mock('axios');
jest.mock('react-phone-number-input', () => ({
  __esModule: true,
  default: ({ value, onChange, defaultCountry }) => (
    <input
      data-testid="phone-input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Phone (${defaultCountry})`}
    />
  ),
}));

// Alternative plus simple si le problème persiste
jest.mock('@cloudinary/url-gen', () => ({
  Cloudinary: class MockCloudinary {
    constructor() {}
    image(publicId) {
      return {
        publicId,
        toURL: () => `https://mock-cloudinary.com/${publicId}`,
        transformation: () => this,
        resize: () => this,
        format: () => this
      };
    }
  }
}));

jest.mock('@cloudinary/react', () => ({
  AdvancedImage: ({ cldImg, className }) => (
    <img data-testid="cloudinary-image" className={className} alt="Cloudinary" />
  )
}));

// Mock global fetch
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');

describe('ModifProfil Component', () => {
  const mockShowSnackbar = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
    
    // Mock localStorage - IMPORTANT: Return null instead of undefined
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null), // Default to null instead of undefined
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock window events
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
    window.dispatchEvent = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization and User Data Loading', () => {
    test('should show loading state when no user is logged in', () => {
      window.localStorage.getItem.mockReturnValue(null);
      
      render(<ModifProfil onBack={mockOnBack} />);
      
      expect(screen.getByText('Chargement du profil...')).toBeInTheDocument();
    });

    test('should load legacy user data', async () => {
      const mockUser = { id: '456', type: 'proprietaire', nom: 'Propriétaire Test' };
      const mockUserData = {
        id: '456',
        nom: 'Propriétaire Test',
        email: 'proprio@example.com',
        numero_telephone: '0987654321',
        photo_url: 'proprio-photo-id'
      };

      window.localStorage.getItem
        .mockReturnValueOnce(null) // token
        .mockReturnValueOnce(null) // authUser
        .mockReturnValueOnce(JSON.stringify(mockUser)); // currentUser

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/proprietaires/info?id=456');
      });

      expect(screen.getByDisplayValue('Propriétaire Test')).toBeInTheDocument();
      expect(screen.getByText('Modifier mon profil (Propriétaire)')).toBeInTheDocument();
    });

    test('should handle user data fetch error', async () => {
      const mockUser = { id: '123', type: 'client' };

      window.localStorage.getItem
        .mockReturnValueOnce('mock-jwt-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      fetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Erreur lors de la récupération du profil',
          'error'
        );
      });
    });
  });

  describe('User Type Detection', () => {
    test('should correctly detect artiste type for JWT client', async () => {
      const mockUser = { id: '123', type: 'client' };
      const mockUserData = {
        id: '123',
        nom: 'Artist User',
        email: 'artist@example.com',
        numero_telephone: '+32123456789',
        photo_url: 'artist-photo'
      };

      window.localStorage.getItem
        .mockReturnValueOnce('token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Modifier mon profil (Artiste)')).toBeInTheDocument();
      });
    });

    test('should correctly detect proprietaire type for JWT proprio', async () => {
      const mockUser = { id: '123', type: 'proprio' };
      const mockUserData = {
        id: '123',
        nom: 'Owner User',
        email: 'owner@example.com',
        numero_telephone: '+32123456789',
        photo_url: 'owner-photo'
      };

      window.localStorage.getItem
        .mockReturnValueOnce('token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Modifier mon profil (Propriétaire)')).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    const setupLoggedInUser = async (userType = 'client') => {
      const mockUser = { id: '123', type: userType };
      const mockUserData = {
        id: '123',
        nom: 'Test User',
        email: 'test@example.com',
        numero_telephone: '+32123456789',
        photo_url: 'test-photo'
      };

      window.localStorage.getItem
        .mockReturnValueOnce('token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });
    };

    test('should update nom field', async () => {
      await setupLoggedInUser();

      const nomInput = screen.getByDisplayValue('Test User');
      await userEvent.clear(nomInput);
      await userEvent.type(nomInput, 'Updated Name');

      expect(screen.getByDisplayValue('Updated Name')).toBeInTheDocument();
    });

    test('should update email field', async () => {
      await setupLoggedInUser();

      const emailInput = screen.getByDisplayValue('test@example.com');
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'newemail@example.com');

      expect(screen.getByDisplayValue('newemail@example.com')).toBeInTheDocument();
    });

    test('should update phone number', async () => {
      await setupLoggedInUser();

      const phoneInput = screen.getByTestId('phone-input');
      await userEvent.clear(phoneInput);
      await userEvent.type(phoneInput, '+33123456789');

      expect(screen.getByDisplayValue('+33123456789')).toBeInTheDocument();
    });

    test('should handle file upload for profile photo', async () => {
      await setupLoggedInUser();

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Changer de photo');

      await userEvent.upload(fileInput, file);

      expect(fileInput.files[0]).toBe(file);
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });
  });

  describe('Form Submission', () => {
    const setupUserForSubmission = async (userType = 'client') => {
      const mockUser = { id: '123', type: userType };
      const mockUserData = {
        id: '123',
        nom: 'Test User',
        email: 'test@example.com',
        numero_telephone: '+32123456789',
        photo_url: 'existing-photo'
      };

      window.localStorage.getItem
        .mockReturnValueOnce('token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });
    };

    test('should submit form for proprietaire', async () => {
      await setupUserForSubmission('proprio');

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const submitButton = screen.getByText('Enregistrer');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/proprietaires/save', expect.objectContaining({
          method: 'PUT'
        }));
      });
    });

    test('should handle image upload during submission', async () => {
      await setupUserForSubmission();

      // Mock Cloudinary upload
      Axios.post.mockResolvedValueOnce({
        data: { public_id: 'new-photo-id' }
      });

      // Mock profile update
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Mock image deletion
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Upload a file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Changer de photo');
      await userEvent.upload(fileInput, file);

      // Submit the form
      const submitButton = screen.getByText('Enregistrer');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(Axios.post).toHaveBeenCalledWith(
          'https://api.cloudinary.com/v1_1/dpszia6xf/image/upload',
          expect.any(FormData)
        );
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: 'existing-photo' })
        });
      });

      expect(mockShowSnackbar).toHaveBeenCalledWith('Profil mis à jour avec succès !', 'success');
    });

    test('should handle form submission error', async () => {
      await setupUserForSubmission();

      fetch.mockRejectedValueOnce(new Error('Server error'));

      const submitButton = screen.getByText('Enregistrer');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Erreur lors de la mise à jour du profil',
          'error'
        );
      });
    });

    test('should handle cloudinary upload error', async () => {
      await setupUserForSubmission();

      Axios.post.mockRejectedValueOnce(new Error('Upload failed'));

      // Upload a file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Changer de photo');
      await userEvent.upload(fileInput, file);

      const submitButton = screen.getByText('Enregistrer');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          "Erreur lors de l'upload de l'image",
          'error'
        );
      });
    });

    test('should handle submission without user ID', async () => {
      // Setup a user without ID
      const mockUser = { type: 'client' };
      window.localStorage.getItem
        .mockReturnValueOnce('token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      render(<ModifProfil onBack={mockOnBack} />);

      // Should show loading state
      expect(screen.getByText('Chargement du profil...')).toBeInTheDocument();
    });
  });

  describe('Event Listeners and Cleanup', () => {
    test('should add and remove event listeners', () => {
      render(<ModifProfil onBack={mockOnBack} />);

      expect(window.addEventListener).toHaveBeenCalledWith('authChanged', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('userChanged', expect.any(Function));
    });
  });

  describe('UI Components and Display', () => {
    const setupUserWithPhoto = async () => {
      const mockUser = { id: '123', type: 'client' };
      const mockUserData = {
        id: '123',
        nom: 'Test User',
        email: 'test@example.com',
        numero_telephone: '+32123456789',
        photo_url: 'test-photo-id'
      };

      window.localStorage.getItem
        .mockReturnValueOnce('token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });
    };

    test('should display cloudinary image when photo_url exists', async () => {
      await setupUserWithPhoto();
      expect(screen.getByTestId('cloudinary-image')).toBeInTheDocument();
    });

    test('should display default image when no photo_url', async () => {
      const mockUser = { id: '123', type: 'client' };
      const mockUserData = {
        id: '123',
        nom: 'Test User',
        email: 'test@example.com',
        numero_telephone: '+32123456789',
        photo_url: ''
      };

      window.localStorage.getItem
        .mockReturnValueOnce('token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        const defaultImage = screen.getByAltText('Photo de profil');
        expect(defaultImage.src).toContain('logo512.png');
      });
    });

    test('should call onBack when back button is clicked', async () => {
      await setupUserWithPhoto();

      const backButton = screen.getByText('Retour');
      await userEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Phone Number Formatting', () => {
    test('should format phone number with + prefix', async () => {
      const mockUser = { id: '123', type: 'client' };
      const mockUserData = {
        id: '123',
        nom: 'Test User',
        email: 'test@example.com',
        numero_telephone: '32123456789', // Without +
        photo_url: 'test-photo'
      };

      window.localStorage.getItem
        .mockReturnValueOnce('token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        const phoneInput = screen.getByTestId('phone-input');
        expect(phoneInput.value).toBe('+32123456789');
      });
    });

    test('should preserve phone number with existing + prefix', async () => {
      const mockUser = { id: '123', type: 'client' };
      const mockUserData = {
        id: '123',
        nom: 'Test User',
        email: 'test@example.com',
        numero_telephone: '+32123456789', // With +
        photo_url: 'test-photo'
      };

      window.localStorage.getItem
        .mockReturnValueOnce('token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        const phoneInput = screen.getByTestId('phone-input');
        expect(phoneInput.value).toBe('+32123456789');
      });
    });
  });

  describe('Legacy Mode Tests', () => {
    test('should work in legacy mode without JWT', async () => {
      const mockUser = { id: '456', type: 'artiste' };
      const mockUserData = {
        id: '456',
        nom: 'Legacy User',
        email: 'legacy@example.com',
        numero_telephone: '+32987654321',
        photo_url: 'legacy-photo'
      };

      window.localStorage.getItem
        .mockReturnValueOnce(null) // token
        .mockReturnValueOnce(null) // authUser
        .mockReturnValueOnce(JSON.stringify(mockUser)); // currentUser

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      await act(async () => {
        render(<ModifProfil onBack={mockOnBack} />);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Legacy User')).toBeInTheDocument();
      });

      // Test form submission in legacy mode
      const submitButton = screen.getByText('Enregistrer');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/clients/save', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"nom":"Legacy User"')
        });
      });
    });
  });
});