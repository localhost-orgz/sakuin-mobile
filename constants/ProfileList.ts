// Pertama, ekspor dulu typenya dari file profileList atau MenuRow
export type MenuItem = {
  label: string;
  type: "arrow" | "dropdown" | "logout";
  value?: string;
};

// Terus di file konstanta kamu:
export const GROUP_1: MenuItem[] = [
  { label: "Edit Profile", type: "arrow" },
  { label: "Wallet", type: "arrow" },
  { label: "Manage Categories", type: "arrow" },
];

export const GROUP_2: MenuItem[] = [
  { label: "Change Default Currency", type: "dropdown", value: "IDR" },
  { label: "Transaction History", type: "arrow" },
  { label: "Privacy", type: "arrow" },
  { label: "About Us", type: "arrow" },
];
