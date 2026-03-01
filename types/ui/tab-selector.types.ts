export interface TabItem {
  key: string;
  label: string;
}

export interface TabSelectorProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}
