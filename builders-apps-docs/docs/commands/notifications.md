# Notifications

Send push notifications to users from your mini app.

## Basic Usage

```typescript
await sdk.notify({
  title: 'Transaction Complete',
  body: 'Your transfer was successful!'
});
```

## Parameters

### `title` <Badge type="danger" text="required" />

Notification title (max 50 characters).

```typescript
title: 'Achievement Unlocked!'
```

### `body` <Badge type="danger" text="required" />

Notification message (max 200 characters).

```typescript
body: 'You reached level 10 and earned 100 points!'
```

### `data` <Badge type="tip" text="optional" />

Custom data payload for deep linking and context.

```typescript
data: {
  deepLink: '/apps/my-game/level/10',
  achievementId: 'level_10',
  reward: '100'
}
```

## Examples

### Transaction Confirmation

```typescript
try {
  const result = await sdk.sendTransaction({...});

  await sdk.waitForTransaction(result.hash);

  await sdk.notify({
    title: 'Transaction Confirmed',
    body: `Sent ${amount} MOVE successfully`,
    data: {
      deepLink: '/apps/wallet/transactions',
      txHash: result.hash
    }
  });

  await sdk.haptic({ type: 'notification', style: 'success' });
} catch (error) {
  await sdk.notify({
    title: 'Transaction Failed',
    body: error.message,
    data: {
      deepLink: '/apps/wallet/help'
    }
  });
}
```

### Game Achievement

```typescript
async function unlockAchievement(achievement) {
  await sdk.notify({
    title: `Achievement Unlocked! 🏆`,
    body: achievement.name,
    data: {
      deepLink: `/apps/my-game/achievements/${achievement.id}`,
      achievementId: achievement.id,
      points: achievement.points
    }
  });

  await sdk.haptic({ type: 'notification', style: 'success' });
}
```

### Daily Reward

```typescript
async function sendDailyReward() {
  await sdk.notify({
    title: 'Daily Reward Available! 🎁',
    body: 'Claim your 50 tokens now',
    data: {
      deepLink: '/apps/my-game/rewards',
      rewardType: 'daily',
      amount: '50'
    }
  });
}
```

### Time-Sensitive Alert

```typescript
async function sendEventReminder() {
  await sdk.notify({
    title: 'Event Starting Soon! ⏰',
    body: 'Tournament begins in 5 minutes',
    data: {
      deepLink: '/apps/my-game/tournament',
      eventId: 'tournament_123',
      startsAt: Date.now() + 5 * 60 * 1000
    }
  });
}
```

### Social Interaction

```typescript
async function notifyNewMessage(from, message) {
  await sdk.notify({
    title: `Message from ${from}`,
    body: message.preview,
    data: {
      deepLink: `/apps/chat/conversation/${from}`,
      messageId: message.id,
      senderId: from
    }
  });
}
```

## Deep Linking

When a user taps a notification, they navigate to the `deepLink` URL:

```typescript
// Send notification with deep link
await sdk.notify({
  title: 'Quest Complete!',
  body: 'Claim your reward',
  data: {
    deepLink: '/apps/my-game/quests/claim?id=123'
  }
});

// Handle deep link in your app
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const questId = params.get('id');

  if (questId) {
    showQuestReward(questId);
  }
}, []);
```

## Rate Limits

- **50 notifications per day** per user
- Exceeding limit returns error code `429`
- Resets at midnight UTC

Check remaining quota:

```typescript
const limits = await sdk.getRateLimitStatus();
console.log('Notifications remaining:', limits.notifications.remaining);
```

## Best Practices

::: tip RELEVANT & TIMELY
Send notifications for meaningful events only:

```typescript
// ✅ Good - important events
sdk.notify({ title: 'Transaction Confirmed', ... });
sdk.notify({ title: 'Achievement Unlocked', ... });

// ❌ Bad - trivial events
sdk.notify({ title: 'You opened the app', ... });
sdk.notify({ title: 'Welcome back!', ... }); // Every time
```
:::

::: tip CLEAR & ACTIONABLE
Make notifications clear and actionable:

```typescript
// ✅ Good - clear action
{
  title: 'Daily Reward Ready',
  body: 'Tap to claim 50 tokens',
  data: { deepLink: '/apps/game/rewards' }
}

// ❌ Bad - vague
{
  title: 'Something happened',
  body: 'Check the app'
}
```
:::

::: tip RESPECT USER PREFERENCES
Don't spam. Let users control notification frequency in settings.
:::

::: warning PERMISSIONS
Users must grant notification permissions first. Handle permission denial gracefully.
:::

## Error Handling

```typescript
try {
  await sdk.notify({
    title: 'Transaction Complete',
    body: 'Your transfer was successful'
  });
} catch (error) {
  switch (error.code) {
    case 'PERMISSION_DENIED':
      console.log('User has disabled notifications');
      break;

    case 'RATE_LIMIT_EXCEEDED':
      console.log('Too many notifications sent');
      break;

    default:
      console.error('Notification failed:', error);
  }
}
```

## Notification Patterns

### Progress Updates

```typescript
// Transaction submitted
await sdk.notify({
  title: 'Transaction Submitted',
  body: 'Confirming on blockchain...'
});

// Wait for confirmation
await sdk.waitForTransaction(hash);

// Confirmed
await sdk.notify({
  title: 'Transaction Confirmed!',
  body: 'Transfer completed successfully'
});
```

### Achievement System

```typescript
const achievements = {
  first_transaction: {
    title: 'First Transaction! 🎉',
    body: 'You sent your first MOVE',
    points: 10
  },
  big_spender: {
    title: 'Big Spender! 💰',
    body: 'You sent over 100 MOVE',
    points: 50
  }
};

async function checkAchievements(txAmount) {
  if (txAmount >= 100) {
    await sdk.notify({
      title: achievements.big_spender.title,
      body: achievements.big_spender.body,
      data: {
        deepLink: '/apps/game/achievements',
        achievementId: 'big_spender',
        points: achievements.big_spender.points
      }
    });
  }
}
```

### Scheduled Reminders

```typescript
// Schedule notification for later (using backend)
async function scheduleDailyReward() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0); // 9 AM

  await fetch('/api/schedule-notification', {
    method: 'POST',
    body: JSON.stringify({
      userId: sdk.address,
      scheduledAt: tomorrow.toISOString(),
      notification: {
        title: 'Daily Reward Available! 🎁',
        body: 'Claim your tokens now',
        data: {
          deepLink: '/apps/game/rewards',
          rewardType: 'daily'
        }
      }
    })
  });
}
```

## Testing

Test notifications in development:

```typescript
// Add test button in dev mode
{process.env.NODE_ENV === 'development' && (
  <button onClick={() => sdk.notify({
    title: 'Test Notification',
    body: 'This is a test'
  })}>
    Send Test Notification
  </button>
)}
```

## Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| iOS | ✅ Full | Native push notifications |
| Android | ✅ Full | Native push notifications |

## Related

- [Haptic Feedback](/commands/haptic) - Combine with tactile feedback
- Share *(Coming Soon)* - Share content
