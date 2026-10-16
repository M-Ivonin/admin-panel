const EVENT_LABELS: Record<string, string> = {
  for_you_feed_opened: 'For You feed opened',
  home_banner_clicked: 'Home banner clicked',
  subscription_paywall_opened: 'Subscription paywall opened',
  checkout_started: 'Checkout started',
  subscription_started: 'Subscription started',
  in_app_purchase_completed: 'Checkout completed',
  subscription_renewed: 'Subscription renewed',
  ai_chat_opened: 'AI chat opened',
  chat_in_ai_chat: 'AI chat message sent',
  ai_chat_prediction_voted: 'AI chat prediction voted',
  live_challenge_created: 'Live Match Challenge created',
  live_challenge_invite_accepted: 'Live Match Challenge invite accepted',
  private_chat_created: 'Private chat created',
  private_chat_message_sent: 'Private chat message sent',
  channel_poll_voted: 'Channel poll voted',
  public_channel_message_sent: 'Public channel message sent',
  public_chat_opened: 'Public chat opened',
  match_center_opened: 'Matches screen opened',
  matches_screen_opened: 'Matches screen opened',
  match_details_opened: 'Match details opened',
  league_details_opened: 'League details opened',
  team_hub_opened: 'Team hub opened',
  league_hub_opened: 'League hub opened',
  live_opened: 'Live opened',
  live_screen_opened: 'Live screen opened',
  rewards_wallet_opened: 'Rewards wallet opened',
  prediction_market_order_placed: 'Prediction Market order placed',
  voted_for_prediction: 'AI prediction vote confirmed',
  daily_streak_reminder: 'Daily streak reminder',
  weekly_quest_urgency: 'Weekly quest urgency',
  favorite_match_kickoff: 'Favorite match kickoff',
  weekly_stats_digest: 'Weekly stats digest',
  unread_social_activity: 'Unread social activity',
  live_challenge_starting_soon: 'Live challenge starting soon',
  live_challenge_results: 'Live challenge results available',
  level_up: 'Reached level',
  near_level_up: 'Near level',
};

export function formatAppEventLabel(eventKey: string): string {
  const label = EVENT_LABELS[eventKey];
  if (label) {
    return label;
  }

  return eventKey
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
