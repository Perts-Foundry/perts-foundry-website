# Browser testing

Mechanics that bind only while driving the chrome-devtools MCP against Google Search Console for
this property, referenced by the `search-console` skill's Login STOP.

**Google sign-in is refused in the MCP browser.** Google's sign-in rejects the automation-flagged
Chrome the MCP launches, looping on the sign-in or account-chooser page. This is the operator's hand
step, never the skill's:

1. Stop the MCP browser (close the automation-flagged Chrome window it launched).
2. Relaunch the same Chrome binary, with the same profile directory, but with no automation flags.
3. Sign in to Google in that window.
4. Wait about 30 seconds after sign-in completes. This is a safety margin against Chrome's delayed
   cookie writes, not a measured value.
5. Quit Chrome from its own menu (Exit), not by killing the process or closing the window some
   other way. Killing the process instead of exiting from the menu has been observed to lose the
   new sign-in, leaving the profile signed out again.

The MCP cannot attach to the profile while that manually launched window is still open, so it must
be fully closed (step 5) before the next MCP call. The next MCP call relaunches the automation
profile and the session cookies carry over until the profile's login expires.

The skill stops at any sign-in or account-chooser page (the Login STOP); it never types a
credential, picks an account, or scripts this relaunch. Signing in is always a manual action the
operator performs outside the MCP's control.
