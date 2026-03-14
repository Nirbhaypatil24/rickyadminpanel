import React, { useState, useEffect, useRef } from 'react';
import { Car, User, Phone, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { 
  simpleHash, 
  generateSecureOtp, 
  validatePassword as validatePasswordStrength,
  isPhoneRegistered,
  getRegisteredAccounts,
  saveRegisteredAccounts
} from '../../utils/auth';

const Register = ({ onRegisterSuccess, onBackToLogin }) => {
  const [step, setStep] = useState(1); // 1: Enter details, 2: Verify OTP
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({ isValid: true, message: '' });
  const timerRef = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Validate password strength on change
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(validatePasswordStrength(formData.password));
    } else {
      setPasswordStrength({ isValid: true, message: '' });
    }
  }, [formData.password]);

  const validatePhoneNumber = (phone) => {
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.length === 10;
  };

  const startResendTimer = () => {
    setResendTimer(60);
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form data
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Check if phone number is already registered
    if (isPhoneRegistered(formData.phoneNumber)) {
      setError('This phone number is already registered. Please use a different number or sign in.');
      return;
    }

    // Validate password strength
    if (!passwordStrength.isValid) {
      setError(passwordStrength.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Simulate sending OTP (in production, this would call a real SMS API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newOtp = generateSecureOtp();
      setGeneratedOtp(newOtp);
      
      // In production, OTP would be sent via SMS and not logged
      // Demo mode: log OTP to console for testing purposes only
      if (process.env.NODE_ENV === 'development') {
        console.log('Demo OTP:', newOtp);
      }
      
      setOtpSent(true);
      setStep(2);
      startResendTimer();
      setSuccess(`OTP sent to ${formData.phoneNumber}. Please check your phone.`);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newOtp = generateSecureOtp();
      setGeneratedOtp(newOtp);
      
      // In production, OTP would be sent via SMS and not logged
      if (process.env.NODE_ENV === 'development') {
        console.log('Demo OTP:', newOtp);
      }
      startResendTimer();
      setSuccess(`New OTP sent to ${formData.phoneNumber}. Please check your phone.`);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (otp === generatedOtp) {
        // Store the new account with hashed password
        // Note: In production, use server-side storage with proper encryption
        const existingAccounts = getRegisteredAccounts();
        existingAccounts.push({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          passwordHash: simpleHash(formData.password),
          createdAt: new Date().toISOString(),
          verified: true
        });
        saveRegisteredAccounts(existingAccounts);

        setSuccess('Account created successfully! Redirecting to login...');
        
        setTimeout(() => {
          onRegisterSuccess();
        }, 1500);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Only allow digits and limit to 10
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setError('');
  };

  const handleOtpChange = (e) => {
    // Only allow digits and limit to 6
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 text-white p-4 rounded-2xl mb-4">
            <Car className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Ricky</h1>
          <p className="text-sm text-gray-500 mt-1">Autometer Admin Panel</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          {step === 1 ? 'Create New Account' : 'Verify Phone Number'}
        </h2>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">OTP will be sent to this number for verification</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min. 6 characters)"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    formData.password && !passwordStrength.isValid ? 'border-orange-400' : 'border-gray-300'
                  }`}
                />
              </div>
              {formData.password && !passwordStrength.isValid && (
                <p className="text-xs text-orange-600 mt-1">{passwordStrength.message}</p>
              )}
              {formData.password && passwordStrength.isValid && (
                <p className="text-xs text-green-600 mt-1">✓ Password meets requirements</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 text-sm"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Enter the 6-digit OTP sent to
              </p>
              <p className="font-semibold text-gray-800">{formData.phoneNumber}</p>
            </div>

            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                className="w-full text-center text-2xl tracking-widest py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                maxLength={6}
              />
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend OTP in <span className="font-semibold">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 text-sm"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            {/* Back to Step 1 */}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
                setSuccess('');
              }}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 py-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to edit details
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
