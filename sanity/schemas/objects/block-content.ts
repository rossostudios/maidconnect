import { defineArrayMember, defineType } from "sanity";

/**
 * Enhanced Portable Text configuration for rich text content
 * Matches custom BlockEditor features: code blocks, callouts, dividers, checkboxes
 * Used across help articles, changelogs, roadmap items, and marketing pages
 */
export default defineType({
	name: "blockContent",
	title: "Block Content",
	type: "array",
	of: [
		defineArrayMember({
			type: "block",
			// Styles let you define what blocks can be marked up as
			styles: [
				{ title: "Normal", value: "normal" },
				{ title: "H1", value: "h1" },
				{ title: "H2", value: "h2" },
				{ title: "H3", value: "h3" },
				{ title: "H4", value: "h4" },
				{ title: "Quote", value: "blockquote" },
			],
			lists: [
				{ title: "Bullet", value: "bullet" },
				{ title: "Numbered", value: "number" },
				{ title: "Checkbox", value: "checkbox" },
			],
			// Marks let you mark up inline text in the block editor
			marks: {
				// Decorators usually describe a single property – e.g. a typographic preference or highlight
				decorators: [
					{ title: "Strong", value: "strong" },
					{ title: "Emphasis", value: "em" },
					{ title: "Code", value: "code" },
					{ title: "Underline", value: "underline" },
					{ title: "Strike", value: "strike-through" },
					{ title: "Highlight", value: "highlight" },
				],
				// Annotations can be any object structure – e.g. a link or a footnote
				annotations: [
					{
						title: "URL",
						name: "link",
						type: "object",
						fields: [
							{
								title: "URL",
								name: "href",
								type: "url",
								validation: (Rule) =>
									Rule.uri({
										scheme: ["http", "https", "mailto", "tel"],
									}),
							},
							{
								title: "Open in new tab",
								name: "blank",
								type: "boolean",
								initialValue: false,
							},
						],
					},
					{
						title: "Internal Link",
						name: "internalLink",
						type: "object",
						fields: [
							{
								title: "Reference",
								name: "reference",
								type: "reference",
								to: [
									{ type: "page" },
									{ type: "helpArticle" },
									{ type: "changelog" },
									{ type: "roadmapItem" },
								],
							},
						],
					},
				],
			},
		}),
		// Images with alt text and captions
		defineArrayMember({
			type: "image",
			fields: [
				{
					name: "alt",
					type: "string",
					title: "Alternative text",
					description: "Important for SEO and accessibility",
					validation: (Rule) => Rule.required(),
				},
				{
					name: "caption",
					type: "string",
					title: "Caption",
				},
			],
			options: {
				hotspot: true,
			},
		}),
		// Code blocks with syntax highlighting
		defineArrayMember({
			type: "code",
			title: "Code Block",
			options: {
				language: "typescript",
				languageAlternatives: [
					{ title: "TypeScript", value: "typescript" },
					{ title: "JavaScript", value: "javascript" },
					{ title: "JSX", value: "jsx" },
					{ title: "TSX", value: "tsx" },
					{ title: "JSON", value: "json" },
					{ title: "HTML", value: "html" },
					{ title: "CSS", value: "css" },
					{ title: "SCSS", value: "scss" },
					{ title: "Python", value: "python" },
					{ title: "Java", value: "java" },
					{ title: "C#", value: "csharp" },
					{ title: "Go", value: "go" },
					{ title: "Rust", value: "rust" },
					{ title: "SQL", value: "sql" },
					{ title: "GraphQL", value: "graphql" },
					{ title: "Markdown", value: "markdown" },
					{ title: "YAML", value: "yaml" },
					{ title: "Bash", value: "bash" },
					{ title: "Shell", value: "sh" },
					{ title: "Plain Text", value: "text" },
				],
				withFilename: true,
			},
		}),
		// Callouts for important information
		defineArrayMember({
			type: "callout",
		}),
		// Dividers/separators
		defineArrayMember({
			type: "divider",
		}),
	],
});
