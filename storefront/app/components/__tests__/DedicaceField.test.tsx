import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {DedicaceField} from '../DedicaceField';

describe('DedicaceField', () => {
  it('checkbox unchecked par défaut, input caché', () => {
    render(<DedicaceField onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.queryByPlaceholderText(/à qui dédicacer/i)).not.toBeInTheDocument();
  });

  it('toggle checkbox affiche l\'input', () => {
    render(<DedicaceField onChange={() => {}} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByPlaceholderText(/à qui dédicacer/i)).toBeInTheDocument();
  });

  it('émet onChange avec activated + name', () => {
    const onChange = vi.fn();
    render(<DedicaceField onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenLastCalledWith({activated: true, name: ''});
    fireEvent.change(screen.getByPlaceholderText(/à qui dédicacer/i), {
      target: {value: 'Marie'},
    });
    expect(onChange).toHaveBeenLastCalledWith({activated: true, name: 'Marie'});
  });
});
