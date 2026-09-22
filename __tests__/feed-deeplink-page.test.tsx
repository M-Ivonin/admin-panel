import { render, screen } from '@testing-library/react';
import FeedDeepLinkPage from '@/app/(deeplink)/feed/[tileId]/page';

jest.mock('@/components/BrowserLanguageWrapper', () => ({
  BrowserLanguageWrapper: ({ appPath }: { appPath: string }) => (
    <a href={`sirbro://${appPath.slice(1)}`}>Open article</a>
  ),
}));

it.each([
  'news%3A0c0e6593-dd75-4e0a-8d27-63365b699d77',
  'news:0c0e6593-dd75-4e0a-8d27-63365b699d77',
])('preserves the shared article ID when the route supplies %s', async (tileId) => {
  render(await FeedDeepLinkPage({ params: Promise.resolve({ tileId }) }));
  expect(screen.getByRole('link', { name: 'Open article' })).toHaveAttribute(
    'href', 'sirbro://feed/news%3A0c0e6593-dd75-4e0a-8d27-63365b699d77'
  );
});
