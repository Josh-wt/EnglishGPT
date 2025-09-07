import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../ui/LoadingSpinner';

const TransactionHistory = ({ transactions, transactionsLoading, formatTransactionAmount }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
      
      {transactionsLoading ? (
        <div className="text-center py-8">
          <LoadingSpinner message="Loading transactions..." size="small" />
        </div>
      ) : transactions && transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <motion.div 
              key={transaction.id || index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div>
                <h3 className="font-semibold text-gray-900">{transaction.description || 'Subscription'}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(transaction.created_at || transaction.timestamp).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">${formatTransactionAmount(transaction.amount)}</p>
                <p className="text-xs text-gray-500 capitalize">{transaction.status || 'completed'}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💳</div>
          <p className="text-gray-600">No transactions yet</p>
          <p className="text-sm text-gray-500 mt-2">Transaction history will be available with the new payment system</p>
        </div>
      )}
    </motion.div>
  );
};

export default TransactionHistory;
