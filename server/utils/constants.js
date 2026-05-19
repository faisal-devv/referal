const Settings = require('../models/Settings');

const CURRENCY_WALLET_KEY = { USD: 'usd', AED: 'aed', EUR: 'euro', SAR: 'sar' };

const LEAD_STATUSES = [
  'Pending',
  'Contacted',
  'Proposal Submitted',
  'Deal Closed',
  'Client Refused',
];

const calculateCommissionAmount = async (lead) => {
  const settings = await Settings.findById('global');
  if (!settings?.commissionRates || lead.value <= 0) return 0;

  let rates = settings.commissionRates.get(lead.category);
  if (!rates) {
    settings.commissionRates.forEach((v, k) => {
      if (!rates) {
        const kl = k.toLowerCase();
        const cl = lead.category.toLowerCase();
        if (kl.includes(cl) || cl.includes(kl)) rates = v;
      }
    });
  }

  if (!rates) return 0;
  const midRate = (rates.min + rates.max) / 2;
  return parseFloat(((lead.value * midRate) / 100).toFixed(2));
};

module.exports = { CURRENCY_WALLET_KEY, LEAD_STATUSES, calculateCommissionAmount };
