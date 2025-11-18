/**
 * Sanitization Security Tests
 *
 * Critical security tests for XSS prevention.
 * These tests ensure all user input is properly sanitized before rendering.
 *
 * @module lib/utils/__tests__/sanitize.test.ts
 */

import { describe, expect, test as it } from "bun:test";
import {
  sanitize,
  sanitizeHTML,
  sanitizeRichContent,
  sanitizeURL,
  sanitizeUserContent,
  stripHTML,
} from "../sanitize";

// ============================================================================
// SANITIZE HTML - GENERAL HTML SANITIZATION
// ============================================================================

describe("sanitizeHTML", () => {
  describe("XSS Prevention", () => {
    it("should remove script tags", () => {
      const malicious = '<script>alert("XSS")</script><p>Safe content</p>';
      const safe = sanitizeHTML(malicious);

      expect(safe).not.toContain("<script>");
      expect(safe).not.toContain("alert");
      expect(safe).toContain("Safe content");
    });

    it("should remove inline event handlers", () => {
      const malicious = "<p onclick=\"alert('XSS')\">Click me</p>";
      const safe = sanitizeHTML(malicious);

      expect(safe).not.toContain("onclick");
      expect(safe).not.toContain("alert");
    });

    it("should remove onerror attributes", () => {
      const malicious = '<img src="invalid" onerror="alert(\'XSS\')" />';
      const safe = sanitizeHTML(malicious);

      expect(safe).not.toContain("onerror");
      expect(safe).not.toContain("alert");
    });

    it("should remove onload attributes", () => {
      const malicious = "<body onload=\"alert('XSS')\">Content</body>";
      const safe = sanitizeHTML(malicious);

      expect(safe).not.toContain("onload");
      expect(safe).not.toContain("alert");
    });

    it("should remove iframe tags", () => {
      const malicious = '<iframe src="http://evil.com"></iframe><p>Safe</p>';
      const safe = sanitizeHTML(malicious);

      expect(safe).not.toContain("<iframe");
      expect(safe).toContain("Safe");
    });

    it("should remove object tags", () => {
      const malicious = '<object data="http://evil.com"></object><p>Safe</p>';
      const safe = sanitizeHTML(malicious);

      expect(safe).not.toContain("<object");
      expect(safe).toContain("Safe");
    });

    it("should remove embed tags", () => {
      const malicious = '<embed src="http://evil.com" /><p>Safe</p>';
      const safe = sanitizeHTML(malicious);

      expect(safe).not.toContain("<embed");
      expect(safe).toContain("Safe");
    });

    it("should remove form tags", () => {
      const malicious = '<form action="http://evil.com"><input type="text"></form>';
      const safe = sanitizeHTML(malicious);

      expect(safe).not.toContain("<form");
      expect(safe).not.toContain("<input");
    });

    it("should handle multiple XSS vectors in one string", () => {
      const malicious = `
        <script>alert('XSS')</script>
        <p onclick="alert('XSS')">Click</p>
        <img src="x" onerror="alert('XSS')" />
        <iframe src="evil.com"></iframe>
        <p>Safe content</p>
      `;
      const safe = sanitizeHTML(malicious);

      expect(safe).not.toContain("<script>");
      expect(safe).not.toContain("onclick");
      expect(safe).not.toContain("onerror");
      expect(safe).not.toContain("<iframe");
      expect(safe).not.toContain("alert");
      expect(safe).toContain("Safe content");
    });
  });

  describe("Safe HTML Preservation", () => {
    it("should preserve safe paragraph tags", () => {
      const input = "<p>This is safe content</p>";
      const output = sanitizeHTML(input);

      expect(output).toBe("<p>This is safe content</p>");
    });

    it("should preserve safe formatting tags", () => {
      const input = "<p><strong>Bold</strong> and <em>italic</em> text</p>";
      const output = sanitizeHTML(input);

      expect(output).toContain("<strong>Bold</strong>");
      expect(output).toContain("<em>italic</em>");
    });

    it("should preserve safe links with href", () => {
      const input = '<a href="https://example.com">Link</a>';
      const output = sanitizeHTML(input);

      expect(output).toContain('href="https://example.com"');
      expect(output).toContain("Link");
    });

    it("should preserve safe images", () => {
      const input = '<img src="https://example.com/image.jpg" alt="Description" />';
      const output = sanitizeHTML(input);

      expect(output).toContain('src="https://example.com/image.jpg"');
      expect(output).toContain('alt="Description"');
    });

    it("should preserve lists", () => {
      const input = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const output = sanitizeHTML(input);

      expect(output).toContain("<ul>");
      expect(output).toContain("<li>Item 1</li>");
      expect(output).toContain("<li>Item 2</li>");
      expect(output).toContain("</ul>");
    });

    it("should preserve headings", () => {
      const input = "<h1>Heading 1</h1><h2>Heading 2</h2>";
      const output = sanitizeHTML(input);

      expect(output).toContain("<h1>Heading 1</h1>");
      expect(output).toContain("<h2>Heading 2</h2>");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string", () => {
      const output = sanitizeHTML("");
      expect(output).toBe("");
    });

    it("should handle plain text without HTML", () => {
      const input = "Just plain text";
      const output = sanitizeHTML(input);

      expect(output).toBe("Just plain text");
    });

    it("should handle malformed HTML", () => {
      const input = "<p>Unclosed paragraph";
      const output = sanitizeHTML(input);

      // DOMPurify auto-closes tags
      expect(output).toContain("Unclosed paragraph");
    });
  });
});

