import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModifProfil from './ModifProfil'; // adapte le chemin si besoin
import '@testing-library/jest-dom/extend-expect';

describe('ModifProfil component', () => {
  const userDataMock = {
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    telephone: '0601020304',
    role: 'Client',
    photo: 'photo-url.jpg',
  };

  beforeEach(() => {
    // Mock de la fonction fetch
    global.fetch = jest.fn()
      .mockImplementation((url, options) => {
        if (url.includes('/getUserInfo')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(userDataMock),
          });
        }

        if (url.includes('/saveUserInfo')) {
          return Promise.resolve({ ok: true });
        }

        return Promise.reject(new Error('Unknown URL'));
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders profile modification form with fetched user data', async () => {
    render(<ModifProfil userId="12345" />);

    // Attend que les champs soient remplis avec les données mockées
    expect(await screen.findByDisplayValue('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jean.dupont@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0601020304')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Client')).toBeInTheDocument();
  });

  test('modifies and saves updated user data', async () => {
    render(<ModifProfil userId="12345" />);

    const nameInput = await screen.findByLabelText(/nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const telInput = screen.getByLabelText(/téléphone/i);
    const roleInput = screen.getByLabelText(/rôle/i);
    const saveButton = screen.getByRole('button', { name: /enregistrer/i });

    // Simule des changements
    fireEvent.change(nameInput, { target: { value: 'Julie Martin' } });
    fireEvent.change(emailInput, { target: { value: 'julie.martin@example.com' } });
    fireEvent.change(telInput, { target: { value: '0611223344' } });
    fireEvent.change(roleInput, { target: { value: 'Photographe' } });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/saveUserInfo'), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          _id: '12345',
          name: 'Julie Martin',
          email: 'julie.martin@example.com',
          telephone: '0611223344',
          role: 'Photographe',
        }),
      }));
    });
  });
});
