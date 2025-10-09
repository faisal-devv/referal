import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import Card from '../Common/Card';

const WalletSummary = ({ wallet }) => {
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', value: wallet?.usd || 0 },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', value: wallet?.aed || 0 },
    { code: 'EUR', symbol: '€', name: 'Euro', value: wallet?.euro || 0 },
    { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', value: wallet?.sar || 0 }
  ];

  const totalValue = currencies.reduce((sum, currency) => sum + currency.value, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Balance</h3>
        <div className="flex items-center text-sm text-gray-500">
          <TrendingUp className="h-4 w-4 mr-1" />
          Total: ${totalValue.toFixed(2)}
        </div>
      </div>
      
      <div className="space-y-3">
        {currencies.map((currency) => (
          <div key={currency.code} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currency.name}</p>
                <p className="text-xs text-gray-500">{currency.code}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {currency.symbol}{currency.value.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <a
          href="/wallet"
          className="block w-full text-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition duration-200"
        >
          View Full Wallet
        </a>
      </div>
    </Card>
  );
};

export default WalletSummary;
