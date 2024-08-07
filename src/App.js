import React, { useState, useEffect } from 'react';
import './App.css';
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { Slider } from "./components/ui/slider"
import { Switch } from "./components/ui/switch"
import { Card, CardHeader, CardContent, CardTitle } from "./components/ui/card"

const TradingPositionCalculator = () => {
  const [accountBalance, setAccountBalance] = useState(localStorage.getItem('accountBalance') || '');
  const [maxRiskPercentage, setMaxRiskPercentage] = useState(parseFloat(localStorage.getItem('maxRiskPercentage')) || 0.125);
  const [selectedIndex, setSelectedIndex] = useState(localStorage.getItem('selectedIndex') || 'ES');
  const [isMicro, setIsMicro] = useState(localStorage.getItem('isMicro') === 'true');
  const [entry, setEntry] = useState(localStorage.getItem('entry') || '');
  const [stopLoss, setStopLoss] = useState(localStorage.getItem('stopLoss') || '');
  const [takeProfit, setTakeProfit] = useState(localStorage.getItem('takeProfit') || '');

  useEffect(() => {
    localStorage.setItem('accountBalance', accountBalance);
    localStorage.setItem('maxRiskPercentage', maxRiskPercentage);
    localStorage.setItem('selectedIndex', selectedIndex);
    localStorage.setItem('isMicro', isMicro);
    localStorage.setItem('entry', entry);
    localStorage.setItem('stopLoss', stopLoss);
    localStorage.setItem('takeProfit', takeProfit);
  }, [accountBalance, maxRiskPercentage, selectedIndex, isMicro, entry, stopLoss, takeProfit]);

  const calculateResults = () => {
    if (!accountBalance || !entry || !stopLoss) return null;

    const balance = parseFloat(accountBalance);
    const entryPrice = parseFloat(entry);
    const stopLossPrice = parseFloat(stopLoss);
    const takeProfitPrice = takeProfit ? parseFloat(takeProfit) : null;

    const pointValue = selectedIndex === 'ES' ? (isMicro ? 5 : 50) : (isMicro ? 2 : 20);
    const riskPerPoint = Math.abs(entryPrice - stopLossPrice) * pointValue;
    const maxRiskAmount = balance * (maxRiskPercentage / 100);

    let maxContracts = Math.floor(maxRiskAmount / riskPerPoint);
    maxContracts = Math.max(maxContracts, 1);

    const actualRiskAmount = riskPerPoint * maxContracts;

    if (actualRiskAmount > maxRiskAmount && maxContracts === 1) {
      return { maxContracts: "Too much risk", riskAmount: actualRiskAmount.toFixed(2), rr: null };
    }

    const rr = takeProfitPrice
      ? ((Math.abs(takeProfitPrice - entryPrice) * pointValue * maxContracts) / actualRiskAmount).toFixed(2)
      : null;

    return { maxContracts, riskAmount: actualRiskAmount.toFixed(2), rr };
  };

  const results = calculateResults();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
        <Card className="flex-1 mb-4 md:mb-0">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="accountBalance">Account Balance ($)</Label>
              <Input
                id="accountBalance"
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                placeholder="Enter account balance"
              />
            </div>
            <div className="mb-4">
              <Label>Max Risk (%): {maxRiskPercentage.toFixed(3)}%</Label>
              <Slider
                value={[maxRiskPercentage]}
                onValueChange={(value) => setMaxRiskPercentage(value[0])}
                min={0.125}
                max={5}
                step={0.125}
                className="mt-2"
              />
            </div>
            <div className="mb-4">
              <Label>Select Index</Label>
              <RadioGroup value={selectedIndex} onValueChange={setSelectedIndex} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ES" id="ES" />
                  <Label htmlFor="ES">$ES</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NQ" id="NQ" />
                  <Label htmlFor="NQ">$NQ</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="micro-mode"
                checked={isMicro}
                onCheckedChange={setIsMicro}
                className="bg-gray-200 data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor="micro-mode">Micro Contracts</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Trade Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="entry">Entry</Label>
              <Input
                id="entry"
                type="number"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Enter entry price"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="Enter stop loss price"
              />
            </div>
            <div>
              <Label htmlFor="takeProfit">Take Profit (Optional)</Label>
              <Input
                id="takeProfit"
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="Enter take profit price"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full md:w-2/3 mx-auto">
        <CardHeader>
          <CardTitle>Calculation Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results ? (
            <>
              <p>Max Contracts: {results.maxContracts}</p>
              <p>Risk Amount: ${results.riskAmount}</p>
              {results.rr && <p>Risk/Reward Ratio: {results.rr}</p>}
            </>
          ) : (
            <p>Please fill in the required fields to see results.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingPositionCalculator;