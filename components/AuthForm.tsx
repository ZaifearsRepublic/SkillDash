'use client';
import React from 'react';

interface AuthFormProps {
  isSignUp: boolean;
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string;
  message: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  isSignUp,
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  error,
  message
}) => {
  const inputClass = "w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors";
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignUp && (
        <>
          <input
            type="text"
            name="name"
            placeholder="Full Name *"
            value={formData.name}
            onChange={handleInputChange}
            className={inputClass}
            required
            minLength={2}
            maxLength={50}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className={inputClass}
              pattern="[0-9+\-\s]+"
              maxLength={15}
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleInputChange}
              className={inputClass}
              min="13"
              max="100"
            />
          </div>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={inputClass}
            required
          >
            <option value="">Select Your Status *</option>
            <option value="School">School (Class 1-10)</option>
            <option value="College">College (Class 11-12)</option>
            <option value="University">University</option>
            <option value="Job">In a Job</option>
            <option value="Other">Other</option>
          </select>
        </>
      )}
      
      <input
        type="email"
        name="email"
        placeholder="Email Address *"
        value={formData.email}
        onChange={handleInputChange}
        className={inputClass}
        required
        maxLength={100}
      />
      
      <input
        type="password"
        name="password"
        placeholder="Password *"
        value={formData.password}
        onChange={handleInputChange}
        className={inputClass}
        required
        minLength={6}
        maxLength={128}
      />
      
      {isSignUp && (
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password *"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className={inputClass}
          required
          minLength={6}
          maxLength={128}
        />
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-md transition-all duration-200"
      >
        {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
      </button>
    </form>
  );
};

export default AuthForm;
