import type { Meta, StoryObj } from "@storybook/react";
import { LiaDoubleSidebar } from "./lia-double-sidebar";

const meta = {
  title: "Admin/LiaDoubleSidebar",
  component: LiaDoubleSidebar,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-neutral-50">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LiaDoubleSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userName: "Christopher Rodriguez",
    userEmail: "christopher@casaora.co",
  },
};

export const WithAvatar: Story = {
  args: {
    userName: "Sarah Chen",
    userEmail: "sarah.chen@casaora.co",
    userAvatarUrl: "https://i.pravatar.cc/150?img=5",
  },
};

export const LongName: Story = {
  args: {
    userName: "Alexander Montgomery-Richardson III",
    userEmail: "alexander.montgomery.richardson@casaora.co",
  },
};

export const MinimalInfo: Story = {
  args: {
    userName: "Admin",
    userEmail: "admin@casaora.co",
  },
};
