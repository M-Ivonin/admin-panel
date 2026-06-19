import { render, screen, within } from '@testing-library/react';
import { ChatDisplay } from '@/components/chat/ChatDisplay';
import type { ChatMessage } from '@/lib/api/chat';

function createMessage(
  overrides: Partial<ChatMessage> & Pick<ChatMessage, 'id'>
): ChatMessage {
  return {
    userId: 'user-1',
    type: 'user',
    messageType: 'user_message',
    content: { text: 'What does this mean?' },
    metadata: null,
    timestamp: '2026-06-19T08:00:00.000Z',
    createdAt: '2026-06-19T08:00:00.000Z',
    ...overrides,
  };
}

describe('Bot chat history source labels', () => {
  it('shows whether a user message came from For You Feed or the regular AI Chat', () => {
    const getMessageContainer = (text: string): HTMLElement => {
      const container = screen
        .getByText(text)
        .closest('[data-testid="chat-message"]');

      expect(container).not.toBeNull();
      return container as HTMLElement;
    };

    render(
      <ChatDisplay
        messages={[
          createMessage({
            id: 1,
            content: { text: 'How does this affect the pick?' },
            metadata: { actionType: 'for_you_ask_sb' },
          }),
          createMessage({
            id: 2,
            content: { text: 'What should I watch next?' },
            metadata: { actionType: 'prediction_chip' },
          }),
          createMessage({
            id: 3,
            content: { text: 'Explain today picks' },
            metadata: null,
          }),
        ]}
        isLoading={false}
        error={null}
        onRefresh={jest.fn()}
      />
    );

    const forYouMessage = getMessageContainer(
      'How does this affect the pick?'
    );
    const aiChatMessage = getMessageContainer('What should I watch next?');
    const manualAiChatMessage = getMessageContainer('Explain today picks');

    expect(within(forYouMessage).getByText('For You Feed')).toBeTruthy();
    expect(within(aiChatMessage).getByText('AI Chat')).toBeTruthy();
    expect(within(manualAiChatMessage).getByText('AI Chat')).toBeTruthy();
  });
});
