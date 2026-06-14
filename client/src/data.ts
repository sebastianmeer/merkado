import type { FieldSpec, ListingCard, MetricCard, NavItem, QueueRow } from './types';

export const marketNav: NavItem[] = [
  { label: 'Products', to: '/products', tone: 'accent' },
  { label: 'Admin', to: '/admin', tone: 'neutral' },
  { label: 'Account', to: '/profile', tone: 'neutral' },
];

export const authNav: NavItem[] = [
  { label: 'Login', to: '/login', tone: 'accent' },
  { label: 'Signup', to: '/signup', tone: 'neutral' },
  { label: 'Reset', to: '/reset-password', tone: 'neutral' },
];

export const marketplaceMetrics: MetricCard[] = [
  { label: 'Active listings', value: '128', detail: 'Ready to browse this week' },
  { label: 'Categories covered', value: '8', detail: 'Electronics through services' },
  { label: 'Moderation queue', value: '12', detail: 'Awaiting admin review' },
  { label: 'Saved searches', value: '34', detail: 'Personalized feed placeholders' },
];

export const listingCards: ListingCard[] = [
  {
    title: 'Noise-canceling headphones',
    category: 'Electronics',
    seller: 'J. Mercado',
    price: 'PHP 5,400',
    summary: 'Premium audio with a compact charging case and fast pickup window.',
    status: 'Live',
  },
  {
    title: 'Weekend pantry bundle',
    category: 'Food',
    seller: 'Bayan Basket',
    price: 'PHP 680',
    summary: 'Starter bundle for neighborhood deliveries and bulk orders.',
    status: 'Queued',
  },
  {
    title: 'Refined desk lamp',
    category: 'Home',
    seller: 'Studio North',
    price: 'PHP 1,220',
    summary: 'A clean, modern listing shell for workspace gear and home essentials.',
    status: 'Draft',
  },
];

export const queueRows: QueueRow[] = [
  { title: 'School bag drop', owner: 'A. Cruz', stage: 'Needs photos', time: '2m ago' },
  { title: 'Repair service slot', owner: 'P. Santos', stage: 'Awaiting price', time: '19m ago' },
  { title: 'Vintage camera', owner: 'M. Reyes', stage: 'Ready for publish', time: '1h ago' },
];

export const authFields: FieldSpec[] = [
  { label: 'Email address', helper: 'Use the account email you plan to keep.' },
  { label: 'Password', helper: 'Strong password rules will plug in here.' },
];
