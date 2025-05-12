import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import EnregistrementForm from './FormulaireEnregiStudio';
import { useSnackbar } from './SnackBar';


// Mock des dépendances
jest.mock('./SnackBar');

const mockEnregistrement = {
  nom_studio: '',
  description: '',
  adresse: '',
  code_postal: '',
  prix_par_heure: '',
  equipement: '',
  artiste_id: '',
  photo_url: ''
};

const mockSetEnregistrement = jest.fn();
const mockOnBack = jest.fn();
const mockShowSnackbar = jest.fn();

describe('FormulaireEnregiStudio - Sans Cloudinary', () => {
  beforeEach(() => {
    useSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
    global.fetch = jest.fn()
      .mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve([{ id: 1, nom: 'Propriétaire 1' }])
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve([{ code_postal: '75000', nom: 'Paris' }])
        })
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly without image upload', async () => {
    render(
      <EnregistrementForm 
        enregistrement={mockEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );
    
    expect(screen.getByText('Enregistrer un studio')).toBeInTheDocument();
    expect(screen.getByLabelText('Propriétaire ?')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom du studio')).toBeInTheDocument();
  });

  it('fetches users and villes on mount', async () => {
    render(
      <EnregistrementForm 
        enregistrement={mockEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('handles form submission without photo', async () => {
    const mockEnregistrementData = {
      ...mockEnregistrement,
      nom_studio: 'Mon Studio',
      description: 'Description',
      adresse: 'Adresse',
      code_postal: '75000',
      prix_par_heure: '50',
      equipement: 'micro,casque',
      artiste_id: '1',
      photo_url: ''
    };
    
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
    
    render(
      <EnregistrementForm 
        enregistrement={mockEnregistrementData}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );
    
    const form = screen.getByTestId('enregistrement-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/studio/enregistrer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: 'Mon Studio',
          description: 'Description',
          adresse: 'Adresse',
          code_postal: '75000',
          prix_par_heure: 50,
          equipements: ['micro', 'casque'],
          photo_url: '',
          proprietaire_id: '1'
        })
      });
    });
  });

  it('transforms equipements string to array on submit', async () => {
    const mockEnregistrementData = {
      ...mockEnregistrement,
      equipement: 'micro, casque, console'
    };
    
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
    
    render(
      <EnregistrementForm 
        enregistrement={mockEnregistrementData}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );
    
    const form = screen.getByTestId('enregistrement-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        body: expect.stringContaining('"equipements":["micro","casque","console"]')
      }));
    });
  });
});
