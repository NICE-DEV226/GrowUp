import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { formatSmartAmount } from '../utils/currency';

interface CurrencyTextProps {
  amount: number;
  currency: string; // Code devise (ex: "EUR", "XOF")
  style?: any;
  amountStyle?: any;
  symbolStyle?: any;
}

export const CurrencyText: React.FC<CurrencyTextProps> = ({ 
  amount, 
  currency, 
  style,
  amountStyle,
  symbolStyle 
}) => {
  // Utiliser le formatage intelligent
  const formatted = formatSmartAmount(amount, currency);
  
  return (
    <Text style={[style, amountStyle]}>
      {formatted}
    </Text>
  );
};

const styles = StyleSheet.create({
  currencySymbol: {
    fontSize: 12, // Plus petit que le montant
    fontWeight: '500',
    opacity: 0.8,
  },
});
