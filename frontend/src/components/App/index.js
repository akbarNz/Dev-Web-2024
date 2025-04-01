import React from 'react';
import { createRoot } from 'react-dom/client';
// config imports
import config from '../../config/env';
// component imports
import GeolocationComponent from '../GeolocationComponent/GeolocationComponent'; 

console.log('API URL:', config.apiUrl);

const App = () => (
    <div>
        <h1>Hello, React!</h1>
        <GeolocationComponent />
    </div>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);