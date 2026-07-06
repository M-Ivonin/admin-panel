import { render, screen } from '@testing-library/react';
import { PublicChatWidgetClient } from '@/components/public/PublicChatWidgetClient';
import type { PublicAppConfig } from '@/modules/config/contracts';
import { isLegalEmbedPathname } from '@/modules/public/legal-embed';

const usePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}));

jest.mock('next/script', () => {
  return function MockScript(props: { src: string; type?: string }) {
    return (
      <div
        data-testid="public-chat-script"
        data-src={props.src}
        data-type={props.type}
      />
    );
  };
});

const publicConfig: PublicAppConfig = {
  appHost: 'sirbro.com',
  defaultLocale: 'en',
  supportedLocales: ['en', 'pt', 'es'],
  apiBaseUrl: 'https://api.tipsterbro.com/v1',
  chatWidgetUrl: 'https://chatbot-widget-alpha-two.vercel.app/sirbro-chat.js',
  chatApiUrl: 'https://api.tipsterbro.com/v1',
  showMarkdown: 'true',
};

describe('PublicChatWidgetClient', () => {
  beforeEach(() => {
    usePathname.mockReset();
  });

  it('renders the public chat widget on normal public pages', () => {
    usePathname.mockReturnValue('/en');

    const { container } = render(
      <PublicChatWidgetClient publicConfig={publicConfig} />
    );

    expect(screen.getByTestId('public-chat-script')).toHaveAttribute(
      'data-src',
      publicConfig.chatWidgetUrl
    );
    expect(container.querySelector('sirbro-chat')).toBeInTheDocument();
  });

  it.each([
    '/en/privacy/embed',
    '/es/terms/embed',
    '/pt/disclaimer/embed',
  ])('does not launch the chat widget for legal embed path %s', (pathname) => {
    usePathname.mockReturnValue(pathname);

    const { container } = render(
      <PublicChatWidgetClient publicConfig={publicConfig} />
    );

    expect(screen.queryByTestId('public-chat-script')).not.toBeInTheDocument();
    expect(container.querySelector('sirbro-chat')).not.toBeInTheDocument();
  });
});

describe('isLegalEmbedPathname', () => {
  it('matches only localized legal embed paths', () => {
    expect(isLegalEmbedPathname('/en/privacy/embed')).toBe(true);
    expect(isLegalEmbedPathname('/es/terms/embed')).toBe(true);
    expect(isLegalEmbedPathname('/pt/disclaimer/embed/')).toBe(true);
    expect(isLegalEmbedPathname('/en/privacy')).toBe(false);
    expect(isLegalEmbedPathname('/en')).toBe(false);
  });
});
