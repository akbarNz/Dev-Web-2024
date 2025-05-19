// src/__mocks__/dialog.js
import React from 'react';

export const Dialog = ({ children, ...props }) => (
  <div data-testid="mock-dialog" {...props}>
    {children}
  </div>
);