// ============================================================================
// SANITIZE RICH CONTENT - ADMIN-CREATED CONTENT
// ============================================================================

describe("sanitizeRichContent", () => {
  it("should allow video tags for admin content", () => {
    const input = '<video controls><source src="video.mp4" type="video/mp4"></video>';
    const output = sanitizeRichContent(input);

    expect(output).toContain("<video");
    expect(output).toContain("controls");
    expect(output).toContain("<source");
  });

  it("should allow audio tags for admin content", () => {
    const input = '<audio controls><source src="audio.mp3" type="audio/mp3"></audio>';
    const output = sanitizeRichContent(input);

    expect(output).toContain("<audio");
    expect(output).toContain("controls");
  });

  it("should still block script tags in admin content", () => {
    const malicious = '<script>alert("XSS")</script><p>Content</p>';
    const safe = sanitizeRichContent(malicious);

    expect(safe).not.toContain("<script>");
    expect(safe).not.toContain("alert");
  });

  it("should still block event handlers in admin content", () => {
    const malicious = "<p onclick=\"alert('XSS')\">Click</p>";
    const safe = sanitizeRichContent(malicious);

    expect(safe).not.toContain("onclick");
    expect(safe).not.toContain("alert");
  });

  it("should still block iframes in admin content", () => {
    const malicious = '<iframe src="http://evil.com"></iframe>';
    const safe = sanitizeRichContent(malicious);

    expect(safe).not.toContain("<iframe");
  });
});

// ============================================================================
// SANITIZE USER CONTENT - MOST RESTRICTIVE
// ============================================================================

describe("sanitizeUserContent", () => {
  it("should strip images from user content", () => {
    const input = '<img src="image.jpg" /><p>Text</p>';
    const output = sanitizeUserContent(input);

    expect(output).not.toContain("<img");
    expect(output).toContain("Text");
  });

  it("should strip video from user content", () => {
    const input = "<video controls></video><p>Text</p>";
    const output = sanitizeUserContent(input);

    expect(output).not.toContain("<video");
    expect(output).toContain("Text");
  });

  it("should allow basic formatting in user content", () => {
    const input = "<p><strong>Bold</strong> and <em>italic</em></p>";
    const output = sanitizeUserContent(input);

    expect(output).toContain("<strong>Bold</strong>");
    expect(output).toContain("<em>italic</em>");
  });

  it("should allow safe links in user content", () => {
    const input = '<a href="https://example.com">Link</a>';
    const output = sanitizeUserContent(input);

    expect(output).toContain("Link");
    expect(output).toContain('href="https://example.com"');
  });

  it("should block all XSS attempts in user content", () => {
    const malicious = `
      <script>alert('XSS')</script>
      <p onclick="alert('XSS')">Click</p>
      <img src="x" onerror="alert('XSS')" />
      <p>Safe</p>
    `;
    const safe = sanitizeUserContent(malicious);

    expect(safe).not.toContain("<script>");
    expect(safe).not.toContain("onclick");
    expect(safe).not.toContain("<img");
    expect(safe).not.toContain("alert");
    expect(safe).toContain("Safe");
  });
});

