import { defineType } from "sanity";

/**
 * Divider/separator block
 * Matches the custom BlockEditor's divider functionality
 */
export default defineType({
	name: "divider",
	title: "Divider",
	type: "object",
	fields: [
		{
			name: "style",
			title: "Style",
			type: "string",
			options: {
				list: [
					{ title: "Solid Line", value: "solid" },
					{ title: "Dashed Line", value: "dashed" },
					{ title: "Dotted Line", value: "dotted" },
					{ title: "Stars (***)", value: "stars" },
				],
				layout: "radio",
			},
			initialValue: "solid",
		},
	],
	preview: {
		select: {
			style: "style",
		},
		prepare({ style }) {
			const lines = {
				solid: "──────────────────",
				dashed: "- - - - - - - - - -",
				dotted: "· · · · · · · · · ·",
				stars: "* * * * * * * * * *",
			}[style] || "──────────────────";

			return {
				title: lines,
				subtitle: `Divider (${style})`,
			};
		},
	},
});
