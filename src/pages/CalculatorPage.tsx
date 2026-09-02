import { useState, useMemo } from 'react';
import { Calculator, Info, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { formatPKR, formatPKRShort } from '@/lib/format';

export function CalculatorPage() {
  const [propertyPrice, setPropertyPrice] = useState('10000000');
  const [downPaymentPct, setDownPaymentPct] = useState('20');
  const [duration, setDuration] = useState('10');
  const [interestRate, setInterestRate] = useState('14');

  const calc = useMemo(() => {
    const price = parseFloat(propertyPrice) || 0;
    const downPct = parseFloat(downPaymentPct) || 0;
    const years = parseFloat(duration) || 1;
    const rate = parseFloat(interestRate) || 0;

    const downPayment = (price * downPct) / 100;
    const loanAmount = price - downPayment;
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;

    let monthlyInstallment: number;
    if (monthlyRate === 0) {
      monthlyInstallment = loanAmount / numPayments;
    } else {
      const factor = Math.pow(1 + monthlyRate, numPayments);
      monthlyInstallment = (loanAmount * monthlyRate * factor) / (factor - 1);
    }

    const totalPayable = monthlyInstallment * numPayments;
    const totalInterest = totalPayable - loanAmount;

    const principalPct = loanAmount > 0 ? (loanAmount / totalPayable) * 100 : 0;
    const interestPct = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;

    // Year-by-year breakdown for chart
    let remainingBalance = loanAmount;
    const yearlyData: { year: number; principal: number; interest: number; balance: number }[] = [];
    for (let y = 1; y <= Math.ceil(years); y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyInstallment - interestPayment;
        yearPrincipal += principalPayment;
        yearInterest += interestPayment;
        remainingBalance -= principalPayment;
        if (remainingBalance < 0) remainingBalance = 0;
      }
      yearlyData.push({
        year: y,
        principal: Math.round(yearPrincipal),
        interest: Math.round(yearInterest),
        balance: Math.round(remainingBalance),
      });
    }

    return {
      downPayment: Math.round(downPayment),
      loanAmount: Math.round(loanAmount),
      monthlyInstallment: Math.round(monthlyInstallment),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(totalInterest),
      principalPct,
      interestPct,
      yearlyData,
    };
  }, [propertyPrice, downPaymentPct, duration, interestRate]);

  const maxYearlyPrincipal = Math.max(...calc.yearlyData.map((d) => d.principal + d.interest), 1);

  return (
    <div className="animate-fade-in pt-20">
      <div className="bg-forest-600 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">Installment Calculator</h1>
          <p className="mt-2 text-sm text-cream-100/60">
            Plan your property purchase with our easy installment calculator
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Inputs */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 card-shadow sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-500">
                  <Calculator className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-forest-700">Loan Details</h2>
                  <p className="text-sm text-forest-400">Adjust the values to see live results</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-forest-600">Property Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-forest-300">PKR</span>
                    <input
                      type="number"
                      min="0"
                      value={propertyPrice}
                      onChange={(e) => setPropertyPrice(e.target.value)}
                      className="input-field pl-12"
                    />
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="500000000"
                    step="500000"
                    value={Math.min(parseFloat(propertyPrice) || 0, 500000000)}
                    onChange={(e) => setPropertyPrice(e.target.value)}
                    className="mt-2 w-full accent-gold-400"
                  />
                  <div className="mt-1 flex justify-between text-xs text-forest-300">
                    <span>10 Lakh</span>
                    <span>50 Crore</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-forest-600">
                    Down Payment: <span className="font-bold text-gold-500">{downPaymentPct}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="5"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(e.target.value)}
                    className="w-full accent-gold-400"
                  />
                  <p className="mt-1 text-xs text-forest-400">
                    Down payment amount: <span className="font-semibold text-forest-600">{formatPKR(calc.downPayment)}</span>
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-forest-600">
                    Installment Plan Duration: <span className="font-bold text-gold-500">{duration} years</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full accent-gold-400"
                  />
                  <div className="mt-1 flex justify-between text-xs text-forest-300">
                    <span>1 year</span>
                    <span>25 years</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-forest-600">
                    Interest / Markup Rate: <span className="font-bold text-gold-500">{interestRate}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full accent-gold-400"
                  />
                  <div className="mt-1 flex justify-between text-xs text-forest-300">
                    <span>0%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-2 rounded-lg bg-cream-200/50 p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <p className="text-xs text-forest-400">
                  This is an estimate based on a standard amortization formula. Actual rates and terms vary by bank and Islamic financing plan. Consult our team for current options.
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Monthly Installment Hero */}
            <div className="rounded-2xl bg-gradient-to-br from-forest-600 to-forest-700 p-6 text-cream-100 card-shadow sm:p-8">
              <div className="flex items-center gap-2 text-gold-300">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Monthly Installment</span>
              </div>
              <p className="mt-3 font-display text-4xl font-bold text-cream-100 sm:text-5xl">
                {formatPKR(calc.monthlyInstallment)}
                <span className="text-lg font-normal text-cream-100/40">/mo</span>
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-forest-500 pt-6 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-cream-100/40">Loan Amount</p>
                  <p className="mt-1 font-display text-lg font-semibold text-cream-100">{formatPKRShort(calc.loanAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-cream-100/40">Down Payment</p>
                  <p className="mt-1 font-display text-lg font-semibold text-cream-100">{formatPKRShort(calc.downPayment)}</p>
                </div>
                <div>
                  <p className="text-xs text-cream-100/40">Total Interest</p>
                  <p className="mt-1 font-display text-lg font-semibold text-gold-300">{formatPKRShort(calc.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-xs text-cream-100/40">Total Payable</p>
                  <p className="mt-1 font-display text-lg font-semibold text-cream-100">{formatPKRShort(calc.totalPayable)}</p>
                </div>
              </div>
            </div>

            {/* Breakdown Chart */}
            <div className="mt-6 rounded-2xl bg-white p-6 card-shadow sm:p-8">
              <h3 className="font-display text-lg font-bold text-forest-700">Payment Breakdown</h3>

              {/* Proportion bar */}
              <div className="mt-4">
                <div className="flex h-6 overflow-hidden rounded-lg">
                  <div
                    className="flex items-center justify-center bg-forest-500 text-xs font-semibold text-cream-100"
                    style={{ width: `${calc.principalPct}%` }}
                  >
                    {calc.principalPct.toFixed(0)}%
                  </div>
                  <div
                    className="flex items-center justify-center bg-gold-400 text-xs font-semibold text-forest-700"
                    style={{ width: `${calc.interestPct}%` }}
                  >
                    {calc.interestPct.toFixed(0)}%
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-forest-500"></span>
                    <span className="text-sm text-forest-500">Principal: <strong className="text-forest-700">{formatPKR(calc.loanAmount)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gold-400"></span>
                    <span className="text-sm text-forest-500">Interest: <strong className="text-forest-700">{formatPKR(calc.totalInterest)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Year-by-year bar chart */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-forest-600">Yearly Payment Schedule</h4>
                <div className="mt-4 space-y-2">
                  {calc.yearlyData.map((d) => (
                    <div key={d.year} className="flex items-center gap-3">
                      <span className="w-8 text-xs font-medium text-forest-400">Y{d.year}</span>
                      <div className="relative flex h-7 flex-1 overflow-hidden rounded-md bg-cream-100">
                        <div
                          className="h-full bg-forest-500"
                          style={{ width: `${(d.principal / maxYearlyPrincipal) * 100}%` }}
                        />
                        <div
                          className="h-full bg-gold-400"
                          style={{ width: `${(d.interest / maxYearlyPrincipal) * 100}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs font-medium text-forest-500">{formatPKRShort(d.principal + d.interest)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary cards */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-forest-50 p-4">
                  <div className="flex items-center gap-2 text-forest-400">
                    <Wallet className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Down Payment</span>
                  </div>
                  <p className="mt-2 font-display text-xl font-bold text-forest-700">{formatPKR(calc.downPayment)}</p>
                </div>
                <div className="rounded-xl bg-forest-50 p-4">
                  <div className="flex items-center gap-2 text-forest-400">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Monthly</span>
                  </div>
                  <p className="mt-2 font-display text-xl font-bold text-forest-700">{formatPKR(calc.monthlyInstallment)}</p>
                </div>
                <div className="rounded-xl bg-gold-50 p-4">
                  <div className="flex items-center gap-2 text-gold-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Payable</span>
                  </div>
                  <p className="mt-2 font-display text-xl font-bold text-forest-700">{formatPKR(calc.totalPayable)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
