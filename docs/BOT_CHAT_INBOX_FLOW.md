# Bot Chat Inbox Flow

## What changed

The admin bot chat screen at `/dashboard/bot-chat` now behaves like an inbox:

- the left column loads users who already have bot chat history;
- the first conversation is auto-selected when the page opens without `?userId=...`;
- searching filters only users with existing bot conversations by app name, Telegram name, Telegram username, or email;
- the inbox can be sorted by latest activity, oldest activity, or user name;
- the right pane still shows the existing per-user chat history view.

## Why

The previous screen depended on a manually selected `userId` before it rendered any history.
That made direct visits to `/dashboard/bot-chat` look empty even when bot conversations existed.

## Data flow

1. `UserSelect` requests `GET /chat/users`.
2. The backend returns paginated users with chat history, using the selected search and sort query params.
3. The selected user ID is passed to `useChat`.
4. `useChat` requests `GET /chat/history/:userId` for the right-side transcript.

## Notes

- The inbox list only shows users with existing bot chat history.
- Search is backed by server-side filtering, so it still works across large chat datasets.
- Deep links from `/dashboard/users` with `?userId=...` still work.
- If no conversations exist yet, the left pane shows an explicit empty state.