// ============================================================================
// STRIP HTML - REMOVE ALL TAGS
// ============================================================================

describe("stripHTML", () => {
  it("should remove all HTML tags", () => {
    const input = "<p><strong>Bold</strong> and <em>italic</em></p>";
    const output = stripHTML(input);

    expect(output).toBe("Bold and italic");
    expect(output).not.toContain("<");
    expect(output).not.toContain(">");
  });

  it("should preserve text content", () => {
    const input = "<h1>Heading</h1><p>Paragraph</p>";
    const output = stripHTML(input);

    expect(output).toContain("Heading");
    expect(output).toContain("Paragraph");
    expect(output).not.toContain("<h1>");
    expect(output).not.toContain("<p>");
  });

  it("should handle empty string", () => {
    const output = stripHTML("");
    expect(output).toBe("");
  });

  it("should handle plain text", () => {
    const input = "Just plain text";
    const output = stripHTML(input);

    expect(output).toBe("Just plain text");
  });
});

// ============================================================================
// SANITIZE URL - DANGEROUS PROTOCOL PREVENTION
// ============================================================================

describe("sanitizeURL", () => {
  describe("Dangerous Protocol Blocking", () => {
    it("should block javascript: protocol", () => {
      const malicious = "javascript:alert('XSS')";
      const safe = sanitizeURL(malicious);

      expect(safe).toBe("");
    });

    it("should block data: protocol", () => {
      const malicious = "data:text/html,<script>alert('XSS')</script>";
      const safe = sanitizeURL(malicious);

      expect(safe).toBe("");
    });

    it("should block vbscript: protocol", () => {
      const malicious = "vbscript:msgbox('XSS')";
      const safe = sanitizeURL(malicious);

      expect(safe).toBe("");
    });

    it("should block file: protocol", () => {
      const malicious = "file:///etc/passwd";
      const safe = sanitizeURL(malicious);

      expect(safe).toBe("");
    });

    it("should be case-insensitive for protocol detection", () => {
      const malicious = "JaVaScRiPt:alert('XSS')";
      const safe = sanitizeURL(malicious);

      expect(safe).toBe("");
    });
  });

  describe("Safe URL Preservation", () => {
    it("should allow https URLs", () => {
      const input = "https://example.com";
      const output = sanitizeURL(input);

      expect(output).toBe("https://example.com");
    });

    it("should allow http URLs", () => {
      const input = "http://example.com";
      const output = sanitizeURL(input);

      expect(output).toBe("http://example.com");
    });

    it("should allow mailto URLs", () => {
      const input = "mailto:test@example.com";
      const output = sanitizeURL(input);

      expect(output).toBe("mailto:test@example.com");
    });

    it("should allow tel URLs", () => {
      const input = "tel:+573001234567";
      const output = sanitizeURL(input);

      expect(output).toBe("tel:+573001234567");
    });

    it("should allow relative URLs", () => {
      const input = "/about/team";
      const output = sanitizeURL(input);

      expect(output).toBe("/about/team");
    });

    it("should add https to URLs without protocol", () => {
      const input = "example.com";
      const output = sanitizeURL(input);

      expect(output).toBe("https://example.com");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string", () => {
      const output = sanitizeURL("");
      expect(output).toBe("");
    });

    it("should trim whitespace", () => {
      const input = "  https://example.com  ";
      const output = sanitizeURL(input);

      expect(output).toBe("https://example.com");
    });
  });
});

