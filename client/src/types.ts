export type ShellVariant = 'market' | 'auth';

export type NavItem = {
  label: string;
  to: string;
  tone: 'neutral' | 'accent';
};

export type MetricCard = {
  label: string;
  value: string;
  detail: string;
};

export type ListingCard = {
  title: string;
  category: string;
  seller: string;
  price: string;
  summary: string;
  status: 'Draft' | 'Queued' | 'Live';
};

export type QueueRow = {
  title: string;
  owner: string;
  stage: string;
  time: string;
};

export type FieldSpec = {
  label: string;
  helper?: string;
};
