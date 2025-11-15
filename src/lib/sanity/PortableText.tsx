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
      <h1 className="mb-6 scroll-m-20 font-bold text-4xl tracking-tight lg:text-5xl">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 mb-4 scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 mb-4 scroll-m-20 font-semibold text-2xl tracking-tight">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-4 mb-3 scroll-m-20 font-semibold text-xl tracking-tight">{children}</h4>
    ),
    // Paragraph
    normal: ({ children }) => (
      <p className="text-[#737373] leading-7 [&:not(:first-child)]:mt-4">{children}</p>
    ),
    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-[#FF5200] border-l-4 pl-6 text-[#737373] italic">
        {children}
      </blockquote>
    ),
  },

  list: {
    // Bulleted list
    bullet: ({ children }) => (
      <ul className="my-6 ml-6 list-disc text-[#737373] [&>li]:mt-2">{children}</ul>
    ),
    // Numbered list
    number: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal text-[#737373] [&>li]:mt-2">{children}</ol>
    ),
  },

  listItem: {
    // Bulleted list item
    bullet: ({ children }) => <li className="leading-7">{children}</li>,
    // Numbered list item
    number: ({ children }) => <li className="leading-7">{children}</li>,
  },

  marks: {
    // Strong/bold
    strong: ({ children }) => <strong className="font-semibold text-[#171717]">{children}</strong>,
    // Emphasis/italic
    em: ({ children }) => <em className="italic">{children}</em>,
    // Code
    code: ({ children }) => (
      <code className="relative rounded bg-[#E5E5E5]/30 px-[0.3rem] py-[0.2rem] font-mono font-semibold text-[#171717] text-sm">
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
            className="font-medium text-[#FF5200] underline underline-offset-4 hover:text-[#FF5200]"
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
          className="font-medium text-[#FF5200] underline underline-offset-4 hover:text-[#FF5200]"
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
      }

      return (
        <Link
          className="font-medium text-[#FF5200] underline underline-offset-4 hover:text-[#FF5200]"
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

      const imageUrl = urlFor(value).width(800).url();
      const blurDataUrl = getBlurDataUrl(value);
      const alt = value?.alt || value?.caption || "Content image";

      return (
        <figure className="my-8">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-[#E5E5E5]">
            <Image
              alt={alt}
              blurDataURL={blurDataUrl}
              className="object-cover"
              fill
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
              src={imageUrl}
            />
          </div>
          {value?.caption && (
            <figcaption className="mt-2 text-center text-[#737373] text-sm">
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
        <div className="my-6">
          {filename && (
            <div className="rounded-t-lg bg-[#171717] px-4 py-2 font-mono text-[#737373]/50 text-sm">
              {filename}
            </div>
          )}
          <pre
            className={`overflow-x-auto p-4 ${
              filename ? "rounded-b-lg" : "rounded-lg"
            } bg-[#171717]`}
          >
            <code
              className={`font-mono text-[#FFFFFF] text-sm language-${language || "plaintext"}`}
            >
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