// ============================================================================
// SANITIZE - TYPE-SAFE WRAPPER
// ============================================================================

describe("sanitize", () => {
  it("should use DEFAULT preset by default", () => {
    const input = "<p>Test</p>";
    const output = sanitize(input);

    expect(output).toBe("<p>Test</p>");
  });

  it("should use RICH_CONTENT preset", () => {
    const input = "<video controls></video>";
    const output = sanitize(input, "RICH_CONTENT");

    expect(output).toContain("<video");
  });

  it("should use USER_CONTENT preset", () => {
    const input = '<img src="test.jpg" /><p>Text</p>';
    const output = sanitize(input, "USER_CONTENT");

    expect(output).not.toContain("<img");
    expect(output).toContain("Text");
  });

  it("should use PLAIN_TEXT preset", () => {
    const input = "<p><strong>Bold</strong></p>";
    const output = sanitize(input, "PLAIN_TEXT");

    expect(output).toBe("Bold");
    expect(output).not.toContain("<");
  });
});

// ============================================================================
// COMPREHENSIVE XSS ATTACK VECTOR TESTS
// ============================================================================

describe("XSS Attack Vectors", () => {
  const xssVectors = [
    // Script injections
    '<script>alert("XSS")</script>',
    "<script>alert(String.fromCharCode(88,83,83))</script>",
    '<script src="http://evil.com/xss.js"></script>',

    // Event handlers
    '<img src="x" onerror="alert(\'XSS\')" />',
    "<body onload=\"alert('XSS')\">",
    '<input type="text" onfocus="alert(\'XSS\')" />',
    "<p onmouseover=\"alert('XSS')\">Hover</p>",

    // SVG attacks
    "<svg onload=\"alert('XSS')\"></svg>",

    // Object/Embed attacks
    "<object data=\"javascript:alert('XSS')\"></object>",
    "<embed src=\"javascript:alert('XSS')\" />",
  ];

  xssVectors.forEach((vector, index) => {
    it(`should block XSS vector ${index + 1}: ${vector.substring(0, 50)}...`, () => {
      const safe = sanitizeHTML(vector);

      // Check that dangerous tags and attributes are removed
      expect(safe).not.toContain("<script");
      expect(safe).not.toContain("onerror");
      expect(safe).not.toContain("onload");
      expect(safe).not.toContain("onfocus");
      expect(safe).not.toContain("onmouseover");
      expect(safe).not.toContain("javascript:");
    });
  });

  // Special case: Encoded attacks (already escaped HTML)
  it("should safely handle HTML-encoded script tags", () => {
    const encoded = "&#60;script&#62;alert('XSS')&#60;/script&#62;";
    const safe = sanitizeHTML(encoded);

    // DOMPurify may escape it further or leave as-is since it's already safe
    // The key is that it's not executable as a script tag
    expect(safe).not.toContain("<script");
    expect(safe).not.toContain("</script>");
  });

  // Special case: Data URIs
  it("should safely handle data URIs in img src", () => {
    const dataUri = "<img src=\"data:text/html,<script>alert('XSS')</script>\" />";
    const safe = sanitizeHTML(dataUri);

    // DOMPurify allows img tags with data: URIs
    // Modern browsers don't execute JavaScript in data: URIs in img src
    // This is safe because browsers block JS execution in this context
    expect(safe).toContain("<img");

    // The important thing is that the img tag structure is preserved
    // and there's no script tag in the actual HTML structure (outside attributes)
    // Script tags inside quoted attributes are just text, not executable
    const hasStandaloneScriptTag = /<script\b[^>]*>/.test(
      safe.replace(/src="[^"]*"/g, "") // Remove src attribute to check structure
    );
    expect(hasStandaloneScriptTag).toBe(false);
  });
});
