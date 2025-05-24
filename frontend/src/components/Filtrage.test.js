import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FilterForm from './Filtrage';

beforeEach(() => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ json: () => Promise.resolve({ prix_min: 10, prix_max: 100 }) })
    .mockResolvedValueOnce({ json: () => Promise.resolve([
      { equipements: 'WiFi' },
      { equipements: 'Climatisation' }
    ]) });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('rend correctement le composant', async () => {
  render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  await waitFor(() => expect(screen.getByText('Filtrer les studios')).toBeInTheDocument());
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('fetch équipements et les affiche', async () => {
  render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  expect(await screen.findByLabelText('WiFi')).toBeInTheDocument();
  expect(screen.getByLabelText('Climatisation')).toBeInTheDocument();
});

test('Slider déclenche handleInput et met à jour les filtres', async () => {
  const setFilters = jest.fn();
  render(<FilterForm filters={{}} setFilters={setFilters} />);
  fireEvent.click(await screen.findByTestId('multi-slider'));

  await waitFor(() => {
    expect(setFilters).toHaveBeenCalled();
    const found = setFilters.mock.calls.some(([fn]) => {
      if (typeof fn === 'function') {
        const result = fn({ prixMin: 10, prixMax: 100 });
        return result.prixMin === 20 && result.prixMax === 80;
      }
      return false;
    });
    expect(found).toBe(true);
  });
});

test('Affiche correctement les valeurs du slider', async () => {
  render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  expect(await screen.findByText('10 €')).toBeInTheDocument();
  expect(screen.getByText('100 €')).toBeInTheDocument();
});

test('Rating déclenche handleRating et met à jour les filtres', async () => {
  const setFilters = jest.fn();
  render(<FilterForm filters={{}} setFilters={setFilters} />);
  fireEvent.change(screen.getByTestId('rating'), { target: { value: 4 } });

  await waitFor(() => {
    const found = setFilters.mock.calls.some(([fn]) => {
      if (typeof fn === 'function') {
        const result = fn({});
        return result.noteMin === 4;
      }
      return false;
    });
    expect(found).toBe(true);
  });
});

test('Checkbox sélectionne un équipement', async () => {
  const setFilters = jest.fn();
  render(<FilterForm filters={{}} setFilters={setFilters} />);
  const wifiCheckbox = await screen.findByLabelText('WiFi');
  fireEvent.click(wifiCheckbox);

  await waitFor(() => {
    const found = setFilters.mock.calls.some(([fn]) => {
      if (typeof fn === 'function') {
        const result = fn({ selectedEquipements: [] });
        return (
          Array.isArray(result.selectedEquipements) &&
          result.selectedEquipements.includes('WiFi') &&
          result.selectedEquipements.length === 1
        );
      }
      return false;
    });
    expect(found).toBe(true);
  });
});

test('Checkbox désélectionne un équipement déjà sélectionné', async () => {
  const setFilters = jest.fn();
  render(<FilterForm filters={{}} setFilters={setFilters} />);
  const wifiCheckbox = await screen.findByLabelText('WiFi');
  fireEvent.click(wifiCheckbox);
  fireEvent.click(wifiCheckbox); // désélection

  await waitFor(() => {
    const found = setFilters.mock.calls.some(([fn]) => {
      if (typeof fn === 'function') {
        const result = fn({ selectedEquipements: ['WiFi'] });
        return (
          Array.isArray(result.selectedEquipements) &&
          result.selectedEquipements.length === 0
        );
      }
      return false;
    });
    expect(found).toBe(true);
  });
});

test('Dialog affiche les équipements', async () => {
  render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  expect(await screen.findByText('Sélectionner les équipements')).toBeInTheDocument();
});

test('Titre et description du Dialog sont présents', async () => {
  render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  expect(await screen.findByText('Choisissez les équipements')).toBeInTheDocument();
  expect(screen.getByText('Cochez les équipements que vous souhaitez ajouter.')).toBeInTheDocument();
});

test('Tous les checkboxes sont générés dynamiquement', async () => {
  render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  const checkboxes = await screen.findAllByRole('checkbox');
  expect(checkboxes.length).toBe(2);
});

test('Fermer le Dialog fonctionne', async () => {
  render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  expect(await screen.findByText('Fermer')).toBeInTheDocument();
});

test('Slider ne plante pas sans interaction', async () => {
  render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  expect(await screen.findByTestId('multi-slider')).toBeInTheDocument();
});

test('setFilters appelé avec tous les champs initiaux', async () => {
  const setFilters = jest.fn();
  render(<FilterForm filters={{}} setFilters={setFilters} />);

  await waitFor(() => {
    const found = setFilters.mock.calls.some(([fn]) => {
      if (typeof fn === 'function') {
        const result = fn({});
        return result.prixMin === 10 && result.prixMax === 100;
      }
      return false;
    });
    expect(found).toBe(true);
  });
});

test('Pas d’erreur si fetch échoue', async () => {
  global.fetch = jest.fn()
    .mockRejectedValueOnce(new Error('fail prix'))
    .mockRejectedValueOnce(new Error('fail équipements'));
  render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

test('Aucun équipement sélectionné par défaut', async () => {
  render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  const checkboxes = await screen.findAllByRole('checkbox');
  checkboxes.forEach((cb) => {
    expect(cb).not.toBeChecked();
  });
});

test('Snapshot du rendu initial', async () => {
  const { asFragment } = render(<FilterForm filters={{}} setFilters={jest.fn()} />);
  await waitFor(() => screen.getByText('Filtrer les studios'));
  expect(asFragment()).toMatchSnapshot();
});
