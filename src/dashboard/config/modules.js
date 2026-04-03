// src/config/modules.ts
import { 
  Favorite, Shield, AccountBalance, Savings, 
  HealthAndSafety, CreditCard, TrendingUp, Warning, 
  Handshake, QueryStats 
} from '@mui/icons-material';

export const ACTUARIAL_MODULES = [
  { id: '01', title: 'Life Contingencies', path: '/01-life-contingencies', icon: Favorite, desc: 'Mortality modeling & premium pricing' },
  { id: '02', title: 'General Insurance', path: '/02-general-insurance', icon: Shield, desc: 'Loss reserving & frequency-severity'},
  { id: '03', title: 'Finance Mathematics', path: '/03-finance-mathematics', icon: AccountBalance, desc: 'Bond pricing & derivative Greeks' },
  { id: '04', title: 'Pensions', path: '/04-pensions', icon: Savings, desc: 'Valuation & funding projections' },
  { id: '05', title: 'Health Insurance', path: '/05-health-insurance', icon: HealthAndSafety, desc: 'Medical burning cost & capitation' },
  { id: '06', title: 'Banking & Credit', path: '/06-banking-credit', icon: CreditCard, desc: 'Credit scoring & Markov migrations' },
  { id: '07', title: 'Investment & ALM', path: '/07-investment-alm', icon: TrendingUp, desc: 'Portfolio optimization & matching' },
  { id: '08', title: 'Risk Theory', path: '/08-risk-theory', icon: Warning, desc: 'Monte Carlo ruin simulations' },
  { id: '09', title: 'Reinsurance', path: '/09-reinsurance', icon: Handshake, desc: 'Pricing for XoL & Quota Share' },
  { id: '10', title: 'Data Science', path: '/10-data-science', icon: QueryStats, desc: 'GLMs, SHAP & IFRS 17 logic' },
];