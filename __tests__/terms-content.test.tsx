import { render, screen } from '@testing-library/react';
import { getTermsLastUpdated, TermsContent } from '@/components/legal/TermsContent';
import TermsEmbedPage from '@/app/(public)/[lang]/(legal)/terms/embed/page';

describe('SirBro Terms of Service', () => {
  it('publishes the approved English service, marketing, and affiliate contract', () => {
    render(<TermsContent locale="en" />);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(20);
    expect(
      screen.getByText(
        'Acceptance of these Terms does not constitute consent to receive optional marketing or betting-partner offers.',
        { exact: false }
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('SirBro is not a bookmaker, gambling operator, betting exchange, or payment provider.', {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('SirBro may receive a fixed fee or commission when you follow an affiliate link', {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(getTermsLastUpdated('en')).toBe('Version 2.0 · Effective 26 August 2026');
  });

  it.each([
    ['es', 'La aceptación de estos Términos no constituye consentimiento para recibir marketing opcional ni ofertas de socios de apuestas.'],
    ['pt', 'A aceitação destes Termos não constitui consentimento para marketing opcional ou ofertas de parceiros de apostas.'],
  ] as const)('keeps the approved %s localized Terms legally aligned', (locale, consentCopy) => {
    const { unmount } = render(<TermsContent locale={locale} />);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(20);
    expect(screen.getByText(consentCopy, { exact: false })).toBeInTheDocument();
    expect(getTermsLastUpdated(locale)).toContain('26');

    unmount();
  });

  it('shows the approved version and effective date in the mobile embed route', async () => {
    render(await TermsEmbedPage({ params: Promise.resolve({ lang: 'en' }) }));

    expect(screen.getByText('Version 2.0 · Effective 26 August 2026')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(20);
  });
});
