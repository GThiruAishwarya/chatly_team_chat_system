# Testing Guide for Typing Indicator & Push Notifications

## 🧪 How to Test the Fixed Features

### 1. **Typing Indicator Testing**

#### For Personal Chats:
1. **Open two browser windows/tabs** (or use incognito mode)
2. **Login with different accounts** in each window
3. **Start a conversation** between the two accounts
4. **Type in the message input** of Account A
5. **Check Account B** - you should see "Aryan is typing..." in the header
6. **Stop typing** - the indicator should disappear after 1 second

#### For Group Chats:
1. **Create a group** with multiple members
2. **Have different users join** the group
3. **Type in the group chat** from one account
4. **Other members should see** "Someone is typing..." or "X people are typing..."

### 2. **Push Notifications Testing**

#### Setup:
1. **Grant notification permission** when prompted
2. **Open two browser windows** with different accounts
3. **Minimize one window** or switch to another tab

#### Test Personal Messages:
1. **Send a message** from Account A to Account B
2. **Account B should receive** a browser notification (if window is minimized)
3. **Notification should show** the actual message content

#### Test Group Messages:
1. **Send a message** in a group from Account A
2. **Other group members should receive** notifications
3. **Notification should show** "New group message" with content

### 3. **Troubleshooting**

#### If typing indicator doesn't work:
- ✅ Check browser console for socket connection errors
- ✅ Verify both users are online (green dot in sidebar)
- ✅ Make sure you're in the correct conversation
- ✅ Try refreshing both browser windows

#### If push notifications don't work:
- ✅ Check notification permission in browser settings
- ✅ Make sure the receiving window is minimized/hidden
- ✅ Check browser console for errors
- ✅ Try refreshing the page and granting permission again

### 4. **Expected Behavior**

#### Typing Indicator:
- ✅ Shows immediately when someone starts typing
- ✅ Disappears after 1 second of inactivity
- ✅ Works for both personal and group chats
- ✅ Shows correct user names in personal chats
- ✅ Shows "Someone is typing..." in group chats

#### Push Notifications:
- ✅ Only shows when window is minimized/hidden
- ✅ Shows actual message content
- ✅ Different notifications for personal vs group messages
- ✅ Includes app icon in notifications

## 🚀 Quick Test Commands

```bash
# Start backend server
cd backend && npm start

# Start frontend server (in another terminal)
cd frontend && npm run dev
```

Then open `http://localhost:5173` in two different browser windows and test!


