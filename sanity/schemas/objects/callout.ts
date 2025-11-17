import { defineType } from "sanity";

/**
 * Callout/Alert block for highlighting important information
 * Matches the custom BlockEditor's callout functionality
 */
export default defineType({
	name: "callout",
	title: "Callout",
	type: "object",
	fields: [
		{
			name: "type",
			title: "Type",
			type: "string",
			options: {
				list: [
					{ title: "ℹ️ Info", value: "info" },
					{ title: "✅ Success", value: "success" },
					{ title: "⚠️ Warning", value: "warning" },
					{ title: "❌ Error", value: "error" },
					{ title: "💡 Tip", value: "tip" },
				],
				layout: "radio",
			},
			initialValue: "info",
			validation: (Rule) => Rule.required(),
		},
		{
			name: "title",
			title: "Title",
			type: "string",
			description: "Optional title for the callout",
		},
		{
			name: "content",
			title: "Content",
			type: "array",
			of: [
				{
					type: "block",
					styles: [{ title: "Normal", value: "normal" }],
					lists: [],
					marks: {
						decorators: [
							{ title: "Strong", value: "strong" },
							{ title: "Emphasis", value: "em" },
							{ title: "Code", value: "code" },
						],
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
								],
							},
						],
					},
				},
			],
			validation: (Rule) => Rule.required(),
		},
	],
	preview: {
		select: {
			type: "type",
			title: "title",
			content: "content",
		},
		prepare({ type, title, content }) {
			const emoji = {
				info: "ℹ️",
				success: "✅",
				warning: "⚠️",
				error: "❌",
				tip: "💡",
			}[type] || "ℹ️";

			const firstBlock = content?.[0];
			const subtitle =
				firstBlock?.children
					?.map((child: { text: string }) => child.text)
					?.join("") || "No content";

			return {
				title: title || `${emoji} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
				subtitle,
			};
		},
	},
});
