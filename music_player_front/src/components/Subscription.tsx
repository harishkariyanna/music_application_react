import { useState, useEffect } from 'react';
import axios from 'axios';
import './Subscription.css';

interface SubscriptionProps {
  onUpgrade: () => void;
}

export default function Subscription({ onUpgrade }: SubscriptionProps) {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [currentPlan, setCurrentPlan] = useState<number>(1); // Default to Free plan
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [cardType, setCardType] = useState<string>('');
  const [errors, setErrors] = useState({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });

  const detectCardType = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    if (/^35/.test(cleaned)) return 'JCB';
    if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'Diners Club';
    return '';
  };

  const validateCardNumber = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (!cleaned) return 'Card number is required';
    if (!/^\d+$/.test(cleaned)) return 'Card number must contain only digits';
    const type = detectCardType(number);
    if (type === 'American Express' && cleaned.length !== 15) return 'Amex card must be 15 digits';
    if (type && type !== 'American Express' && cleaned.length !== 16) return 'Card number must be 16 digits';
    if (!type && (cleaned.length < 13 || cleaned.length > 19)) return 'Invalid card number length';
    return '';
  };

  const validateExpiry = (expiry: string): string => {
    if (!expiry) return 'Expiry date is required';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Format must be MM/YY';
    const [month, year] = expiry.split('/').map(Number);
    if (month < 1 || month > 12) return 'Invalid month';
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return 'Card has expired';
    return '';
  };

  const validateCVV = (cvv: string): string => {
    if (!cvv) return 'CVV is required';
    if (!/^\d+$/.test(cvv)) return 'CVV must contain only digits';
    if (cardType === 'American Express' && cvv.length !== 4) return 'Amex CVV must be 4 digits';
    if (cardType !== 'American Express' && cvv.length !== 3) return 'CVV must be 3 digits';
    return '';
  };

  useEffect(() => {
    const savedPlanId = localStorage.getItem('currentPlanId');
    if (savedPlanId) {
      setCurrentPlan(parseInt(savedPlanId));
    }
  }, []);

  const plans = [
    {
      id: 1,
      name: 'Free',
      price: 0,
      features: ['Basic music streaming', 'Only 3 skips per day', 'Ads included', 'Cannot seek/drag songs', '1 device only', 'Standard quality (128kbps)'],
      current: currentPlan === 1
    },
    {
      id: 2,
      name: 'Premium',
      price: 149,
      features: ['Ad-free music', 'Unlimited skips', 'Seek/drag anywhere in songs', 'YouTube Music access', 'High quality audio (320kbps)', 'Offline downloads', 'Create unlimited playlists'],
      popular: true,
      current: currentPlan === 2
    }
  ];

  const handleUpgrade = (planId: number) => {
    if (planId === 1) return; // Free plan, no payment needed
    setSelectedPlan(planId);
    setPaymentModalOpen(true);
  };

  const handlePayment = async () => {
    const cardError = validateCardNumber(paymentData.cardNumber);
    const expiryError = validateExpiry(paymentData.expiryDate);
    const cvvError = validateCVV(paymentData.cvv);
    const nameError = !paymentData.cardholderName ? 'Cardholder name is required' : '';

    setErrors({ cardNumber: cardError, expiryDate: expiryError, cvv: cvvError, cardholderName: nameError });

    if (cardError || expiryError || cvvError || nameError) return;

    setPaymentModalOpen(false);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://localhost:7192/api/Users/subscription/${selectedPlan}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (selectedPlan) {
        setCurrentPlan(selectedPlan);
        const planName = plans.find(p => p.id === selectedPlan)?.name;
        localStorage.setItem('subscriptionPlan', planName || 'Free');
        localStorage.setItem('currentPlanId', selectedPlan.toString());
      }
      alert('Payment successful! Subscription upgraded. Please logout and login again to apply changes.');
      setSelectedPlan(null);
      setPaymentData({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
      onUpgrade();
    } catch (error: any) {
      console.error('Subscription upgrade failed:', error);
      alert(error.response?.data || 'Failed to upgrade subscription. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setPaymentModalOpen(false);
    setSelectedPlan(null);
    setPaymentData({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
    setErrors({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
    setCardType('');
  };

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h1 className="subscription-title">Choose Your Plan</h1>
        <p className="subscription-subtitle">Upgrade to Premium for the best music experience</p>
      </div>
      
      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.current ? 'current' : ''}`}>
            {plan.popular && (
              <div className="popular-badge">
                ⭐ Most Popular
              </div>
            )}
              
            <h2 className="plan-name">{plan.name}</h2>
            <p className="plan-price">₹{plan.price}</p>
            <p className="plan-period">{plan.price === 0 ? 'Forever' : 'per month'}</p>
            
            <div className="plan-features">
              {plan.features.map((feature, index) => (
                <div key={index} className="plan-feature">
                  <span className="feature-icon">✔</span>
                  <span className="feature-text">{feature}</span>
                </div>
              ))}
            </div>
                
            <button
              className={`plan-button ${plan.current ? 'current' : plan.popular ? 'popular' : 'primary'}`}
              disabled={plan.current || selectedPlan === plan.id}
              onClick={() => handleUpgrade(plan.id)}
            >
              {plan.current ? '✓ Current Plan' : selectedPlan === plan.id ? 'Processing...' : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
      
      {paymentModalOpen && (
        <div className="payment-modal-overlay" onClick={handleCloseModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="payment-modal-title">
              💳 Payment Details
            </h2>
            
            <p className="payment-modal-subtitle">
              {selectedPlan && `Upgrading to ${plans.find(p => p.id === selectedPlan)?.name} Plan - ₹${plans.find(p => p.id === selectedPlan)?.price}/month`}
            </p>
            
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                className="payment-input"
                type="text"
                placeholder="Card Number (1234 5678 9012 3456)"
                maxLength={19}
                value={paymentData.cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d\s]/g, '');
                  setPaymentData({...paymentData, cardNumber: value});
                  setCardType(detectCardType(value));
                  if (errors.cardNumber) setErrors({...errors, cardNumber: validateCardNumber(value)});
                }}
              />
              {cardType && (
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#1db954',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {cardType}
                </span>
              )}
              {errors.cardNumber && <div style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.cardNumber}</div>}
            </div>
            
            <div className="payment-input-row" style={{ marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <input
                  className="payment-input"
                  type="text"
                  placeholder="Expiry Date (MM/YY)"
                  maxLength={5}
                  value={paymentData.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^\d]/g, '');
                    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    setPaymentData({...paymentData, expiryDate: value});
                    if (errors.expiryDate) setErrors({...errors, expiryDate: validateExpiry(value)});
                  }}
                />
                {errors.expiryDate && <div style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.expiryDate}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  className="payment-input"
                  type="text"
                  placeholder="CVV (123)"
                  maxLength={4}
                  value={paymentData.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    setPaymentData({...paymentData, cvv: value});
                    if (errors.cvv) setErrors({...errors, cvv: validateCVV(value)});
                  }}
                />
                {errors.cvv && <div style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.cvv}</div>}
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <input
                className="payment-input"
                type="text"
                placeholder="Cardholder Name"
                value={paymentData.cardholderName}
                onChange={(e) => {
                  setPaymentData({...paymentData, cardholderName: e.target.value});
                  if (errors.cardholderName && e.target.value) setErrors({...errors, cardholderName: ''});
                }}
              />
              {errors.cardholderName && <div style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.cardholderName}</div>}
            </div>
            
            <div className="payment-actions">
              <button className="payment-button cancel" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="payment-button confirm" onClick={handlePayment}>
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}