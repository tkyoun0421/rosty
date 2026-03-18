import { render, screen } from '@testing-library/react-native';

import { HomeScreen } from '@/features/home/ui/home-screen';

describe('HomeScreen', () => {
  it('renders the scaffold headline and checklist', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Rosty')).toBeTruthy();
    expect(screen.getByText('Wedding hall operations cockpit')).toBeTruthy();
    expect(screen.getByText('Boot checklist')).toBeTruthy();
  });
});
