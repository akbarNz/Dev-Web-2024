import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnregistrementForm from './EnregistrementForm';
import Axios from 'axios';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';

// Mock des dépendances externes
jest.mock('axios');
jest.mock('@cloudinary/url-gen');
jest.mock('@cloudinary/react');

// Mock des réponses API
const mockUsers = [
  { id: 1, nom: 'John Doe' },
  { id: 2, nom: 'Jane Smith' },
];

const mockVilles = [
  { code_postal: '75000', nom: 'Paris' },
  { code_postal: '69000', nom: 'Lyon' },
];

const mockEnregistrement = {
  nom_studio: '',
  description: '',
  adresse: '',
  code_postal: '',
  prix_par_heure: '',
  equipement: '',
  artiste_id: '',
  photo_url: '',
};

const mockSetEnregistrement = jest.fn();
const mockOnBack = jest.fn();

// Mock des fetch
global.fetch = jest.fn((url) =>
  Promise.resolve({
    json: () => {
      if (url.includes('proprietaire')) {
        return Promise.resolve(mockUsers);
      } else if (url.includes('ville')) {
        return Promise.resolve(mockVilles);
      }
      return Promise.resolve({});
    },
    ok: true,
  })
);

// Mock Cloudinary
Cloudinary.mockImplementation(() => ({
  image: jest.fn().mockReturnValue('mocked-image-url'),
}));

describe('EnregistrementForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    Axios.post.mockResolvedValue({ data: { public_id: 'test-public-id' } });
  });

  test('renders the form correctly', () => {
    render(
      <EnregistrementForm
        enregistrement={mockEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Enregistrer un studio')).toBeInTheDocument();
    expect(screen.getByLabelText('Photo du studio')).toBeInTheDocument();
    expect(screen.getByLabelText('Propriétaire ?')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom du studio')).toBeInTheDocument();
    expect(screen.getByLabelText('Description du studio')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse du studio')).toBeInTheDocument();
    expect(screen.getByLabelText('Prix par heure (€)')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Equipements (séparés par des virgules)')
    ).toBeInTheDocument();
    expect(screen.getByText('Enregistrer le studio')).toBeInTheDocument();
    expect(screen.getByText('Retour')).toBeInTheDocument();
  });

  test('loads users and villes on mount', async () => {
    render(
      <EnregistrementForm
        enregistrement={mockEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:5001/proprietaire');
      expect(fetch).toHaveBeenCalledWith('http://localhost:5001/ville');
    });
  });

  test('handles form input changes', () => {
    render(
      <EnregistrementForm
        enregistrement={mockEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );

    fireEvent.change(screen.getByLabelText('Nom du studio'), {
      target: { name: 'nom_studio', value: 'Mon Studio' },
    });
    expect(mockSetEnregistrement).toHaveBeenCalledWith({
      ...mockEnregistrement,
      nom_studio: 'Mon Studio',
    });

    fireEvent.change(screen.getByLabelText('Description du studio'), {
      target: { name: 'description', value: 'Une belle description' },
    });
    expect(mockSetEnregistrement).toHaveBeenCalledWith({
      ...mockEnregistrement,
      description: 'Une belle description',
    });
  });

  test('handles file upload', async () => {
    render(
      <EnregistrementForm
        enregistrement={mockEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Photo du studio');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(Axios.post).toHaveBeenCalledWith(
        'https://api.cloudinary.com/v1_1/dpszia6xf/image/upload',
        expect.any(FormData),
        expect.any(Object)
      );
      expect(mockSetEnregistrement).toHaveBeenCalledWith({
        ...mockEnregistrement,
        photo_url: 'test-public-id',
      });
    });
  });

  test('handles form submission', async () => {
    const mockResponse = { success: true };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const filledEnregistrement = {
      ...mockEnregistrement,
      nom_studio: 'Mon Studio',
      description: 'Description',
      adresse: '123 Rue Test',
      code_postal: '75000',
      prix_par_heure: '50',
      equipement: 'micro,casque',
      artiste_id: '1',
      photo_url: 'test-public-id',
    };

    render(
      <EnregistrementForm
        enregistrement={filledEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:5001/enregi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: 'Mon Studio',
          description: 'Description',
          adresse: '123 Rue Test',
          code_postal: '75000',
          prix_par_heure: 50,
          equipements: ['micro', 'casque'],
          photo_url: 'test-public-id',
          proprietaire_id: '1',
        }),
      });
    });
  });

  test('handles submission error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve('Server error'),
    });

    const filledEnregistrement = {
      ...mockEnregistrement,
      nom_studio: 'Mon Studio',
      description: 'Description',
      adresse: '123 Rue Test',
      code_postal: '75000',
      prix_par_heure: '50',
      equipement: 'micro,casque',
      artiste_id: '1',
    };

    render(
      <EnregistrementForm
        enregistrement={filledEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('handles back button click', () => {
    render(
      <EnregistrementForm
        enregistrement={mockEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByText('Retour'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  test('disables submit button when uploading', async () => {
    render(
      <EnregistrementForm
        enregistrement={mockEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Photo du studio');

    fireEvent.change(input, { target: { files: [file] } });

    expect(
      await screen.findByText('Upload en cours...')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Enregistrer le studio/i })
    ).toBeDisabled();
  });
});