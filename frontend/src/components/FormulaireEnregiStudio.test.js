import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import EnregistrementForm from './FormulaireEnregiStudio';
import { useSnackbar } from './SnackBar';

// Mock des dépendances externes
jest.mock('./SnackBar');

// Mocks pour éviter les erreurs Cloudinary
jest.mock('@cloudinary/url-gen', () => ({
  Cloudinary: jest.fn().mockImplementation(() => ({
    image: jest.fn().mockReturnValue({})
  }))
}));

jest.mock('@cloudinary/react', () => ({
  AdvancedImage: jest.fn().mockImplementation(({ style }) => (
    <div data-testid="mock-cloudinary-image" style={style}>Image mockée</div>
  ))
}));

// Mock d'Axios pour éviter de tester l'upload d'images
jest.mock('axios');

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

describe('EnregistrementForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
    
    // Mock global.fetch pour simuler les appels API
    global.fetch = jest.fn()
      .mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, nom: 'Propriétaire 1' },
            { id: 2, nom: 'Propriétaire 2' }
          ])
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          json: () => Promise.resolve([
            { code_postal: '1000', nom: 'Bruxelles' },
            { code_postal: '4000', nom: 'Liège' },
            { code_postal: '5000', nom: 'Namur' }
          ])
        })
      );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = (customEnregistrement = mockEnregistrement) => {
    return render(
      <EnregistrementForm 
        enregistrement={customEnregistrement}
        setEnregistrement={mockSetEnregistrement}
        onBack={mockOnBack}
      />
    );
  };

  test('rend le formulaire correctement', async () => {
    renderComponent();
    
    // Vérifie que le titre est présent
    expect(screen.getByText('Enregistrer un studio')).toBeInTheDocument();
    
    // Vérifie que les champs principaux sont présents
    expect(screen.getByLabelText(/Propriétaire \?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom du studio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description du studio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adresse du studio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Code postal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prix par heure/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Équipements/i)).toBeInTheDocument();
    
    // Vérifie que les boutons sont présents
    expect(screen.getByRole('button', { name: /Enregistrer le studio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retour/i })).toBeInTheDocument();
    
    // Vérifie la présence du petit texte d'aide pour les équipements
    expect(screen.getByText(/Saisissez vos équipements séparés par des virgules/i)).toBeInTheDocument();
  });

  test('charge les listes de propriétaires et de villes au chargement', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith('/api/proprietaires');
      expect(global.fetch).toHaveBeenCalledWith('/api/studio/villes');
    });
    
    // Vérifie que les options des listes déroulantes sont chargées
    await waitFor(() => {
      expect(screen.getByText('Propriétaire 1')).toBeInTheDocument();
      expect(screen.getByText('Propriétaire 2')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/1000 - Bruxelles/i)).toBeInTheDocument();
      expect(screen.getByText(/4000 - Liège/i)).toBeInTheDocument();
      expect(screen.getByText(/5000 - Namur/i)).toBeInTheDocument();
    });
  });

  test('gère les erreurs de chargement des propriétaires', async () => {
    // Réinitialiser le mock de fetch pour ce test
    global.fetch.mockReset();
    console.error = jest.fn(); // Éviter les erreurs dans la console

    // Simuler une erreur lors du chargement des propriétaires
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Erreur chargement utilisateurs'))
    ).mockImplementationOnce(() => 
      Promise.resolve({
        json: () => Promise.resolve([{ code_postal: '1000', nom: 'Bruxelles' }])
      })
    );

    renderComponent();
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Erreur chargement utilisateurs'),
        expect.anything()
      );
    });
    
    // Vérifie que le formulaire est toujours rendu
    expect(screen.getByText('Enregistrer un studio')).toBeInTheDocument();
  });

  test('gère les erreurs de chargement des villes', async () => {
    // Réinitialiser le mock de fetch pour ce test
    global.fetch.mockReset();
    console.error = jest.fn(); // Éviter les erreurs dans la console

    // Simuler un succès pour les propriétaires mais une erreur pour les villes
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        json: () => Promise.resolve([{ id: 1, nom: 'Propriétaire 1' }])
      })
    ).mockImplementationOnce(() => 
      Promise.reject(new Error('Erreur chargement villes'))
    );

    renderComponent();
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Erreur chargement villes'),
        expect.anything()
      );
    });
    
    // Vérifie que le formulaire est toujours rendu
    expect(screen.getByText('Enregistrer un studio')).toBeInTheDocument();
  });

  test('met à jour les champs du formulaire lors de la saisie', async () => {
    renderComponent();
    
    // Attendre que le formulaire soit chargé et que les données soient disponibles
    await waitFor(() => {
      expect(screen.getByLabelText(/Nom du studio/i)).toBeInTheDocument();
      expect(screen.getByText('Propriétaire 1')).toBeInTheDocument();
      expect(screen.getByText(/1000 - Bruxelles/i)).toBeInTheDocument();
    });
    
    // Réinitialiser les mocks avant les tests de changement
    mockSetEnregistrement.mockClear();
    
    // Modifier le nom du studio
    fireEvent.change(screen.getByLabelText(/Nom du studio/i), { target: { value: 'Studio Test' } });
    expect(mockSetEnregistrement).toHaveBeenCalledWith(expect.objectContaining({
      nom_studio: 'Studio Test'
    }));
    
    // Réinitialiser le mock avant le prochain test
    mockSetEnregistrement.mockClear();
    
    // Modifier la description
    fireEvent.change(screen.getByLabelText(/Description du studio/i), { target: { value: 'Description test' } });
    expect(mockSetEnregistrement).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Description test'
    }));
    
    // Réinitialiser le mock avant le prochain test
    mockSetEnregistrement.mockClear();
    
    // Modifier l'adresse
    fireEvent.change(screen.getByLabelText(/Adresse du studio/i), { target: { value: '123 Rue Test' } });
    expect(mockSetEnregistrement).toHaveBeenCalledWith(expect.objectContaining({
      adresse: '123 Rue Test'
    }));
    
    // Réinitialiser le mock avant le prochain test
    mockSetEnregistrement.mockClear();
    
    // Modifier le prix
    fireEvent.change(screen.getByLabelText(/Prix par heure/i), { target: { value: '50' } });
    expect(mockSetEnregistrement).toHaveBeenCalledWith(expect.objectContaining({
      prix_par_heure: '50'
    }));
    
    // Réinitialiser le mock avant le prochain test
    mockSetEnregistrement.mockClear();
    
    // Modifier les équipements
    fireEvent.change(screen.getByLabelText(/Équipements/i), { target: { value: 'Micro, Console' } });
    expect(mockSetEnregistrement).toHaveBeenCalledWith(expect.objectContaining({
      equipement: 'Micro, Console'
    }));
    
    // Réinitialiser le mock avant le prochain test
    mockSetEnregistrement.mockClear();
    
    // Sélectionner un propriétaire - CORRECTION
    const selectProprietaire = screen.getByLabelText(/Propriétaire \?/i);
    fireEvent.change(selectProprietaire, { target: { name: 'artiste_id', value: '1' } });
    expect(mockSetEnregistrement).toHaveBeenCalledWith(expect.objectContaining({
      artiste_id: '1'
    }));
    
    // Réinitialiser le mock avant le prochain test
    mockSetEnregistrement.mockClear();
    
    // Sélectionner un code postal
    const selectCodePostal = screen.getByLabelText(/Code postal/i);
    fireEvent.change(selectCodePostal, { target: { name: 'code_postal', value: '1000' } });
    expect(mockSetEnregistrement).toHaveBeenCalledWith(expect.objectContaining({
      code_postal: '1000'
    }));
  });

  test('vérifie que les champs requis sont présents', async () => {
    renderComponent();
    
    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByLabelText(/Nom du studio/i)).toBeInTheDocument();
    });
    
    // Vérifier les attributs required
    expect(screen.getByLabelText(/Nom du studio/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/Description du studio/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/Adresse du studio/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/Code postal/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/Prix par heure/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/Équipements/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/Propriétaire \?/i)).toHaveAttribute('required');
  });

  test('vérifie les attributs min et step pour le prix', async () => {
    renderComponent();
    
    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByLabelText(/Prix par heure/i)).toBeInTheDocument();
    });
    
    // Vérifier les attributs min et step
    const prixInput = screen.getByLabelText(/Prix par heure/i);
    expect(prixInput).toHaveAttribute('min', '0');
    expect(prixInput).toHaveAttribute('step', '0.01');
  });

  test('transforme la chaîne équipements en tableau lors de la soumission', async () => {
    const mockEnregistrementWithEquipement = {
      ...mockEnregistrement,
      nom_studio: 'Studio Test',
      description: 'Description test',
      adresse: '123 Rue Test',
      code_postal: '1000',
      prix_par_heure: '50',
      equipement: 'Micro, Console, Ampli',
      artiste_id: '1'
    };
    
    // Mock pour la soumission du formulaire
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
    
    renderComponent(mockEnregistrementWithEquipement);
    
    // Soumettre le formulaire
    const form = screen.getByTestId('enregistrement-form');
    fireEvent.submit(form);
    
    // Vérifier que fetch est appelé avec les bons paramètres
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/studio/enregistrer', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }));
      
      // Vérifier que la chaîne d'équipements est convertie en tableau
      const fetchCall = global.fetch.mock.calls.find(call => call[0] === '/api/studio/enregistrer');
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.equipements).toEqual(['Micro', 'Console', 'Ampli']);
    });
  });

  test('traite correctement les équipements avec des espaces supplémentaires', async () => {
    const mockEnregistrementWithExtraSpaces = {
      ...mockEnregistrement,
      nom_studio: 'Studio Test',
      description: 'Description test',
      adresse: '123 Rue Test',
      code_postal: '1000',
      prix_par_heure: '50',
      equipement: ' Micro ,  Console  , Ampli ',
      artiste_id: '1'
    };
    
    // Mock pour la soumission du formulaire
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
    
    renderComponent(mockEnregistrementWithExtraSpaces);
    
    // Soumettre le formulaire
    const form = screen.getByTestId('enregistrement-form');
    fireEvent.submit(form);
    
    // Vérifier que fetch est appelé avec les bons paramètres
    await waitFor(() => {
      const fetchCall = global.fetch.mock.calls.find(call => call[0] === '/api/studio/enregistrer');
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.equipements).toEqual(['Micro', 'Console', 'Ampli']);
    });
  });

  test('filtre les équipements vides', async () => {
    const mockEnregistrementWithEmptyEquipment = {
      ...mockEnregistrement,
      nom_studio: 'Studio Test',
      description: 'Description test',
      adresse: '123 Rue Test',
      code_postal: '1000',
      prix_par_heure: '50',
      equipement: 'Micro, , Console, , Ampli',
      artiste_id: '1'
    };
    
    // Mock pour la soumission du formulaire
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
    
    renderComponent(mockEnregistrementWithEmptyEquipment);
    
    // Soumettre le formulaire
    const form = screen.getByTestId('enregistrement-form');
    fireEvent.submit(form);
    
    // Vérifier que fetch est appelé avec les bons paramètres
    await waitFor(() => {
      const fetchCall = global.fetch.mock.calls.find(call => call[0] === '/api/studio/enregistrer');
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.equipements).toEqual(['Micro', 'Console', 'Ampli']);
    });
  });

  test('convertit correctement le prix en nombre lors de la soumission', async () => {
    const mockEnregistrementWithPrice = {
      ...mockEnregistrement,
      nom_studio: 'Studio Test',
      description: 'Description test',
      adresse: '123 Rue Test',
      code_postal: '1000',
      prix_par_heure: '50.75', // Prix avec décimale
      equipement: 'Micro',
      artiste_id: '1'
    };
    
    // Mock pour la soumission du formulaire
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
    
    renderComponent(mockEnregistrementWithPrice);
    
    // Soumettre le formulaire
    const form = screen.getByTestId('enregistrement-form');
    fireEvent.submit(form);
    
    // Vérifier que fetch est appelé avec les bons paramètres
    await waitFor(() => {
      const fetchCall = global.fetch.mock.calls.find(call => call[0] === '/api/studio/enregistrer');
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.prix_par_heure).toBe(50.75); // Converti en nombre
      expect(typeof requestBody.prix_par_heure).toBe('number');
    });
  });

  test('gère les erreurs lors de la soumission du formulaire', async () => {
    const mockEnregistrementData = {
      ...mockEnregistrement,
      nom_studio: 'Studio Test',
      description: 'Description test',
      adresse: '123 Rue Test',
      code_postal: '1000',
      prix_par_heure: '50',
      equipement: 'Micro',
      artiste_id: '1'
    };
    
    // Mock pour simuler une erreur lors de la soumission
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Erreur serveur')
      })
    );
    
    // Spy sur console.error pour éviter les erreurs dans la console
    console.error = jest.fn();
    
    renderComponent(mockEnregistrementData);
    
    // Soumettre le formulaire
    const form = screen.getByTestId('enregistrement-form');
    fireEvent.submit(form);
    
    // Vérifier que l'erreur est gérée
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringContaining('Erreur'), 'error');
    });
  });

  test('gère les erreurs réseau lors de la soumission du formulaire', async () => {
    const mockEnregistrementData = {
      ...mockEnregistrement,
      nom_studio: 'Studio Test',
      description: 'Description test',
      adresse: '123 Rue Test',
      code_postal: '1000',
      prix_par_heure: '50',
      equipement: 'Micro',
      artiste_id: '1'
    };
    
    // Mock pour simuler une erreur réseau
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network Error'))
    );
    
    // Spy sur console.error pour éviter les erreurs dans la console
    console.error = jest.fn();
    
    renderComponent(mockEnregistrementData);
    
    // Soumettre le formulaire
    const form = screen.getByTestId('enregistrement-form');
    fireEvent.submit(form);
    
    // Vérifier que l'erreur est gérée
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringContaining('Erreur'), 'error');
    });
  });

  test('le bouton de retour appelle la fonction onBack', async () => {
    renderComponent();
    
    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retour/i })).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton retour
    fireEvent.click(screen.getByRole('button', { name: /Retour/i }));
    
    // Vérifier que onBack est appelé
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  test('soumet le formulaire avec les bonnes données', async () => {
    const mockEnregistrementComplete = {
      nom_studio: 'Studio Complet',
      description: 'Description complète',
      adresse: '123 Avenue Test',
      code_postal: '1000',
      prix_par_heure: '75.50',
      equipement: 'Micro, Table de mixage, Casque',
      artiste_id: '2',
      photo_url: 'test-image-url'
    };
    
    // Mock pour la soumission du formulaire
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, id: 123 })
      })
    );
    
    renderComponent(mockEnregistrementComplete);
    
    // Soumettre le formulaire
    const form = screen.getByTestId('enregistrement-form');
    fireEvent.submit(form);
    
    // Vérifier que fetch est appelé avec les bonnes données
    await waitFor(() => {
      const fetchCall = global.fetch.mock.calls.find(call => call[0] === '/api/studio/enregistrer');
      expect(fetchCall).toBeTruthy();
      
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody).toEqual({
        nom: 'Studio Complet',
        description: 'Description complète',
        adresse: '123 Avenue Test',
        code_postal: '1000',
        prix_par_heure: 75.5, // Converti en nombre
        equipements: ['Micro', 'Table de mixage', 'Casque'],
        photo_url: 'test-image-url',
        proprietaire_id: '2'
      });
      
      // Vérifier que le snackbar est affiché avec un message de succès
      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringContaining('succès'), 'success');
    });
  });
});