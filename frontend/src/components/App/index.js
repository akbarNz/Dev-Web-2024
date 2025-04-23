import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudioFinder from '../StudioFinderComponent';

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<StudioFinder />} />
            <Route path="/signup" element={<div>Sign Up Page</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
    </BrowserRouter>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);