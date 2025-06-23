import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, X } from 'lucide-react';

interface PinProtectionProps {
  onVerify: (pin: string) => void;
  onClose: () => void;
}

const PinProtection: React.FC<PinProtectionProps> = ({ onVerify, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    onVerify(pin);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-center mb-6">
          <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
            <Shield size={24} />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
          Enter PIN
        </h2>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
          Please enter your 4-digit PIN to access the admin dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2">
            {[...Array(4)].map((_, i) => (
              <input
                key={i}
                type="password"
                maxLength={1}
                value={pin[i] || ''}
                onChange={(e) => {
                  const newPin = pin.split('');
                  newPin[i] = e.target.value;
                  setPin(newPin.join(''));
                  if (e.target.value && i < 3) {
                    const nextInput = document.querySelector(`input[name="pin-${i + 1}"]`);
                    if (nextInput) {
                      (nextInput as HTMLInputElement).focus();
                    }
                  }
                }}
                name={`pin-${i}`}
                className="w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Verify PIN
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PinProtection;