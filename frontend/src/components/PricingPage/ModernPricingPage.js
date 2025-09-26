import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckIcon, XMarkIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon, CreditCardIcon, ShieldCheckIcon, TrophyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import paymentService from '../../services/paymentService';

const ModernPricingPage = ({ user, onBack, darkMode }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  // Pricing plans configuration
  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Try out our AI-powered English learning platform',
      price: 0,
      currency: 'USD',
      badge: null,
      features: [
        '3 essay evaluations to get started',
        'Basic AI feedback',
        'Grammar and spelling check',
        'Access to question bank'
      ],
      limitations: [
        'Limited to 3 evaluations total',
        'Basic feedback only'
      ],
      ctaText: 'Current Plan',
      ctaVariant: 'outline',
      popular: false,
      dodoProductId: null
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      description: 'Everything you need for mastering English writing',
      price: 4.99,
      currency: 'USD',
      badge: 'Best Value',
      features: [
        'Unlimited essay evaluations',
        'Advanced AI feedback with detailed analysis',
        'Grammar, spelling, style & tone analysis',
        'Personalized writing improvement suggestions',
        'Advanced progress tracking & analytics',
        'Access to complete question bank',
        'Priority email support',
      ],
      limitations: [],
      ctaText: 'Get Lifetime Access',
      ctaVariant: 'default',
      popular: true,
      dodoProductId: 'pdt_76jQTmk8aelYgmHpqsv1i'
    }
  ];

  // Handle plan selection
  const handlePlanSelect = async (plan) => {
    if (!user?.id) {
      toast.error('Please sign in to purchase a plan');
      return;
    }

    if (plan.id === 'free') {
      toast.success('You are already on the free plan!');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      // Prepare customer data
      const customerData = {
        name: user.user_metadata?.full_name || user.email,
        email: user.email,
        phone_number: user.user_metadata?.phone || null
      };

      // Prepare checkout session data for one-time purchase
      const checkoutData = {
        customer: customerData,
        // billing_address is optional - Dodo will collect it during checkout
        product_cart: [{
          product_id: plan.dodoProductId,
          quantity: 1
        }],
        billing_currency: 'USD',
        return_url: `${window.location.origin}/payment-success`,
        show_saved_payment_methods: true,
        allowed_payment_method_types: ['credit', 'debit'],
        metadata: {
          user_id: user.id,
          plan_type: plan.id,
          payment_type: 'lifetime',
          source: 'pricing_page'
        }
      };

      if (appliedDiscount) {
        checkoutData.discount_code = appliedDiscount.code;
      }

      // Create checkout session using payment service
      const checkout = await paymentService.createPayment(checkoutData);
      
      // Redirect to Dodo Payments checkout
      if (checkout.checkout_url) {
        window.location.href = checkout.checkout_url;
      } else {
        toast.success('Checkout session created successfully!');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  // Handle discount code application
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    console.debug('[PRICING_DEBUG] Validating discount code:', discountCode);

    try {
      // Validate discount code with real API
      const discountResponse = await fetch(`/api/payments/discounts/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: discountCode.toUpperCase().trim(),
          plan_type: 'lifetime' 
        }),
      });

      if (discountResponse.ok) {
        const discount = await discountResponse.json();
        console.debug('[PRICING_DEBUG] Discount validation successful:', discount);
        
        setAppliedDiscount({
          code: discount.code,
          amount: discount.amount / 100, // Convert basis points to percentage  
          type: discount.type,
          id: discount.discount_id
        });
        
        toast.success(`Discount code "${discount.code}" applied! ${discount.amount / 100}% off`);
      } else {
        const errorData = await discountResponse.json().catch(() => ({}));
        console.error('[PRICING_ERROR] Discount validation failed:', errorData);
        toast.error(errorData.detail || 'Invalid or expired discount code');
      }
    } catch (error) {
      console.error('[PRICING_ERROR] Discount validation error:', error);
      toast.error('Failed to validate discount code. Please try again.');
    }
  };

  // Calculate discounted price
  const getDiscountedPrice = (originalPrice) => {
    if (!appliedDiscount || originalPrice === 0) return originalPrice;
    
    if (appliedDiscount.type === 'percentage') {
      return originalPrice * (1 - appliedDiscount.amount / 100);
    }
    
    return Math.max(0, originalPrice - appliedDiscount.amount);
  };

  // Format price display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price % 1 === 0 ? 0 : 2
    }).format(price);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Choose Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Learning Plan</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Unlock the power of AI-driven English learning. Get personalized feedback, track your progress, and achieve your writing goals with lifetime access.
            </p>

            {/* Discount Code Section */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button onClick={handleApplyDiscount} variant="outline">
                  Apply
                </Button>
              </div>
              {appliedDiscount && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckIcon className="w-4 h-4" />
                  Discount "{appliedDiscount.code}" applied ({appliedDiscount.amount}% off)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const currentPrice = plan.price;
            const discountedPrice = getDiscountedPrice(currentPrice);
            const hasDiscount = appliedDiscount && currentPrice !== discountedPrice;

            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 scale-105 shadow-2xl' 
                    : 'hover:scale-105'
                } ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant={plan.popular ? "default" : "secondary"} className="px-4 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-center">
                      {hasDiscount && (
                        <span className="text-2xl text-gray-400 line-through mr-2">
                          {formatPrice(currentPrice)}
                        </span>
                      )}
                      <span className="text-4xl font-bold">
                        {formatPrice(discountedPrice)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {plan.id !== 'free' && 'lifetime access'}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <XMarkIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full h-12 text-base font-semibold"
                    variant={plan.ctaVariant}
                    onClick={() => handlePlanSelect(plan)}
                    disabled={loading && selectedPlan === plan.id}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {plan.ctaText}
                        {plan.id !== 'free' && <ArrowRightIcon className="w-4 h-4" />}
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8">Why Choose EnglishGPT?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Secure & Private</h4>
              <p className="text-gray-600 dark:text-gray-400">Your data is encrypted and never shared with third parties</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <TrophyIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Proven Results</h4>
              <p className="text-gray-600 dark:text-gray-400">95% of users improve their writing within 30 days</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <SparklesIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">AI-Powered</h4>
              <p className="text-gray-600 dark:text-gray-400">Advanced machine learning provides personalized feedback</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "What does lifetime access mean?",
                answer: "Lifetime access means you pay once and get unlimited access to all features forever. No recurring charges, no expiration date."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee. If you're not satisfied with your purchase, contact us for a full refund."
              },
              {
                question: "How does the AI feedback work?",
                answer: "Our AI analyzes your writing for grammar, style, coherence, and provides specific suggestions for improvement based on advanced language models."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use enterprise-grade encryption and never share your personal data or writing samples with third parties."
              }
            ].map((faq, index) => (
              <Card key={index} className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Button variant="outline" onClick={onBack} className="px-8">
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModernPricingPage;
