import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { getBlurDataUrl, urlFor } from "./image";

/**
 * Portable Text components for rendering rich text content from Sanity
 * Customizes how different block types are rendered
 */

export const portableTextComponents: PortableTextComponents = {
  block: {
    // Headings
    h1: ({ children }) => (
      <h1 className="mb-6 scroll-m-20 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 tracking-tight lg:text-5xl dark:text-neutral-50">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 scroll-m-20 border-neutral-200 border-b pb-3 font-[family-name:var(--font-geist-sans)] font-semibold text-3xl text-neutral-900 tracking-tight first:mt-0 dark:border-neutral-700 dark:text-rausch-400">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-4 scroll-m-20 font-[family-name:var(--font-geist-sans)] font-semibold text-2xl text-neutral-900 tracking-tight dark:text-neutral-100">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-3 scroll-m-20 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900 text-xl tracking-tight dark:text-neutral-200">
        {children}
      </h4>
    ),
    // Paragraph
    normal: ({ children }) => (
      <p className="text-base text-neutral-700 leading-relaxed dark:text-neutral-300 [&:not(:first-child)]:mt-5">
        {children}
      </p>
    ),
    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="my-8 rounded-lg border-rausch-500 border-l-4 bg-rausch-50 px-6 py-4 text-base text-neutral-700 italic leading-relaxed dark:border-rausch-400 dark:bg-rausch-950/30 dark:text-neutral-200">
        {children}
      </blockquote>
    ),
  },

  list: {
    // Bulleted list
    bullet: ({ children }) => (
      <ul className="my-6 ml-6 list-disc text-base text-neutral-700 dark:text-neutral-300 [&>li]:mt-3">
        {children}
      </ul>
    ),
    // Numbered list
    number: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal text-base text-neutral-700 dark:text-neutral-300 [&>li]:mt-3">
        {children}
      </ol>
    ),
    // Checkbox list
    checkbox: ({ children }) => (
      <ul className="my-6 ml-6 list-none text-base text-neutral-700 dark:text-neutral-300 [&>li]:mt-3">
        {children}
      </ul>
    ),
  },

  listItem: {
    // Bulleted list item
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    // Numbered list item
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
    // Checkbox list item
    checkbox: ({ children }) => (
      <li className="flex items-start gap-3 leading-relaxed">
        <input
          aria-label="Checkbox"
          className="mt-1 size-4 rounded border-neutral-300"
          disabled
          type="checkbox"
        />
        <span>{children}</span>
      </li>
    ),
  },

  marks: {
    // Strong/bold
    strong: ({ children }) => (
      <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{children}</strong>
    ),
    // Emphasis/italic
    em: ({ children }) => <em className="italic">{children}</em>,
    // Code
    code: ({ children }) => (
      <code className="relative rounded-lg bg-rausch-50 px-[0.4rem] py-[0.2rem] font-medium font-mono text-rausch-600 text-sm dark:bg-rausch-950/40 dark:text-rausch-300">
        {children}
      </code>
    ),
    // Underline
    underline: ({ children }) => <u className="underline">{children}</u>,
    // Strike-through
    "strike-through": ({ children }) => <s className="line-through">{children}</s>,
    // Highlight
    highlight: ({ children }) => (
      <mark className="rounded bg-rausch-100 px-1 text-neutral-900 dark:bg-rausch-900/40 dark:text-rausch-200">
        {children}
      </mark>
    ),
    // External link
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const blank = value?.blank;

      if (href.startsWith("http")) {
        return (
          <a
            className="font-medium text-rausch-600 underline underline-offset-4 transition hover:text-rausch-700 dark:text-rausch-400 dark:hover:text-rausch-300"
            href={href}
            rel={blank ? "noopener noreferrer" : undefined}
            target={blank ? "_blank" : undefined}
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          className="font-medium text-rausch-600 underline underline-offset-4 transition hover:text-rausch-700 dark:text-rausch-400 dark:hover:text-rausch-300"
          href={href}
        >
          {children}
        </Link>
      );
    },
    // Internal link (reference to another document)
    internalLink: ({ children, value }) => {
      const reference = value?.reference;

      // Build URL based on document type
      let href = "#";
      if (reference?._type === "helpArticle") {
        href = `/help/${reference.category?.slug?.current}/${reference.slug?.current}`;
      } else if (reference?._type === "changelog") {
        href = `/changelog/${reference.slug?.current}`;
      } else if (reference?._type === "roadmapItem") {
        href = `/roadmap#${reference.slug?.current}`;
      } else if (reference?._type === "page") {
        href = `/${reference.slug?.current}`;
      } else if (reference?._type === "blogPost") {
        href = `/blog/${reference.slug?.current}`;
      }

      return (
        <Link
          className="font-medium text-rausch-600 underline underline-offset-4 transition hover:text-rausch-700 dark:text-rausch-400 dark:hover:text-rausch-300"
          href={href}
        >
          {children}
        </Link>
      );
    },
  },

  types: {
    // Image block
    image: ({ value }) => {
      if (!value?.asset) {
        return null;
      }

      const imageUrl = urlFor(value).width(1200).url();
      const blurDataUrl = getBlurDataUrl(value);
      const alt = value?.alt || value?.caption || "Content image";

      return (
        <figure className="my-10">
          <div className="relative aspect-video overflow-hidden border border-neutral-200">
            <Image
              alt={alt}
              blurDataURL={blurDataUrl}
              className="object-cover"
              fill
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              src={imageUrl}
            />
          </div>
          {value?.caption && (
            <figcaption className="mt-3 text-center text-neutral-600 text-sm italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },

    // Code block
    code: ({ value }) => {
      const { code, language, filename } = value || {};

      return (
        <div className="my-8">
          {filename && (
            <div className="border border-neutral-200 border-b-0 bg-neutral-100 px-4 py-2 font-mono text-neutral-600 text-sm">
              {filename}
            </div>
          )}
          <pre
            className={`overflow-x-auto border border-neutral-200 p-5 ${
              filename ? "" : ""
            } bg-neutral-900`}
          >
            <code
              className={`font-mono text-neutral-100 text-sm language-${language || "plaintext"}`}
            >
              {code}
            </code>
          </pre>
        </div>
      );
    },

    // Callout/Alert block
    callout: ({ value }) => {
      const { type = "info", title, content } = value || {};

      const styles =
        {
          info: {
            container: "border-babu-200 bg-babu-50",
            icon: "ℹ️",
            title: "text-babu-900",
            text: "text-babu-800",
          },
          success: {
            container: "border-green-200 bg-green-50",
            icon: "✅",
            title: "text-green-900",
            text: "text-green-800",
          },
          warning: {
            container: "border-rausch-200 bg-rausch-50",
            icon: "⚠️",
            title: "text-rausch-900",
            text: "text-rausch-800",
          },
          error: {
            container: "border-red-200 bg-red-50",
            icon: "❌",
            title: "text-red-900",
            text: "text-red-800",
          },
          tip: {
            container: "border-purple-200 bg-purple-50",
            icon: "💡",
            title: "text-purple-900",
            text: "text-purple-800",
          },
        }[type] || styles.info;

      return (
        <div className={`my-6 border border-l-4 ${styles.container} p-6`}>
          <div className="flex items-start gap-3">
            <span className="text-xl" role="img">
              {styles.icon}
            </span>
            <div className="flex-1">
              {title && (
                <div className={`mb-2 font-semibold text-base ${styles.title}`}>{title}</div>
              )}
              <div className={`text-sm ${styles.text}`}>
                <PortableText components={portableTextComponents} value={content} />
              </div>
            </div>
          </div>
        </div>
      );
    },

    // Divider/separator
    divider: ({ value }) => {
      const { style = "solid" } = value || {};

      const dividerStyles = {
        solid: "border-t-2 border-neutral-200",
        dashed: "border-t-2 border-dashed border-neutral-200",
        dotted: "border-t-2 border-dotted border-neutral-200",
        stars: "",
      }[style];

      if (style === "stars") {
        return <div className="my-10 text-center text-2xl text-neutral-300">* * * * *</div>;
      }

      return <hr className={`my-10 ${dividerStyles}`} />;
    },
  },
};

/**
 * Wrapper component for Portable Text rendering
 */
function SanityPortableText({
  value,
  components,
}: {
  value: any;
  components?: PortableTextComponents;
}) {
  return <PortableText components={components || portableTextComponents} value={value} />;
}
