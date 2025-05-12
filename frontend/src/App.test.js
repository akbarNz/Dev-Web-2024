import { render, screen } from '@testing-library/react';
import App from './App';

// Mockez les composants enfants problématiques
jest.mock('./components/Filtrage', () => () => <div>Mock FilterForm</div>);
jest.mock('./components/FormulaireEnregiStudio', () => () => <div>Mock EnregistrementForm</div>);

test('renders app without crashing', () => {
  render(<App />);
  expect(screen.getByText(/Mock FilterForm/i)).toBeInTheDocument();
});