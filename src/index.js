import React from 'react';
import { createRoot } from 'react-dom/client';
// component imports
import GeolocationComponent from './components/GeolocationComponent'; 

const App = () => (
    <div>
        <h1>Hello, React!</h1>
        <GeolocationComponent />
    </div>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);