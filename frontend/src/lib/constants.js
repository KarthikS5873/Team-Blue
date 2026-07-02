export const BUSINESS_TYPES = [
  'Freelancer', 'Agency', 'Restaurant', 'Retail Shop',
  'SaaS Founder', 'Consultant', 'Coach', 'Other'
];

export const ROLES = [
  'Founder', 'Solopreneur', 'Sales Manager', 'Marketing Manager',
  'Store Owner', 'CEO', 'Director', 'Other'
];

export const ACTIVITY_CATEGORIES = {
  'Freelancer': ['Client Work', 'Proposals & Pitches', 'Skill Development', 'Admin & Finance', 'Networking', 'Marketing'],
  'Agency': ['Client Projects', 'Sales & Proposals', 'Team Management', 'Admin & Finance', 'Marketing & Brand', 'Operations'],
  'Restaurant': ['Kitchen Ops', 'Customer Service', 'Staff Management', 'Inventory', 'Marketing', 'Admin & Finance'],
  'Retail Shop': ['Customer Sales', 'Inventory', 'Vendor Relations', 'Marketing', 'Staff', 'Admin & Finance'],
  'SaaS Founder': ['Product Dev', 'Sales & Marketing', 'Customer Support', 'Fundraising', 'Team Building', 'Strategy'],
  'Consultant': ['Client Engagements', 'Lead Gen', 'Content Creation', 'Skill Dev', 'Partnerships', 'Admin'],
  'Coach': ['Client Sessions', 'Course Creation', 'Marketing', 'Community', 'Admin & Finance', 'Networking'],
  'Other': ['Core Work', 'Business Dev', 'Marketing', 'Finance', 'Admin', 'Learning']
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
};

export const PRIORITY_COLORS = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-slate-400'
};
