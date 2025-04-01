import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Map from '../../../../../src/components/Map';

// Mock google maps
const mockAdvancedMarkerElement = jest.fn();
global.google = {
    maps: {
        marker: {
            AdvancedMarkerElement: mockAdvancedMarkerElement
        }
    }
};

jest.mock('@react-google-maps/api', () => ({
    GoogleMap: ({ onLoad, children }) => (
        <div data-testid="google-map" onClick={() => onLoad && onLoad()}>
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

    test('creates advanced marker when center provided', () => {
        const center = { lat: 48.8566, lng: 2.3522 };
        const { getByTestId } = render(<Map center={center} />);
        const map = getByTestId('google-map');
        map.click(); // Trigger onLoad
        expect(mockAdvancedMarkerElement).toHaveBeenCalledWith(
            expect.objectContaining({
                position: center
            })
        );
    });
});