
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Favoris, { retirerFavori } from './Favoris';
import * as SnackBarModule from './SnackBar';

beforeEach(() => {
  jest.spyOn(SnackBarModule, 'useSnackbar').mockReturnValue({ showSnackbar: jest.fn() });
  localStorage.setItem('currentUser', JSON.stringify({ id: 123 }));
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(mockFavoris)
  });
});

// Mock global de useSnackbar (peut être écrasé ensuite si besoin)
jest.mock('./SnackBar', () => ({
  useSnackbar: jest.fn(() => ({ showSnackbar: jest.fn() }))
}));

const mockFavoris = [
  { studio_id: 1, nom: 'Studio Test 1', adresse: 'Adresse 1' },
  { studio_id: 2, nom: 'Studio Test 2', adresse: 'Adresse 2' }
];

beforeEach(() => {
  localStorage.setItem('currentUser', JSON.stringify({ id: 123 }));
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(mockFavoris)
  });
});

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('Rend correctement le composant et fetch les favoris', async () => {
  render(<Favoris onBack={jest.fn()} />);
  expect(await screen.findByText('Mes Studios Favoris')).toBeInTheDocument();
  expect(await screen.findByText('Studio Test 1')).toBeInTheDocument();
  expect(await screen.findByText('Studio Test 2')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/api/favoris?client=123');
});

test('Affiche un message si aucun favori', async () => {
  global.fetch.mockResolvedValueOnce({
    json: () => Promise.resolve([]),
  });

  render(<Favoris onBack={jest.fn()} />);
  expect(await screen.findByText("Aucun favori pour l'instant.")).toBeInTheDocument();
});

test('Clique sur le bouton "Retour"', async () => {
  const onBack = jest.fn();
  render(<Favoris onBack={onBack} />);
  const backButton = await screen.findByText('Retour');
  fireEvent.click(backButton);
  expect(onBack).toHaveBeenCalled();
});

test('Retirer un favori appelle fetch DELETE et met à jour la liste', async () => {
  const mockSnackbar = jest.fn();
  jest.spyOn(require('./SnackBar'), 'useSnackbar').mockReturnValue({ showSnackbar: mockSnackbar });

  const deleteMock = jest.fn().mockResolvedValue({ ok: true });
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ json: () => Promise.resolve(mockFavoris) }) // initial fetch
    .mockImplementationOnce(deleteMock); // delete fetch

  render(<Favoris onBack={jest.fn()} />);

  const retirerButton = await screen.findAllByText('Retirer');
  fireEvent.click(retirerButton[0]);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith('/api/favoris', expect.objectContaining({
      method: 'DELETE',
    }));
    expect(mockSnackbar).toHaveBeenCalledWith('Favori retiré !', 'info');
  });
});

test('Retirer un favori appelle fetch DELETE et met à jour la liste', async () => {
  const mockSnackbar = jest.fn();
  jest.spyOn(require('./SnackBar'), 'useSnackbar').mockReturnValue({ showSnackbar: mockSnackbar });

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFavoris),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

  render(<Favoris onBack={jest.fn()} />);

  const retirerButton = await screen.findAllByText('Retirer');
  fireEvent.click(retirerButton[0]);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith('/api/favoris', expect.objectContaining({
      method: 'DELETE',
    }));
    expect(mockSnackbar).toHaveBeenCalledWith('Favori retiré !', 'info');
  });
});

test('retirerFavori appelle onSuccess après suppression', async () => {
  const mockSnackbar = jest.fn();
  const onSuccess = jest.fn();

  global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
  await retirerFavori(1, 2, mockSnackbar, onSuccess);

  expect(mockSnackbar).toHaveBeenCalledWith('Favori retiré !', 'info');
  expect(onSuccess).toHaveBeenCalled();
});

