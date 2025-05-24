// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Mock propre pour multi-range-slider-react (respecte import default)
jest.mock('multi-range-slider-react', () => ({
  __esModule: true,
  default: ({ onInput }) => (
    <div
      data-testid="multi-slider"
      onClick={() => onInput?.({ minValue: 20, maxValue: 80 })}
    >
      SliderMock
    </div>
  )
}), { virtual: true });

// Mock pour @mui/material/Rating
jest.mock('@mui/material/Rating', () => (props) => (
  <input
    data-testid="rating"
    onChange={(e) => props.onChange?.(null, parseFloat(e.target.value))}
  />
), { virtual: true });

// Mock simple pour @base-ui-components/react/dialog
jest.mock('@base-ui-components/react/dialog', () => ({
  __esModule: true,
  Dialog: {
    Root: ({ children }) => <div data-testid="dialog-root">{children}</div>,
    Trigger: ({ children, ...props }) => <button {...props}>{children}</button>,
    Portal: ({ children }) => <div>{children}</div>,
    Backdrop: () => <div />,
    Popup: ({ children }) => <div>{children}</div>,
    Title: ({ children }) => <h2>{children}</h2>,
    Description: ({ children }) => <p>{children}</p>,
    Close: ({ children }) => <button>{children}</button>,
  }
}), { virtual: true });


// Mock pour Cloudinary
jest.mock('@cloudinary/url-gen/actions/delivery', () => ({}), { virtual: true });

// Mock pour axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: { public_id: 'test-id' } }))
}), { virtual: true });