import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallBanner } from './InstallBanner';
import { isIOS, INSTALL_DISMISSED_KEY } from '../lib/pwa';

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1';
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';

function setUA(ua: string) {
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
}

describe('isIOS', () => {
  it('detects iPhone', () => expect(isIOS(IPHONE_UA, false)).toBe(true));
  it('rejects desktop', () => expect(isIOS(DESKTOP_UA, false)).toBe(false));
  it('detects iPadOS-as-Mac with touch', () => {
    expect(isIOS('Mozilla/5.0 (Macintosh; Intel Mac OS X)', true)).toBe(true);
    expect(isIOS('Mozilla/5.0 (Macintosh; Intel Mac OS X)', false)).toBe(false);
  });
});

describe('InstallBanner', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => setUA(DESKTOP_UA));

  it('shows iOS Add-to-Home-Screen instructions on iPhone', () => {
    setUA(IPHONE_UA);
    render(<InstallBanner />);
    expect(screen.getByText(/Add to Home Screen/)).toBeInTheDocument();
  });

  it('renders nothing on desktop without an install prompt', () => {
    setUA(DESKTOP_UA);
    const { container } = render(<InstallBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('dismiss hides the banner and persists', () => {
    setUA(IPHONE_UA);
    render(<InstallBanner />);
    fireEvent.click(screen.getByLabelText(/dismiss/i));
    expect(screen.queryByText(/Add to Home Screen/)).not.toBeInTheDocument();
    expect(localStorage.getItem(INSTALL_DISMISSED_KEY)).toBe('1');
  });

  it('stays hidden when previously dismissed', () => {
    setUA(IPHONE_UA);
    localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    const { container } = render(<InstallBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
