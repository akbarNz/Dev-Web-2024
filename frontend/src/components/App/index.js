import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// config imports
import config from '../../config/env';
// component imports 
import Header from '../HeaderComponent';
import StudioFinder from '../StudioFinderComponent';

console.log('APP URL:', config.apiUrl);

const App = () => (
    <BrowserRouter>
        <div>
            <Header />
            <Routes>
                <Route path="/" element={<StudioFinder />} />
                <Route path="/signup" element={<div>Sign Up Page</div>} />
                <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
        </div>
    </BrowserRouter>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);