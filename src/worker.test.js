import { describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { SELF, fetchMock } from "cloudflare:test";
import {
  validateFields,
  hasCRLF,
  isRateLimited,
  rateLimitMap,
} from "./worker.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function contactRequest(body, { method = "POST", ip = "1.2.3.4" } = {}) {
  return new Request("https://example.com/api/contact", {
    method,
    headers: {
      "Content-Type": "application/json",
      "CF-Connecting-IP": ip,
    },
    ...(method !== "GET" && method !== "HEAD"
      ? { body: JSON.stringify(body) }
      : {}),
  });
}

function validBody(overrides = {}) {
  return {
    name: "Jane Doe",
    email: "jane@example.com",
    message: "Hello, I would like to discuss a project.",
    "cf-turnstile-response": "test-token",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// validateFields
// ---------------------------------------------------------------------------

describe("validateFields", () => {
  it("returns empty array for valid input", () => {
    const errors = validateFields({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "Hello",
    });
    expect(errors).toEqual([]);
  });

  it("reports missing name", () => {
    const errors = validateFields({
      email: "jane@example.com",
      message: "Hello",
    });
    expect(errors).toContain("Name is required.");
  });

  it("reports missing email", () => {
    const errors = validateFields({ name: "Jane", message: "Hello" });
    expect(errors).toContain("Email is required.");
  });

  it("reports missing message", () => {
    const errors = validateFields({
      name: "Jane",
      email: "jane@example.com",
    });
    expect(errors).toContain("Message is required.");
  });

  it("reports name over 200 characters", () => {
    const errors = validateFields({
      name: "a".repeat(201),
      email: "jane@example.com",
      message: "Hello",
    });
    expect(errors).toContain("Name is too long.");
  });

  it("reports email over 254 characters", () => {
    // 255 chars: "a" x 246 + "@test.com" (9 chars) = 255, which exceeds the 254 limit
    const long = "a".repeat(246) + "@test.com";
    const errors = validateFields({
      name: "Jane",
      email: long,
      message: "Hello",
    });
    expect(errors).toContain("Email is too long.");
  });

  it("reports message over 5000 characters", () => {
    const errors = validateFields({
      name: "Jane",
      email: "jane@example.com",
      message: "a".repeat(5001),
    });
    expect(errors).toContain("Message is too long.");
  });

  it("reports whitespace-only name", () => {
    const errors = validateFields({
      name: "   ",
      email: "jane@example.com",
      message: "Hello",
    });
    expect(errors).toContain("Name is required.");
  });

  it("reports whitespace-only email", () => {
    const errors = validateFields({
      name: "Jane",
      email: "   ",
      message: "Hello",
    });
    expect(errors).toContain("Email is required.");
  });

  it("reports whitespace-only message", () => {
    const errors = validateFields({
      name: "Jane",
      email: "jane@example.com",
      message: "   ",
    });
    expect(errors).toContain("Message is required.");
  });

  it("reports invalid email format (missing @)", () => {
    const errors = validateFields({
      name: "Jane",
      email: "janeexample.com",
      message: "Hello",
    });
    expect(errors).toContain("Email format is invalid.");
  });

  it("reports invalid email format (missing domain)", () => {
    const errors = validateFields({
      name: "Jane",
      email: "jane@",
      message: "Hello",
    });
    expect(errors).toContain("Email format is invalid.");
  });

  it("reports invalid email format (spaces)", () => {
    const errors = validateFields({
      name: "Jane",
      email: "jane doe@example.com",
      message: "Hello",
    });
    expect(errors).toContain("Email format is invalid.");
  });

  it("accepts plus-addressed email", () => {
    const errors = validateFields({
      name: "Jane",
      email: "jane+test@example.com",
      message: "Hello",
    });
    expect(errors).toEqual([]);
  });

  it("accepts subdomain email", () => {
    const errors = validateFields({
      name: "Jane",
      email: "jane@mail.example.co.uk",
      message: "Hello",
    });
    expect(errors).toEqual([]);
  });

  it("collects multiple errors at once", () => {
    const errors = validateFields({});
    expect(errors.length).toBe(3);
    expect(errors).toContain("Name is required.");
    expect(errors).toContain("Email is required.");
    expect(errors).toContain("Message is required.");
  });
});

// ---------------------------------------------------------------------------
// hasCRLF
// ---------------------------------------------------------------------------

describe("hasCRLF", () => {
  it("returns false for a plain string", () => {
    expect(hasCRLF("hello world")).toBe(false);
  });

  it("returns true when string contains \\r", () => {
    expect(hasCRLF("hello\rworld")).toBe(true);
  });

  it("returns true when string contains \\n", () => {
    expect(hasCRLF("hello\nworld")).toBe(true);
  });

  it("returns true when string contains \\r\\n", () => {
    expect(hasCRLF("hello\r\nworld")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isRateLimited
// ---------------------------------------------------------------------------

describe("isRateLimited", () => {
  beforeEach(() => {
    rateLimitMap.clear();
  });

  it("allows the first request", () => {
    expect(isRateLimited("10.0.0.1")).toBe(false);
  });

  it("allows up to 5 requests within the window", () => {
    for (let i = 0; i < 4; i++) {
      isRateLimited("10.0.0.2");
    }
    // 5th request should still be allowed
    expect(isRateLimited("10.0.0.2")).toBe(false);
  });

  it("blocks the 6th request within the window", () => {
    for (let i = 0; i < 5; i++) {
      isRateLimited("10.0.0.3");
    }
    expect(isRateLimited("10.0.0.3")).toBe(true);
  });

  it("tracks different IPs independently", () => {
    for (let i = 0; i < 5; i++) {
      isRateLimited("10.0.0.4");
    }
    // 10.0.0.4 is now limited, but 10.0.0.5 should be fine
    expect(isRateLimited("10.0.0.4")).toBe(true);
    expect(isRateLimited("10.0.0.5")).toBe(false);
  });

  it("allows requests after the window expires", () => {
    // Seed timestamps that are already expired (older than 1 hour)
    const expired = Date.now() - 61 * 60 * 1000;
    rateLimitMap.set("10.0.0.6", [expired, expired, expired, expired, expired]);

    // The next call should prune the expired entries and allow the request
    expect(isRateLimited("10.0.0.6")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// handleContactForm (via SELF integration tests)
// ---------------------------------------------------------------------------

describe("handleContactForm", () => {
  beforeAll(() => {
    fetchMock.activate();
    fetchMock.disableNetConnect();
  });

  beforeEach(() => {
    rateLimitMap.clear();
    fetchMock.deactivate();
    fetchMock.activate();
    fetchMock.disableNetConnect();
  });

  afterEach(() => {
    fetchMock.deactivate();
  });

  // -- Method checks -------------------------------------------------------

  it("returns 405 for non-POST request", async () => {
    const res = await SELF.fetch("https://example.com/api/contact", {
      method: "GET",
    });
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error).toBe("Method not allowed.");
  });

  // -- JSON parsing ---------------------------------------------------------

  it("returns 400 for invalid JSON body", async () => {
    const res = await SELF.fetch("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid request.");
  });

  // -- Rate limiting --------------------------------------------------------

  it("returns 429 when rate limited", async () => {
    // Exhaust rate limit for the "unknown" IP (no CF-Connecting-IP header in SELF)
    for (let i = 0; i < 5; i++) {
      rateLimitMap.set("unknown", [
        Date.now(),
        Date.now(),
        Date.now(),
        Date.now(),
        Date.now(),
      ]);
    }

    const res = await SELF.fetch("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody()),
    });
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("Too many requests");
  });

  // -- Honeypot -------------------------------------------------------------

  it("silently accepts when honeypot field is present", async () => {
    const res = await SELF.fetch("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody(), website: "http://spam.example" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  // -- Validation errors ----------------------------------------------------

  it("returns 400 with first validation error", async () => {
    const res = await SELF.fetch("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", email: "", message: "" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Name is required.");
  });

  // -- CRLF injection check ------------------------------------------------

  it("returns 400 when email contains trailing CRLF", async () => {
    // Trailing \n passes regex after trim() but triggers the hasCRLF check
    const res = await SELF.fetch("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody({ email: "jane@example.com\n" })),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid");
  });

  // -- Missing env secrets --------------------------------------------------

  it("returns 503 when env secrets are missing", async () => {
    // SELF uses the env from wrangler.toml, which has no secrets configured.
    // We send a valid request that passes validation and CRLF checks.
    // Since TURNSTILE_SECRET_KEY and RESEND_API_KEY are not set, it returns 503.
    const res = await SELF.fetch("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody()),
    });
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("temporarily unavailable");
  });
});

// ---------------------------------------------------------------------------
// handleContactForm: tests with secrets configured (direct handler calls)
// ---------------------------------------------------------------------------

describe("handleContactForm with secrets", () => {
  // For these tests, we call the default export's fetch handler directly
  // so we can provide a custom env object with secrets.
  let worker;

  beforeAll(async () => {
    worker = (await import("./worker.js")).default;
    fetchMock.activate();
    fetchMock.disableNetConnect();
  });

  beforeEach(() => {
    rateLimitMap.clear();
    fetchMock.deactivate();
    fetchMock.activate();
    fetchMock.disableNetConnect();
  });

  afterEach(() => {
    fetchMock.deactivate();
  });

  function mockEnv(overrides = {}) {
    return {
      TURNSTILE_SECRET_KEY: "test-turnstile-secret",
      RESEND_API_KEY: "re_test_api_key",
      ASSETS: {
        fetch: async () => new Response("static asset", { status: 200 }),
      },
      ...overrides,
    };
  }

  // -- Missing Turnstile token ----------------------------------------------

  it("returns 400 when Turnstile token is missing", async () => {
    const body = validBody();
    delete body["cf-turnstile-response"];
    const req = contactRequest(body);
    const res = await worker.fetch(req, mockEnv());
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("verification challenge");
  });

  // -- Failed Turnstile verification ----------------------------------------

  it("returns 403 when Turnstile verification fails", async () => {
    fetchMock
      .get("https://challenges.cloudflare.com")
      .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
      .reply(200, JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" },
      });

    const req = contactRequest(validBody());
    const res = await worker.fetch(req, mockEnv());
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Verification failed");
  });

  // -- Successful end-to-end flow -------------------------------------------

  it("returns 200 on successful Turnstile + Resend flow", async () => {
    fetchMock
      .get("https://challenges.cloudflare.com")
      .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
      .reply(200, JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });

    fetchMock
      .get("https://api.resend.com")
      .intercept({ path: "/emails", method: "POST" })
      .reply(200, JSON.stringify({ id: "msg_123" }), {
        headers: { "Content-Type": "application/json" },
      });

    const req = contactRequest(validBody());
    const res = await worker.fetch(req, mockEnv());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  // -- Resend returns non-ok status -----------------------------------------

  it("returns 500 when Resend API returns non-ok", async () => {
    fetchMock
      .get("https://challenges.cloudflare.com")
      .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
      .reply(200, JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });

    fetchMock
      .get("https://api.resend.com")
      .intercept({ path: "/emails", method: "POST" })
      .reply(500, JSON.stringify({ error: "internal" }), {
        headers: { "Content-Type": "application/json" },
      });

    const req = contactRequest(validBody());
    const res = await worker.fetch(req, mockEnv());
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("Unable to send message");
  });

  // -- Resend throws --------------------------------------------------------

  it("returns 500 when Resend API call throws", async () => {
    fetchMock
      .get("https://challenges.cloudflare.com")
      .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
      .reply(200, JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });

    fetchMock
      .get("https://api.resend.com")
      .intercept({ path: "/emails", method: "POST" })
      .replyWithError(new Error("network failure"));

    const req = contactRequest(validBody());
    const res = await worker.fetch(req, mockEnv());
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("Unable to send message");
  });
});

// ---------------------------------------------------------------------------
// fetch router
// ---------------------------------------------------------------------------

describe("fetch router", () => {
  let worker;

  beforeAll(async () => {
    worker = (await import("./worker.js")).default;
  });

  beforeEach(() => {
    rateLimitMap.clear();
  });

  it("routes /api/contact to the contact form handler", async () => {
    // A GET to /api/contact should hit handleContactForm and return 405
    const req = new Request("https://example.com/api/contact", {
      method: "GET",
    });
    const env = {
      ASSETS: {
        fetch: async () => new Response("static", { status: 200 }),
      },
    };
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(405);
    const data = await res.json();
    expect(data.error).toBe("Method not allowed.");
  });

  it("delegates non-API paths to env.ASSETS.fetch", async () => {
    const req = new Request("https://example.com/about", { method: "GET" });
    const env = {
      ASSETS: {
        fetch: async () =>
          new Response("<html>About Page</html>", {
            status: 200,
            headers: { "Content-Type": "text/html" },
          }),
      },
    };
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("<html>About Page</html>");
  });

  it("delegates root path to env.ASSETS.fetch", async () => {
    const req = new Request("https://example.com/", { method: "GET" });
    const env = {
      ASSETS: {
        fetch: async () => new Response("<html>Home</html>", { status: 200 }),
      },
    };
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("<html>Home</html>");
  });
});
