import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Wallet-stored currencies (actual DB fields)
const WALLET_KEYS = { USD: 'usd', AED: 'aed', EUR: 'euro', SAR: 'sar' };

// Fallback rates (1 USD = X) used when API is unavailable
const FALLBACK_RATES = {
  USD:1, EUR:0.92, GBP:0.79, AED:3.674, SAR:3.75, JPY:149.5, CNY:7.24,
  INR:83.1, CAD:1.36, AUD:1.53, CHF:0.9, KRW:1325, SGD:1.34, MYR:4.72,
  THB:35.1, HKD:7.82, TWD:31.8, NOK:10.6, SEK:10.4, DKK:6.89, NZD:1.63,
  MXN:17.1, BRL:4.97, ARS:366, CLP:894, COP:3960, PEN:3.71, UYU:38.9,
  ZAR:18.6, NGN:1460, KES:128, GHS:12.1, EGP:30.9, MAD:10.1, TND:3.11,
  PKR:279, BDT:110, LKR:325, NPR:133, MMK:2099, VND:24580, IDR:15600,
  PHP:56.3, TRY:30.5, ILS:3.67, QAR:3.64, KWD:0.307, BHD:0.377, OMR:0.385,
  JOD:0.71, LBP:89500, IQD:1310, IRR:42000, RUB:89.5, UAH:37.1, PLN:4.0,
  CZK:22.8, HUF:359, RON:4.57, BGN:1.8, HRK:6.93, RSD:108, ISK:138,
  GEL:2.65, AMD:387, AZN:1.7, KZT:449, UZS:12400, GEL:2.65, MNT:3400,
  CUP:24, DOP:57.3, GTQ:7.82, HNL:24.7, CRC:530, PAB:1, BOB:6.91,
  PYG:7290, VES:36.5, AWG:1.79, TTD:6.77, JMD:156, BBD:2, HTG:131,
  XOF:600, XAF:600, DZD:135, TZS:2525, UGX:3755, RWF:1265, ETB:56.5,
  SOS:571, SDG:601, LYD:4.84, MUR:44.6, MGA:4500, ZMW:26.2, BWP:13.6,
  NAD:18.6, SZL:18.6, LSL:18.6, MZN:63.8, AOA:833, CDF:2750, GMD:67,
  SLL:20970, GNF:8625, BIF:2870, DJF:178, ERN:15, SCR:14.2, KMF:452,
  STN:22.8, CVE:101, MRU:39.7, LRD:188, SLE:22.9, GIP:0.79, FKP:0.79,
  SHP:0.79, FOK:6.89, ALL:96.9, BAM:1.8, MKD:56.5, MDL:17.7, BYN:3.27,
  TMT:3.51, TJS:10.9, AFN:72, YER:250, MOP:8.06, KHR:4120, LAK:21000,
  BTN:83.1, MVR:15.4, WST:2.72, FJD:2.25, PGK:3.74, SBD:8.37, VUV:119,
  TOP:2.37, KID:1.53, NRU:1.53, TVD:1.53, CKD:1.63, NIU:1.63,
};

