import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShortLinksList from '@/components/ShortLinksList/ShortLinksList';

describe('ShortLinksList validation', () => {
  const mockLinks = [
    {
      id: '1',
      original_url: 'https://google.com',
      short_url: 'http://localhost:8080/shortlinks/1',
      created_at: new Date().toISOString(),
    },
  ];
  function setLinks() {};
  
  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });
  });
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // EMPTY LIST
  it('shows loader then empty short links list', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ShortLinksList isOpen={true} links={[]} setLinks={setLinks} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no short links created yet/i)).toBeInTheDocument();
  });

  // COPY LINK TO CLIPBOARD
  it('copies short URL to clipboard', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLinks,
    });
    
    render(<ShortLinksList isOpen={true} links={mockLinks} setLinks={setLinks} />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
      await screen.findByRole('button', { name: /copy/i })
    );

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      mockLinks[0].short_url
    );
    expect(await screen.findByText(/copied!/i)).toBeInTheDocument();
  });

  // OPEN LINK IN NEW TAB
  it('short URL opens in new tab', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLinks,
    });

    render(<ShortLinksList isOpen={true} links={mockLinks} setLinks={setLinks} />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    const link = await screen.findByRole('link', {
      name: mockLinks[0].short_url,
    });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
