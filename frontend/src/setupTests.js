// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Mock pour @base-ui-components/react/dialog
jest.mock('@base-ui-components/react/dialog', () => ({
  Dialog: ({ children, ...props }) => (
    <div data-testid="mock-dialog" {...props}>{children}</div>
  )
}), { virtual: true });

// Mock pour multi-range-slider-react
jest.mock('multi-range-slider-react', () => ({
  __esModule: true,
  default: function MockSlider(props) {
    return (
      <div data-testid="mock-slider" {...props} />
    );
  }
}), { virtual: true });

// Mock pour Cloudinary
jest.mock('@cloudinary/url-gen/actions/delivery', () => ({}), { virtual: true });

// Mock pour axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: { public_id: 'test-id' } }))
}), { virtual: true });