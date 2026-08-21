
import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import { loginUser } from "../services/geminiService";

interface LoginProps {
  onLogin: (username: string, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = usePreferences();
  const { showToast } = useToast();

  const handleSubmit = async () => {
  if (!username || !password) {
    showToast("Please fill in all fields.");
    return;
  }

  try {
    if (isSignUp) {
      // 🔥 REGISTER
      const response = await fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
       body: JSON.stringify({
         email: username,
         password: password
      })
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      showToast("Account created successfully! Please login.");
      setIsSignUp(false);
      return;
    }

    // 🔥 LOGIN
    const data = await loginUser(username, password);

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", username);

    showToast("Login successful!");
    onLogin(username, username);

  } catch (error) {
    showToast("Invalid Email or Password");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('mainTitle')}</h1>
          <p className="text-gray-400 mt-2">{!isSignUp ? t('welcomeBack') : t('createYourAccount')}</p>
        </div>
        
        <div className="space-y-4">
          <Input 
            id="email" 
            label="Email" 
            type="email" 
            placeholder="name@example.com" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          <Input 
            id="password" 
            label={t('password')} 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="space-y-4 pt-2">
          <Button onClick={handleSubmit} className="w-full py-3 rounded-xl">
            {isSignUp ? t('createAccount') : t('login')}
          </Button>
        </div>
        
        <div className="text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
