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
      <h1 className="mb-6 scroll-m-20 font-[family-name:var(--font-family-satoshi)] font-bold text-neutral-900 text-4xl tracking-tight lg:text-5xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 scroll-m-20 border-b border-neutral-200 pb-3 font-[family-name:var(--font-family-satoshi)] font-semibold text-neutral-900 text-3xl tracking-tight first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-4 scroll-m-20 font-[family-name:var(--font-family-satoshi)] font-semibold text-neutral-900 text-2xl tracking-tight">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-3 scroll-m-20 font-[family-name:var(--font-family-satoshi)] font-semibold text-neutral-900 text-xl tracking-tight">
        {children}
      </h4>
    ),
    // Paragraph
    normal: ({ children }) => (
      <p className="text-base text-neutral-700 leading-relaxed [&:not(:first-child)]:mt-5">
        {children}
      </p>
    ),
    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-4 border-orange-500 bg-orange-50 py-4 px-6 text-base text-neutral-700 italic leading-relaxed">
        {children}
      </blockquote>
    ),
  },

  list: {
    // Bulleted list
    bullet: ({ children }) => (
      <ul className="my-6 ml-6 list-disc text-base text-neutral-700 [&>li]:mt-3">{children}</ul>
    ),
    // Numbered list
    number: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal text-base text-neutral-700 [&>li]:mt-3">{children}</ol>
    ),
  },

  listItem: {
    // Bulleted list item
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    // Numbered list item
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },

  marks: {
    // Strong/bold
    strong: ({ children }) => <strong className="font-semibold text-neutral-900">{children}</strong>,
    // Emphasis/italic
    em: ({ children }) => <em className="italic">{children}</em>,
    // Code
    code: ({ children }) => (
      <code className="relative rounded bg-orange-50 px-[0.4rem] py-[0.2rem] font-mono font-medium text-orange-600 text-sm">
        {children}
      </code>
    ),
    // Underline
    underline: ({ children }) => <u className="underline">{children}</u>,
    // Strike-through
    "strike-through": ({ children }) => <s className="line-through">{children}</s>,
    // External link
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const blank = value?.blank;

      if (href.startsWith("http")) {
        return (
          <a
            className="font-medium text-orange-600 underline underline-offset-4 transition hover:text-orange-700"
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
          className="font-medium text-orange-600 underline underline-offset-4 transition hover:text-orange-700"
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
          className="font-medium text-orange-600 underline underline-offset-4 transition hover:text-orange-700"
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
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-neutral-200">
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
            <div className="rounded-t-lg border border-neutral-200 border-b-0 bg-neutral-100 px-4 py-2 font-mono text-neutral-600 text-sm">
              {filename}
            </div>
          )}
          <pre
            className={`overflow-x-auto border border-neutral-200 p-5 ${
              filename ? "rounded-b-lg" : "rounded-lg"
            } bg-neutral-900`}
          >
            <code className={`font-mono text-neutral-100 text-sm language-${language || "plaintext"}`}>
              {code}
            </code>
          </pre>
        </div>
      );
    },
  },
};

/**
 * Wrapper component for Portable Text rendering
 */
export function SanityPortableText({
  value,
  components,
}: {
  value: any;
  components?: PortableTextComponents;
}) {
  return <PortableText components={components || portableTextComponents} value={value} />;
}
