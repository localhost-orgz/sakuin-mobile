// Pertama, ekspor dulu typenya dari file profileList atau MenuRow
export type MenuItem = {
  label: string;
  type: "arrow" | "dropdown" | "logout";
  value?: string;
  link?: string;
};

// Terus di file konstanta kamu:
export const GROUP_1: MenuItem[] = [
  {
    label: "Edit Profile",
    type: "arrow",
    link: "/(others)/(profilePage)/editProfile",
  },
  {
    label: "Manage Categories",
    type: "arrow",
    link: "/(others)/(profilePage)/manageCategory",
  },
];

export const GROUP_2: MenuItem[] = [
  {
    label: "Change Default Currency",
    type: "dropdown",
    value: "IDR",
    link: "",
  },
  { label: "Transaction History", type: "arrow", link: "" },

  {
    label: "Privacy",
    type: "arrow",
    link: "/(others)/(profilePage)/aboutUs.tsx",
  },
  {
    label: "About Us",
    type: "arrow",
    link: "/(others)/(profilePage)/privacy.tsx",
  },
];
