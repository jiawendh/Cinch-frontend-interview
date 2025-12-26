import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UrlShortenerForm from '@/components/UrlShortenerForm/UrlShortenerForm';

describe('UrlShortenerForm validation', () => {
  function onCreated() {};

  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  // INVALID URLs
  it('shows error for invalid URL', async () => {
    render(<UrlShortenerForm onCreated={onCreated} />);

    await userEvent.type(
      screen.getByPlaceholderText(/https:\/\/example.com/i),
      'not-a-url'
    );

    await userEvent.click(
      screen.getByRole('button', { name: /create short link/i })
    );

    expect(
      await screen.findByText(/please enter a valid URL/i)
    ).toBeInTheDocument();
  });

  it('does not submit when URL is empty', async () => {
    render(<UrlShortenerForm onCreated={onCreated} />);

    await userEvent.click(
      screen.getByRole('button', { name: /create short link/i })
    );

    expect(
      await screen.findByText(/please enter a valid URL/i)
    ).toBeInTheDocument();
  });
  
  // SUCCESS CASE
  it('creates a short link successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        short_url: 'http://localhost:8080/shortlinks/abc123',
      }),
    });

    render(<UrlShortenerForm onCreated={onCreated} />);

    await userEvent.type(
      screen.getByPlaceholderText(/https:\/\/example.com/i),
      'https://google.com'
    );

    await userEvent.click(
      screen.getByRole('button', { name: /create short link/i })
    );

    expect(
      await screen.findByText(/http:\/\/localhost:8080\/shortlinks\/abc123/i)
    ).toBeInTheDocument();
  });

  //ERROR CASE
  it('shows error message on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<UrlShortenerForm onCreated={onCreated} />);

    await userEvent.type(
      screen.getByPlaceholderText(/https:\/\/example.com/i),
      'https://google.com'
    );

    await userEvent.click(
      screen.getByRole('button', { name: /create short link/i })
    );

    expect(
      await screen.findByText(/failed to create short link/i)
    ).toBeInTheDocument();
  });
});
