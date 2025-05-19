// src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock pour @base-ui-components/react/dialog
jest.mock('@base-ui-components/react/dialog', () => ({
  Dialog: ({ children, ...props }) => (
    <div data-testid="mock-dialog" {...props}>
      {children}
    </div>
  )
}), { virtual: true });

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});