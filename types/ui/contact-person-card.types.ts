export interface ContactPerson {
  name: string;
  phone: string;
  department: string;
  isExtension: boolean;
}

export interface ContactPersonCardProps {
  person: ContactPerson;
  onChange: (person: ContactPerson) => void;
  onRemove?: () => void;
  canRemove: boolean;
}
