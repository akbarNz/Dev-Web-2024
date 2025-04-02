import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GeolocationComponent from '../GeolocationComponent';
import { findNearbyStudios } from '../../../services/studioService';

// Mock the services
jest.mock('../../../services/studioService');

// Mock the Map component
jest.mock('../Map', () => {
    return function DummyMap({ markers }) {
        return <div data-testid="map">Map with {markers?.length} markers</div>;
    };
});

// Mock the geolocation API
const mockGeolocation = {
    getCurrentPosition: jest.fn()
};
global.navigator.geolocation = mockGeolocation;

describe('GeolocationComponent', () => {
    beforeEach(() => {
        mockGeolocation.getCurrentPosition.mockClear();
        findNearbyStudios.mockClear();
    });

    test('renders loading state initially', () => {
        render(<GeolocationComponent />);
        expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    test('displays map with markers when geolocation succeeds', async () => {
        const fakePosition = {
            coords: {
                latitude: 48.8566,
                longitude: 2.3522
            }
        };

        const mockStudios = [
            { id: 1, nom: 'Studio A', latitude: 48.8567, longitude: 2.3523 },
            { id: 2, nom: 'Studio B', latitude: 48.8568, longitude: 2.3524 }
        ];

        mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => 
            success(fakePosition)
        );

        findNearbyStudios.mockResolvedValueOnce(mockStudios);

        render(<GeolocationComponent />);

        // Wait for map to render with markers
        await screen.findByTestId('map');
        expect(screen.getByText('Map with 3 markers')).toBeInTheDocument(); // User location + 2 studios
    });

    test('displays error message when API call fails', async () => {
        const fakePosition = {
            coords: {
                latitude: 48.8566,
                longitude: 2.3522
            }
        };

        mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => 
            success(fakePosition)
        );

        findNearbyStudios.mockRejectedValueOnce(new Error('API Error'));

        render(<GeolocationComponent />);

        await screen.findByText(/Failed to fetch nearby studios/);
    });
});