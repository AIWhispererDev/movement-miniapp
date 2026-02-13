# Mini App Review Guide for Admins

This guide explains the hybrid automated + manual review process for mini app submissions.

## Overview

The review process combines:
1. **Automated checks** - Quick technical validation (URL, SSL, icon, performance)
2. **Manual review** - Human judgment for functionality, UX, content, and security

## How It Works

### Step 1: Automated Checks

When viewing a pending app, click **"Run Checks"** in the Automated Review panel. The system will:

| Check | What It Does |
|-------|--------------|
| URL Accessible | Verifies the app URL returns HTTP 200 |
| SSL Certificate | Confirms valid HTTPS |
| Icon Loads | Verifies the icon URL loads as an image |
| Page Loads | Checks the page returns valid HTML |
| Response Time | Measures how fast the app responds |
| Permissions Reasonable | Flags unusual permission combinations |

### Step 2: Interpret the Results

**Score (0-100)**: Weighted average of all automated checks. Higher is better.

**Flags**:

- **Critical** (red): Blocking issues like URL not accessible
- **Warning** (yellow): Concerns that need manual verification
- **Info** (blue): FYI items, not blocking

### Step 3: Manual Review Checklist

The review panel includes an **interactive checklist** that adapts based on the app's category and permissions. Expand the "Manual Review Checklist" section to see and check off items.

**How it works:**
- Checklist items are generated based on the app's category (Games, Earn, Collect, etc.) and requested permissions
- Required items are marked with a red asterisk (*)
- Check off items as you verify them
- A progress indicator shows how many required items are complete
- You'll see "All required checks completed - ready to approve" when done

**Example checklist items:**

| Condition | Checklist Items Added |
|-----------|----------------------|
| All apps | App loads, functionality works, matches description |
| Requests `sign_transaction` | Transaction requests legitimate, amounts reasonable |
| Earn/Swap category | No rug indicators, clear signing UI |
| Games category | Game playable, no hidden fees |
| Collect category | Collection/marketplace is legitimate |
| Camera/location permission | Sensitive permissions justified |

The checklist state is per-session (resets when you close the modal), so use it as a guide while reviewing.

## Common Rejection Reasons

Use these when rejecting apps:

```
URL not accessible - The app URL returned an error. Please ensure your app is deployed and accessible.
```

```
SSL certificate invalid - Your app must use valid HTTPS. Please fix your SSL configuration.
```

```
App does not load - The app shows a blank page or error. Please fix before resubmitting.
```

```
Excessive permissions - Your app requests permissions it doesn't appear to need. Please reduce to minimum required.
```

```
Misleading description - The app functionality doesn't match what's described. Please update your description.
```

```
Security concern - We identified potential security issues with your app. Please contact us for details.
```

## Review Time Targets

Target: Review all submissions within 1-2 business days.

## When to Escalate

Contact the team lead if:
- App requests unusual contract interactions
- You're unsure about a protocol's legitimacy
- Developer disputes a rejection
- You suspect a coordinated attack (multiple similar submissions)

## Automated Check Limitations

The automated system **cannot** detect:
- Delayed malicious behavior (app works fine initially, then changes)
- Sophisticated scams with legitimate-looking UIs
- Backend security issues
- Actual functionality quality
- Misleading but technically accurate descriptions

**Always use human judgment for the final decision.**

## FAQ

**Q: Can I approve an app that failed automated checks?**
A: Yes, if you manually verify the failures are false positives. Document why in the approval notes.

**Q: What if automated checks time out?**
A: The app's server may be slow. Try again, or manually verify the URL works.

**Q: Should I reject apps with warnings?**
A: Not automatically. Warnings mean "look closer", not "reject". Make a judgment call.

**Q: How do I handle resubmissions?**
A: Check if they fixed the issues from the previous rejection. Run automated checks again.