export const CURRENCIES = [
  // Wallet currencies first
  { code:'USD', symbol:'$',    flag:'🇺🇸', name:'US Dollar',            walletKey:'usd'  },
  { code:'AED', symbol:'د.إ', flag:'🇦🇪', name:'UAE Dirham',           walletKey:'aed'  },
  { code:'EUR', symbol:'€',   flag:'🇪🇺', name:'Euro',                 walletKey:'euro' },
  { code:'SAR', symbol:'﷼',  flag:'🇸🇦', name:'Saudi Riyal',          walletKey:'sar'  },
  // Rest alphabetically
  { code:'AFN', symbol:'؋',   flag:'🇦🇫', name:'Afghan Afghani'       },
  { code:'ALL', symbol:'L',   flag:'🇦🇱', name:'Albanian Lek'         },
  { code:'AMD', symbol:'֏',   flag:'🇦🇲', name:'Armenian Dram'        },
  { code:'ANG', symbol:'ƒ',   flag:'🇳🇱', name:'Netherlands Antillean Guilder' },
  { code:'AOA', symbol:'Kz',  flag:'🇦🇴', name:'Angolan Kwanza'       },
  { code:'ARS', symbol:'$',   flag:'🇦🇷', name:'Argentine Peso'       },
  { code:'AUD', symbol:'A$',  flag:'🇦🇺', name:'Australian Dollar'    },
  { code:'AWG', symbol:'ƒ',   flag:'🇦🇼', name:'Aruban Florin'        },
  { code:'AZN', symbol:'₼',   flag:'🇦🇿', name:'Azerbaijani Manat'    },
  { code:'BAM', symbol:'KM',  flag:'🇧🇦', name:'Bosnian Mark'         },
  { code:'BBD', symbol:'Bds$',flag:'🇧🇧', name:'Barbadian Dollar'     },
  { code:'BDT', symbol:'৳',   flag:'🇧🇩', name:'Bangladeshi Taka'     },
  { code:'BGN', symbol:'лв',  flag:'🇧🇬', name:'Bulgarian Lev'        },
  { code:'BHD', symbol:'.د.ب',flag:'🇧🇭', name:'Bahraini Dinar'       },
  { code:'BIF', symbol:'Fr',  flag:'🇧🇮', name:'Burundian Franc'      },
  { code:'BMD', symbol:'$',   flag:'🇧🇲', name:'Bermudian Dollar'     },
  { code:'BND', symbol:'B$',  flag:'🇧🇳', name:'Brunei Dollar'        },
  { code:'BOB', symbol:'Bs.', flag:'🇧🇴', name:'Bolivian Boliviano'   },
  { code:'BRL', symbol:'R$',  flag:'🇧🇷', name:'Brazilian Real'       },
  { code:'BSD', symbol:'B$',  flag:'🇧🇸', name:'Bahamian Dollar'      },
  { code:'BTN', symbol:'Nu',  flag:'🇧🇹', name:'Bhutanese Ngultrum'   },
  { code:'BWP', symbol:'P',   flag:'🇧🇼', name:'Botswana Pula'        },
  { code:'BYN', symbol:'Br',  flag:'🇧🇾', name:'Belarusian Ruble'     },
  { code:'BZD', symbol:'BZ$', flag:'🇧🇿', name:'Belize Dollar'        },
  { code:'CAD', symbol:'C$',  flag:'🇨🇦', name:'Canadian Dollar'      },
  { code:'CDF', symbol:'Fr',  flag:'🇨🇩', name:'Congolese Franc'      },
  { code:'CHF', symbol:'Fr',  flag:'🇨🇭', name:'Swiss Franc'          },
  { code:'CLP', symbol:'$',   flag:'🇨🇱', name:'Chilean Peso'         },
  { code:'CNY', symbol:'¥',   flag:'🇨🇳', name:'Chinese Yuan'         },
  { code:'COP', symbol:'$',   flag:'🇨🇴', name:'Colombian Peso'       },
  { code:'CRC', symbol:'₡',   flag:'🇨🇷', name:'Costa Rican Colón'    },
  { code:'CUP', symbol:'$',   flag:'🇨🇺', name:'Cuban Peso'           },
  { code:'CVE', symbol:'$',   flag:'🇨🇻', name:'Cape Verdean Escudo'  },
  { code:'CZK', symbol:'Kč',  flag:'🇨🇿', name:'Czech Koruna'         },
  { code:'DJF', symbol:'Fr',  flag:'🇩🇯', name:'Djiboutian Franc'     },
  { code:'DKK', symbol:'kr',  flag:'🇩🇰', name:'Danish Krone'         },
  { code:'DOP', symbol:'RD$', flag:'🇩🇴', name:'Dominican Peso'       },
  { code:'DZD', symbol:'دج',  flag:'🇩🇿', name:'Algerian Dinar'       },
  { code:'EGP', symbol:'E£',  flag:'🇪🇬', name:'Egyptian Pound'       },
  { code:'ERN', symbol:'Nfk', flag:'🇪🇷', name:'Eritrean Nakfa'       },
  { code:'ETB', symbol:'Br',  flag:'🇪🇹', name:'Ethiopian Birr'       },
  { code:'FJD', symbol:'FJ$', flag:'🇫🇯', name:'Fijian Dollar'        },
  { code:'FKP', symbol:'£',   flag:'🇫🇰', name:'Falkland Islands Pound'},
  { code:'GBP', symbol:'£',   flag:'🇬🇧', name:'British Pound'        },
  { code:'GEL', symbol:'₾',   flag:'🇬🇪', name:'Georgian Lari'        },
  { code:'GHS', symbol:'GH₵', flag:'🇬🇭', name:'Ghanaian Cedi'        },
  { code:'GIP', symbol:'£',   flag:'🇬🇮', name:'Gibraltar Pound'      },
  { code:'GMD', symbol:'D',   flag:'🇬🇲', name:'Gambian Dalasi'       },
  { code:'GNF', symbol:'Fr',  flag:'🇬🇳', name:'Guinean Franc'        },
  { code:'GTQ', symbol:'Q',   flag:'🇬🇹', name:'Guatemalan Quetzal'   },
  { code:'GYD', symbol:'$',   flag:'🇬🇾', name:'Guyanese Dollar'      },
  { code:'HKD', symbol:'HK$', flag:'🇭🇰', name:'Hong Kong Dollar'     },
  { code:'HNL', symbol:'L',   flag:'🇭🇳', name:'Honduran Lempira'     },
  { code:'HRK', symbol:'kn',  flag:'🇭🇷', name:'Croatian Kuna'        },
  { code:'HTG', symbol:'G',   flag:'🇭🇹', name:'Haitian Gourde'       },
  { code:'HUF', symbol:'Ft',  flag:'🇭🇺', name:'Hungarian Forint'     },
  { code:'IDR', symbol:'Rp',  flag:'🇮🇩', name:'Indonesian Rupiah'    },
  { code:'ILS', symbol:'₪',   flag:'🇮🇱', name:'Israeli Shekel'       },
  { code:'INR', symbol:'₹',   flag:'🇮🇳', name:'Indian Rupee'         },
  { code:'IQD', symbol:'ع.د', flag:'🇮🇶', name:'Iraqi Dinar'          },
  { code:'IRR', symbol:'﷼',  flag:'🇮🇷', name:'Iranian Rial'         },
  { code:'ISK', symbol:'kr',  flag:'🇮🇸', name:'Icelandic Króna'      },
  { code:'JMD', symbol:'J$',  flag:'🇯🇲', name:'Jamaican Dollar'      },
  { code:'JOD', symbol:'JD',  flag:'🇯🇴', name:'Jordanian Dinar'      },
  { code:'JPY', symbol:'¥',   flag:'🇯🇵', name:'Japanese Yen'         },
  { code:'KES', symbol:'KSh', flag:'🇰🇪', name:'Kenyan Shilling'      },
  { code:'KGS', symbol:'с',   flag:'🇰🇬', name:'Kyrgyzstani Som'      },
  { code:'KHR', symbol:'៛',   flag:'🇰🇭', name:'Cambodian Riel'       },
  { code:'KMF', symbol:'Fr',  flag:'🇰🇲', name:'Comorian Franc'       },
  { code:'KPW', symbol:'₩',   flag:'🇰🇵', name:'North Korean Won'     },
  { code:'KRW', symbol:'₩',   flag:'🇰🇷', name:'South Korean Won'     },
  { code:'KWD', symbol:'KD',  flag:'🇰🇼', name:'Kuwaiti Dinar'        },
  { code:'KYD', symbol:'CI$', flag:'🇰🇾', name:'Cayman Islands Dollar' },
  { code:'KZT', symbol:'₸',   flag:'🇰🇿', name:'Kazakhstani Tenge'    },
  { code:'LAK', symbol:'₭',   flag:'🇱🇦', name:'Lao Kip'              },
  { code:'LBP', symbol:'L£',  flag:'🇱🇧', name:'Lebanese Pound'       },
  { code:'LKR', symbol:'Rs',  flag:'🇱🇰', name:'Sri Lankan Rupee'     },
  { code:'LRD', symbol:'L$',  flag:'🇱🇷', name:'Liberian Dollar'      },
  { code:'LSL', symbol:'L',   flag:'🇱🇸', name:'Lesotho Loti'         },
  { code:'LYD', symbol:'LD',  flag:'🇱🇾', name:'Libyan Dinar'         },
  { code:'MAD', symbol:'MAD', flag:'🇲🇦', name:'Moroccan Dirham'      },
  { code:'MDL', symbol:'L',   flag:'🇲🇩', name:'Moldovan Leu'         },
  { code:'MGA', symbol:'Ar',  flag:'🇲🇬', name:'Malagasy Ariary'      },
  { code:'MKD', symbol:'ден', flag:'🇲🇰', name:'Macedonian Denar'     },
  { code:'MMK', symbol:'K',   flag:'🇲🇲', name:'Myanmar Kyat'         },
  { code:'MNT', symbol:'₮',   flag:'🇲🇳', name:'Mongolian Tögrög'     },
  { code:'MOP', symbol:'P',   flag:'🇲🇴', name:'Macanese Pataca'      },
  { code:'MRU', symbol:'UM',  flag:'🇲🇷', name:'Mauritanian Ouguiya'  },
  { code:'MUR', symbol:'Rs',  flag:'🇲🇺', name:'Mauritian Rupee'      },
  { code:'MVR', symbol:'Rf',  flag:'🇲🇻', name:'Maldivian Rufiyaa'    },
  { code:'MWK', symbol:'MK',  flag:'🇲🇼', name:'Malawian Kwacha'      },
  { code:'MXN', symbol:'MX$', flag:'🇲🇽', name:'Mexican Peso'         },
  { code:'MYR', symbol:'RM',  flag:'🇲🇾', name:'Malaysian Ringgit'    },
  { code:'MZN', symbol:'MT',  flag:'🇲🇿', name:'Mozambican Metical'   },
  { code:'NAD', symbol:'N$',  flag:'🇳🇦', name:'Namibian Dollar'      },
  { code:'NGN', symbol:'₦',   flag:'🇳🇬', name:'Nigerian Naira'       },
  { code:'NIO', symbol:'C$',  flag:'🇳🇮', name:'Nicaraguan Córdoba'   },
  { code:'NOK', symbol:'kr',  flag:'🇳🇴', name:'Norwegian Krone'      },
  { code:'NPR', symbol:'Rs',  flag:'🇳🇵', name:'Nepalese Rupee'       },
  { code:'NZD', symbol:'NZ$', flag:'🇳🇿', name:'New Zealand Dollar'   },
  { code:'OMR', symbol:'﷼',  flag:'🇴🇲', name:'Omani Rial'           },
  { code:'PAB', symbol:'B/.',  flag:'🇵🇦', name:'Panamanian Balboa'    },
  { code:'PEN', symbol:'S/.',  flag:'🇵🇪', name:'Peruvian Sol'         },
  { code:'PGK', symbol:'K',   flag:'🇵🇬', name:'Papua New Guinean Kina'},
  { code:'PHP', symbol:'₱',   flag:'🇵🇭', name:'Philippine Peso'      },
  { code:'PKR', symbol:'Rs',  flag:'🇵🇰', name:'Pakistani Rupee'      },
  { code:'PLN', symbol:'zł',  flag:'🇵🇱', name:'Polish Złoty'         },
  { code:'PYG', symbol:'₲',   flag:'🇵🇾', name:'Paraguayan Guaraní'   },
  { code:'QAR', symbol:'QR',  flag:'🇶🇦', name:'Qatari Riyal'         },
  { code:'RON', symbol:'lei', flag:'🇷🇴', name:'Romanian Leu'         },
  { code:'RSD', symbol:'din', flag:'🇷🇸', name:'Serbian Dinar'        },
  { code:'RUB', symbol:'₽',   flag:'🇷🇺', name:'Russian Ruble'        },
  { code:'RWF', symbol:'Fr',  flag:'🇷🇼', name:'Rwandan Franc'        },
  { code:'SBD', symbol:'SI$', flag:'🇸🇧', name:'Solomon Islands Dollar'},
  { code:'SCR', symbol:'Rs',  flag:'🇸🇨', name:'Seychellois Rupee'    },
  { code:'SDG', symbol:'£',   flag:'🇸🇩', name:'Sudanese Pound'       },
  { code:'SEK', symbol:'kr',  flag:'🇸🇪', name:'Swedish Krona'        },
  { code:'SGD', symbol:'S$',  flag:'🇸🇬', name:'Singapore Dollar'     },
  { code:'SHP', symbol:'£',   flag:'🇸🇭', name:'Saint Helena Pound'   },
  { code:'SLL', symbol:'Le',  flag:'🇸🇱', name:'Sierra Leonean Leone'  },
  { code:'SOS', symbol:'Sh',  flag:'🇸🇴', name:'Somali Shilling'      },
  { code:'SRD', symbol:'$',   flag:'🇸🇷', name:'Surinamese Dollar'    },
  { code:'STN', symbol:'Db',  flag:'🇸🇹', name:'São Tomé Dobra'       },
  { code:'SVC', symbol:'₡',   flag:'🇸🇻', name:'Salvadoran Colón'     },
  { code:'SYP', symbol:'£',   flag:'🇸🇾', name:'Syrian Pound'         },
  { code:'SZL', symbol:'L',   flag:'🇸🇿', name:'Swazi Lilangeni'      },
  { code:'THB', symbol:'฿',   flag:'🇹🇭', name:'Thai Baht'            },
  { code:'TJS', symbol:'SM',  flag:'🇹🇯', name:'Tajikistani Somoni'   },
  { code:'TMT', symbol:'T',   flag:'🇹🇲', name:'Turkmenistan Manat'   },
  { code:'TND', symbol:'DT',  flag:'🇹🇳', name:'Tunisian Dinar'       },
  { code:'TOP', symbol:'T$',  flag:'🇹🇴', name:'Tongan Paʻanga'       },
  { code:'TRY', symbol:'₺',   flag:'🇹🇷', name:'Turkish Lira'         },
  { code:'TTD', symbol:'TT$', flag:'🇹🇹', name:'Trinidad & Tobago Dollar'},
  { code:'TWD', symbol:'NT$', flag:'🇹🇼', name:'Taiwan Dollar'        },
  { code:'TZS', symbol:'Sh',  flag:'🇹🇿', name:'Tanzanian Shilling'   },
  { code:'UAH', symbol:'₴',   flag:'🇺🇦', name:'Ukrainian Hryvnia'    },
  { code:'UGX', symbol:'Sh',  flag:'🇺🇬', name:'Ugandan Shilling'     },
  { code:'UYU', symbol:'$U',  flag:'🇺🇾', name:'Uruguayan Peso'       },
  { code:'UZS', symbol:'so\'m',flag:'🇺🇿', name:'Uzbekistani Som'      },
  { code:'VES', symbol:'Bs.S',flag:'🇻🇪', name:'Venezuelan Bolívar'   },
  { code:'VND', symbol:'₫',   flag:'🇻🇳', name:'Vietnamese Đồng'      },
  { code:'VUV', symbol:'Vt',  flag:'🇻🇺', name:'Vanuatu Vatu'         },
  { code:'WST', symbol:'T',   flag:'🇼🇸', name:'Samoan Tālā'          },
  { code:'XAF', symbol:'Fr',  flag:'🌍', name:'Central African CFA Franc'},
  { code:'XCD', symbol:'EC$', flag:'🌎', name:'East Caribbean Dollar' },
  { code:'XOF', symbol:'Fr',  flag:'🌍', name:'West African CFA Franc'},
  { code:'XPF', symbol:'Fr',  flag:'🌏', name:'CFP Franc'             },
  { code:'YER', symbol:'﷼',  flag:'🇾🇪', name:'Yemeni Rial'          },
  { code:'ZAR', symbol:'R',   flag:'🇿🇦', name:'South African Rand'   },
  { code:'ZMW', symbol:'ZK',  flag:'🇿🇲', name:'Zambian Kwacha'       },
  { code:'ZWL', symbol:'$',   flag:'🇿🇼', name:'Zimbabwean Dollar'    },
];

