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
            <Route path="/studios/:id/book" element={<div>Booking Page</div>} />
            {/* Footer page routes */}
            <Route path="/contact" element={<div>Contact Us Page</div>} />
            <Route path="/cookies" element={<div>Cookies Policy Page</div>} />
            <Route path="/privacy" element={<div>Privacy Policy Page</div>} />
            <Route path="/terms" element={<div>Terms & Conditions Page</div>} />
        </Routes>
    </BrowserRouter>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);