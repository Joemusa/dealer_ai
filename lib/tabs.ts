export const tabs = ["opportunities", "stock", "leads", "sales", "assistant"] as const;
export type Tab = (typeof tabs)[number];

export function isTab(value: string | undefined): value is Tab {
  return !!value && (tabs as readonly string[]).includes(value);
}