test('Supporte les événements userChanged', async () => {
  const mockSnackbar = jest.fn();
  jest.spyOn(require('./SnackBar'), 'useSnackbar').mockReturnValue({ showSnackbar: mockSnackbar });

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ json: () => Promise.resolve(mockFavoris) })
    .mockResolvedValueOnce({ json: () => Promise.resolve([{ studio_id: 99, nom: 'New Studio', adresse: 'New Place' }]) });

  render(<Favoris onBack={jest.fn()} />);

  act(() => {
    const event = new CustomEvent('userChanged', { detail: { id: 456 } });
    window.dispatchEvent(event);
  });

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith('/api/favoris?client=456');
    expect(screen.queryByText('Studio Test 1')).not.toBeInTheDocument();
    expect(screen.getByText('New Studio')).toBeInTheDocument();
  });
});

test('Snapshot du rendu initial', async () => {
  const mockSnackbar = jest.fn();
  jest.spyOn(require('./SnackBar'), 'useSnackbar').mockReturnValue({ showSnackbar: mockSnackbar });

  const { asFragment } = render(<Favoris onBack={jest.fn()} />);
  await screen.findByText('Mes Studios Favoris');
  expect(asFragment()).toMatchSnapshot();
});

test('Affiche une erreur si la suppression échoue', async () => {
  const mockSnackbar = jest.fn();
  jest.spyOn(require('./SnackBar'), 'useSnackbar').mockReturnValue({ showSnackbar: mockSnackbar });

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ json: () => Promise.resolve(mockFavoris) }) // fetch initial
    .mockResolvedValueOnce({ ok: false }); // échec du DELETE

  render(<Favoris onBack={jest.fn()} />);
  const retirerButton = await screen.findAllByText('Retirer');
  fireEvent.click(retirerButton[0]);

  await waitFor(() => {
    expect(mockSnackbar).toHaveBeenCalledWith("Erreur lors du retrait du favori.", "error");
  });
});

test('Affiche une erreur si le chargement initial échoue', async () => {
  const mockSnackbar = jest.fn();
  jest.spyOn(require('./SnackBar'), 'useSnackbar').mockReturnValue({ showSnackbar: mockSnackbar });

  global.fetch = jest.fn().mockRejectedValueOnce(new Error('Fetch failed'));

  render(<Favoris onBack={jest.fn()} />);

  await waitFor(() => {
    expect(mockSnackbar).toHaveBeenCalledWith('Erreur lors du chargement des favoris.', 'error');
  });
});

test('Met à jour l’état local après avoir retiré un favori', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ json: () => Promise.resolve(mockFavoris) }) // fetch initial
    .mockResolvedValueOnce({ ok: true }); // delete

  render(<Favoris onBack={jest.fn()} />);
  expect(await screen.findByText('Studio Test 1')).toBeInTheDocument();

  const retirerButtons = await screen.findAllByText('Retirer');
  fireEvent.click(retirerButtons[0]);

  await waitFor(() => {
    expect(screen.queryByText('Studio Test 1')).not.toBeInTheDocument();
    expect(screen.getByText('Studio Test 2')).toBeInTheDocument();
  });
});

test('Le bouton "Retirer" est désactivé pendant le chargement', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ json: () => Promise.resolve(mockFavoris) })
    .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));

  render(<Favoris onBack={jest.fn()} />);
  const retirerButtons = await screen.findAllByText('Retirer');

  fireEvent.click(retirerButtons[0]);
  expect(retirerButtons[0]).toBeDisabled();
});

test('Ne tente pas de fetch si currentUser est null', async () => {
  localStorage.removeItem('currentUser');
  const mockSnackbar = jest.fn();
  jest.spyOn(require('./SnackBar'), 'useSnackbar').mockReturnValue({ showSnackbar: mockSnackbar });

  render(<Favoris onBack={jest.fn()} />);
  await waitFor(() => {
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockSnackbar).toHaveBeenCalledWith('Utilisateur non identifié.', 'error');
  });
});

test('Affiche les adresses des studios', async () => {
  render(<Favoris onBack={jest.fn()} />);
  expect(await screen.findByText('Adresse 1')).toBeInTheDocument();
  expect(screen.getByText('Adresse 2')).toBeInTheDocument();
});


