import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GeolocationComponent from '../GeolocationComponent';

// Mock the geolocation API
const mockGeolocation = {
    getCurrentPosition: jest.fn()
};
global.navigator.geolocation = mockGeolocation;

describe('GeolocationComponent', () => {
    beforeEach(() => {
        // Clear mock calls between tests
        mockGeolocation.getCurrentPosition.mockClear();
    });

    test('renders loading state initially', () => {
        render(<GeolocationComponent />);
        expect(screen.getByText('Loading location...')).toBeInTheDocument();
    });

    test('displays coordinates when geolocation succeeds', async () => {
        const fakePosition = {
            coords: {
                latitude: 51.507351,
                longitude: -0.127758
            }
        };

        mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => 
            success(fakePosition)
        );

        render(<GeolocationComponent />);

        // Wait for state updates
        await screen.findByText(/Latitude: 51.507351/);
        expect(screen.getByText(/Longitude: -0.127758/)).toBeInTheDocument();
    });

    test('displays error message when geolocation fails', async () => {
        const mockError = new Error('Geolocation permission denied');
        
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => 
            error(mockError)
        );

        render(<GeolocationComponent />);

        await screen.findByText(/Error: Geolocation permission denied/);
    });
});