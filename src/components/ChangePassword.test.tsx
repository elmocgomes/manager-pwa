import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePassword } from './ChangePassword';

const { updateUser } = vi.hoisted(() => ({ updateUser: vi.fn() }));
vi.mock('../lib/supabase', () => ({ supabase: { auth: { updateUser } } }));

function open() {
  fireEvent.click(screen.getByRole('button', { name: /change password/i }));
}
function type(label: RegExp, value: string) {
  fireEvent.change(screen.getByPlaceholderText(label), { target: { value } });
}

describe('ChangePassword', () => {
  beforeEach(() => updateUser.mockReset());

  it('opens the dialog from the trigger', () => {
    render(<ChangePassword />);
    expect(screen.queryByRole('dialog')).toBeNull();
    open();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('rejects mismatched passwords without calling Supabase', () => {
    render(<ChangePassword />);
    open();
    type(/New password/, 'longenough1');
    type(/Confirm/, 'different123');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('rejects too-short passwords', () => {
    render(<ChangePassword />);
    open();
    type(/New password/, 'short');
    type(/Confirm/, 'short');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(screen.getByText(/at least 8/i)).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('calls Supabase and confirms on a valid change', async () => {
    updateUser.mockResolvedValue({ error: null });
    render(<ChangePassword />);
    open();
    type(/New password/, 'newpassword1');
    type(/Confirm/, 'newpassword1');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith({ password: 'newpassword1' }));
    expect(await screen.findByText(/password updated/i)).toBeInTheDocument();
  });

  it('surfaces a Supabase error', async () => {
    updateUser.mockResolvedValue({ error: { message: 'New password should be different' } });
    render(<ChangePassword />);
    open();
    type(/New password/, 'samepass1234');
    type(/Confirm/, 'samepass1234');
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText(/should be different/i)).toBeInTheDocument();
  });
});
