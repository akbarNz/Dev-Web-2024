import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Map from '../Map';

// Mock google maps
const mockAdvancedMarkerElement = jest.fn();
const mockMap = {};

global.google = {
    maps: {
        marker: {
            AdvancedMarkerElement: mockAdvancedMarkerElement
        }
    }
};

jest.mock('@react-google-maps/api', () => ({
    GoogleMap: ({ onLoad, children }) => (
        <div data-testid="google-map" onClick={() => onLoad && onLoad(mockMap)}>
            {children}
        </div>
    ),
    LoadScript: ({ children }) => <div>{children}</div>
}));

describe('Map', () => {
    beforeEach(() => {
        mockAdvancedMarkerElement.mockClear();
    });

    test('renders map with default config when no props provided', () => {
        const { getByTestId } = render(<Map />);
        expect(getByTestId('google-map')).toBeInTheDocument();
    });

    test('creates advanced marker when markers provided', () => {
        const center = { lat: 48.8566, lng: 2.3522 };
        const markers = [{
            position: center,
            title: 'Test Marker'
        }];

        const { getByTestId } = render(
            <Map 
                center={center} 
                markers={markers}
            />
        );

        const map = getByTestId('google-map');
        map.click(); // Trigger onLoad

        expect(mockAdvancedMarkerElement).toHaveBeenCalledWith(
            expect.objectContaining({
                position: center,
                map: mockMap,
                title: 'Test Marker'
            })
        );
    });

    test('creates multiple markers', () => {
        const markers = [
            {
                position: { lat: 48.8566, lng: 2.3522 },
                title: 'Marker 1'
            },
            {
                position: { lat: 48.8567, lng: 2.3523 },
                title: 'Marker 2'
            }
        ];

        const { getByTestId } = render(<Map markers={markers} />);
        const map = getByTestId('google-map');
        map.click();

        expect(mockAdvancedMarkerElement).toHaveBeenCalledTimes(2);
        expect(mockAdvancedMarkerElement).toHaveBeenNthCalledWith(1,
            expect.objectContaining({
                position: markers[0].position,
                title: markers[0].title
            })
        );
    });
});