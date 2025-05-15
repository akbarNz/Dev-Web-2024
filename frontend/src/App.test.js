import { render, screen } from '@testing-library/react';
import App from './App';

// Mockez les composants enfants problématiques
jest.mock('./components/Filtrage', () => () => <div>Mock FilterForm</div>);
jest.mock('./components/FormulaireEnregiStudio', () => () => <div>Mock EnregistrementForm</div>);

test('renders app without crashing', () => {
  render(<App />);
  expect(screen.getByText(/Mock FilterForm/i)).toBeInTheDocument();
});

// Mock des modules Cloudinary avant les imports problématiques
jest.mock('@cloudinary/url-gen', () => ({
  Cloudinary: jest.fn(() => ({
    image: jest.fn(() => ({}))
  }))
}));

jest.mock('@cloudinary/react', () => ({
  AdvancedImage: jest.fn(() => null)
}));

jest.mock('@cloudinary/url-gen/actions/delivery', () => ({
  quality: jest.fn()
}));


test('renders learn react link', () => {
  render(<App />);
  // Vos assertions...
});