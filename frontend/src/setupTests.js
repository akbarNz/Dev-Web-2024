// src/setupTests.js
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Mock pour @base-ui-components/react/dialog
jest.mock('@base-ui-components/react/dialog', () => ({
  Dialog: ({ children, ...props }) => (
    <div data-testid="mock-dialog" {...props}>
      {children}
    </div>
  )
}), { virtual: true });

// Vous pouvez ajouter d'autres mocks globaux ici