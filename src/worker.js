// Contact form API handler for Perts Foundry.
// Routes /api/contact through validation, Turnstile, and Resend.
// All other requests fall through to static assets.

// Best-effort rate limiting. This in-memory Map resets when the Worker
// isolate is evicted and is not shared across Cloudflare edge locations.
// Turnstile is the primary bot defense; this catches casual abuse within
// a single isolate session. For durable rate limiting, use Cloudflare WAF
// rate limiting rules configured in Terraform.
const CONTACT_EMAIL = "contact@pertsfoundry.com";
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rateLimitMap = new Map();

function pruneRateLimits() {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, valid);
    }
  }
}

function isRateLimited(ip) {
  pruneRateLimits();
  const timestamps = rateLimitMap.get(ip) || [];
  if (timestamps.length >= RATE_LIMIT_MAX) {
    return true;
  }
  timestamps.push(Date.now());
  rateLimitMap.set(ip, timestamps);
  return false;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
    },
  });
}

function validateFields(data) {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required.");
  } else if (data.name.length > 200) {
    errors.push("Name is too long.");
  }
  if (!data.email || data.email.trim().length === 0) {
    errors.push("Email is required.");
  } else if (data.email.length > 254) {
    errors.push("Email is too long.");
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.push("Email format is invalid.");
  }
  if (!data.message || data.message.trim().length === 0) {
    errors.push("Message is required.");
  } else if (data.message.length > 5000) {
    errors.push("Message is too long.");
  }
  return errors;
}

function hasCRLF(value) {
  return /[\r\n]/.test(value);
}

async function verifyTurnstile(token, secretKey, ip) {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
      signal: AbortSignal.timeout(5000),
    },
  );
  const result = await response.json();
  return result.success === true;
}

async function sendEmail(apiKey, { name, email, message }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Perts Foundry Website <noreply@mail.pertsfoundry.com>",
      to: CONTACT_EMAIL,
      reply_to: email.trim(),
      subject: `Contact Form: ${name.trim()}`,
      text: [
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        "",
        "Message:",
        message.trim(),
      ].join("\n"),
    }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    console.error("Resend API error:", response.status);
  }
  return response.ok;
}

async function handleContactForm(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (isRateLimited(ip)) {
    return jsonResponse(
      { error: "Too many requests. Please try again later." },
      429,
    );
  }

  let bodyText;
  try {
    bodyText = await request.text();
  } catch {
    return jsonResponse({ error: "Invalid request." }, 400);
  }
  if (bodyText.length > 4000) {
    return jsonResponse({ error: "Request too large." }, 413);
  }

  let data;
  try {
    data = JSON.parse(bodyText);
  } catch {
    return jsonResponse({ error: "Invalid request." }, 400);
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return jsonResponse({ error: "Invalid request." }, 400);
  }

  // Honeypot check
  if (data.website) {
    return jsonResponse({ success: true });
  }

  // Check that secrets are configured
  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY) {
    return jsonResponse(
      {
        error: `Contact form is temporarily unavailable. Please email ${CONTACT_EMAIL} directly.`,
      },
      503,
    );
  }

  // Verify Turnstile before field validation
  const turnstileToken = data["cf-turnstile-response"];
  if (!turnstileToken) {
    return jsonResponse(
      { error: "Please complete the verification challenge." },
      400,
    );
  }
  let turnstileValid;
  try {
    turnstileValid = await verifyTurnstile(
      turnstileToken,
      env.TURNSTILE_SECRET_KEY,
      ip,
    );
  } catch {
    return jsonResponse(
      {
        error: `Unable to verify your request. Please try again or email ${CONTACT_EMAIL} directly.`,
      },
      500,
    );
  }
  if (!turnstileValid) {
    return jsonResponse(
      { error: "Verification failed. Please try again." },
      403,
    );
  }

  const errors = validateFields(data);
  if (errors.length > 0) {
    return jsonResponse({ error: errors[0] }, 400);
  }

  if (hasCRLF(data.email) || hasCRLF(data.name)) {
    return jsonResponse({ error: "Invalid characters in input." }, 400);
  }

  // Send the email with only validated, trimmed fields
  const sanitized = {
    name: data.name.trim(),
    email: data.email.trim(),
    message: data.message.trim(),
  };
  try {
    const sent = await sendEmail(env.RESEND_API_KEY, sanitized);
    if (!sent) {
      return jsonResponse(
        {
          error: `Unable to send message. Please try again or email ${CONTACT_EMAIL} directly.`,
        },
        500,
      );
    }
  } catch {
    return jsonResponse(
      {
        error: `Unable to send message. Please try again or email ${CONTACT_EMAIL} directly.`,
      },
      500,
    );
  }

  return jsonResponse({ success: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContactForm(request, env);
    }

    // All other requests: serve static assets
    return env.ASSETS.fetch(request);
  },
};

export { validateFields, hasCRLF, isRateLimited, rateLimitMap };