const CACHE_KEY = 'cx_rates_v1';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const CurrencyContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem('preferredCurrency') || 'USD'
  );
  const [rates, setRates] = useState(FALLBACK_RATES);

  // Load rates on mount (with 1-hour cache)
  useEffect(() => {
    const loadRates = async () => {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
          setRates(cached.rates);
          return;
        }
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (data.rates) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, ts: Date.now() }));
          setRates(data.rates);
        }
      } catch {
        // silently fall back to hardcoded rates
      }
    };
    loadRates();
  }, []);

  // Sync currency preference from user profile on mount (if logged in)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(user => {
        if (user?.preferredCurrency && user.preferredCurrency !== currency) {
          setCurrencyState(user.preferredCurrency);
          localStorage.setItem('preferredCurrency', user.preferredCurrency);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrency = (code) => {
    localStorage.setItem('preferredCurrency', code);
    setCurrencyState(code);
    // Persist to user profile (fire and forget)
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/users/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ preferredCurrency: code })
      }).catch(() => {});
    }
  };

  const convert = useCallback((amount, from = 'USD') => {
    const fromRate = rates[from] || FALLBACK_RATES[from] || 1;
    const toRate   = rates[currency] || FALLBACK_RATES[currency] || 1;
    return ((amount || 0) / fromRate) * toRate;
  }, [currency, rates]);

  // Returns only ASCII-safe symbol; falls back to the currency code for Arabic/non-Latin symbols
  const safeSymbol = (code, symbol) =>
    /^[\x20-\x7E]+$/.test(symbol || '') ? symbol : code;

  const format = useCallback((amount, from = 'USD') => {
    const info = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    const sym = safeSymbol(info.code, info.symbol);
    const spacer = sym.length > 1 ? ' ' : '';
    return `${sym}${spacer}${convert(amount, from).toFixed(2)}`;
  }, [currency, convert]);

  const walletTotal = useCallback((wallet = {}) => {
    return CURRENCIES.filter(c => c.walletKey).reduce(
      (sum, c) => sum + convert(wallet[c.walletKey] || 0, c.code), 0
    );
  }, [convert]);

  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  // Always expose an ASCII-safe symbol on currencyInfo
  const safeCurrencyInfo = {
    ...currencyInfo,
    symbol: safeSymbol(currencyInfo.code, currencyInfo.symbol),
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, walletTotal, currencyInfo: safeCurrencyInfo, CURRENCIES, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
