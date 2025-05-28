/**
 * @file PasswordSecurityApp.js
 * @description Password security suite component featuring analysis, generation, and educational tools
 * @author Hardin Irfan <hardinmail05@gmail.com>
 * @copyright Copyright (c) 2025 Hardin Irfan
 * @license MIT
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Turtle, Eye, EyeOff, Zap, Download, Moon, Sun, 
  AlertTriangle, CheckCircle, Info, Copy, RefreshCw, Settings, 
  BarChart3, Clock, Target, Cpu, Database, Book, 
  ChevronUp, ChevronDown, ArrowUpDown
} from 'lucide-react';

// Common password prefixes and suffixes
const COMMON_PREFIXES = ['admin', 'user', 'test', 'password', 'pass', 'welcome', 'abc', 'qwerty', 'letme', 'hello', 'temp', 'demo'];
const COMMON_SUFFIXES = ['123', '1234', '12345', '123456', '2023', '2024', '2022', '2021', '!', '!!', '@', '#', '1', '01', '0'];

const PasswordSecurityApp = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('analyzer');
  const [generatorSettings, setGeneratorSettings] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    pronounceable: false
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [bulkPasswords, setBulkPasswords] = useState('');
  const [bulkResults, setBulkResults] = useState([]);
  const [copied, setCopied] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });

  // Keep a smaller list of the most common passwords
  const commonPasswords = useMemo(() => [
    '123456', 'password', '123456789', '12345678', '12345', '1234567',
    'password123', 'admin', 'welcome', 'qwerty', 'abc123', 'Password1',
    'letmein', 'monkey', 'dragon', 'sunshine', 'princess', 'football',
    'charlie', 'shadow', 'master', 'jordan', 'superman', 'harley',
    'qwerty123', 'password1', 'admin123', 'test123', 'common123'
  ], []);

  // Keyboard patterns
  const keyboardPatterns = useMemo(() => [
    'qwerty', 'asdf', 'zxcv', '1234', 'abcd', 'qwer', 'asdfgh',
    '123456', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '098765'
  ], []);

  // Add common password patterns
  const commonPatterns = useMemo(() => [
    /^1q2w3e/, /^qwe\d+/, /^qwerty\d+/, /^admin\d+/, /^test\d+/, /^user\d+/,
    /^pass\d+/, /^password\d+/, /^welcome\d+/, /^qaz\w+/, /^developer\d*/,
    /^github\d*/, /^git\d+/, /^root\d*/, /^temp\d*/, /^demo\d*/,
    /^123\w+/, /^\w+123$/, /^\w+1234$/, /^[a-z]+\d{1,4}$/i
  ], []);

  // Check if a password is likely to be common
  const isLikelyCommonPassword = useCallback((pwd) => {
    if (!pwd) return false;
    
    const lowercasePwd = pwd.toLowerCase();
    
    // Direct match in common password list
    if (commonPasswords.includes(lowercasePwd)) return true;
    
    // Check for common prefixes and suffixes combinations (exact matches only)
    for (const prefix of COMMON_PREFIXES) {
      for (const suffix of COMMON_SUFFIXES) {
        if (lowercasePwd === prefix + suffix) return true;
      }
    }
    
    // Check for simple variations (e.g., capitalized first letter)
    for (const common of commonPasswords) {
      if (common.length > 4 && (
          lowercasePwd === common || 
          lowercasePwd === common + '!' ||
          lowercasePwd === common.charAt(0).toUpperCase() + common.slice(1)
      )) {
        return true;
      }
    }
    
    // Check for keyboard patterns (only if they make up a significant portion of the password)
    for (const pattern of keyboardPatterns) {
      if (pattern.length >= 4 && lowercasePwd.includes(pattern) && pattern.length >= lowercasePwd.length / 2) {
        return true;
      }
    }
    
    // Check for sequential patterns (only if they make up a significant portion of the password)
    const sequences = ['0123', '1234', '2345', '3456', '4567', '5678', '6789', 'abcd', 'wxyz'];
    for (const seq of sequences) {
      if (lowercasePwd.includes(seq) && seq.length >= lowercasePwd.length / 2) {
        return true;
      }
    }
    
    // Check for repeated characters (3 or more) that make up most of the password
    const repeatingMatch = lowercasePwd.match(/(.)\1{2,}/g);
    if (repeatingMatch && repeatingMatch[0].length >= lowercasePwd.length / 2) {
      return true;
    }
    
    // Check for years as passwords
    if (/^(19|20)\d{2}$/.test(lowercasePwd)) return true;
    
    // Check for simple words with number substitutions (l33t speak)
    if (/^[a@][d][m][i1][n]|^[p][a@][s$][s$][w][0o][r][d]|^[t][e3][s$][t]/.test(lowercasePwd)) return true;
    
    // Check for single character type (but only for shorter passwords)
    if (pwd.length < 8) {
      if (/^[a-z]+$/i.test(pwd) || /^\d+$/.test(pwd)) return true;
    }
    
    // Check for common words with numbers (exact matches only)
    const commonWords = ['password', 'admin', 'user', 'login', 'welcome', 'manager', 'secure', 'security', 
                       'test', 'server', 'database', 'account', 'system', 'network', 'default', 'guest'];
    
    if (/^[a-z]+[0-9]{1,4}$/i.test(lowercasePwd)) {
      const wordPart = lowercasePwd.replace(/[0-9]+$/, '');
      if (commonWords.some(word => wordPart === word)) {
        return true;
      }
    }
    
    return false;
  }, [commonPasswords, keyboardPatterns]);

  // Calculate password entropy
  const calculateEntropy = useCallback((pwd) => {
    if (!pwd) return 0;
    
    let charset = 0;
    if (/[a-z]/.test(pwd)) charset += 26;
    if (/[A-Z]/.test(pwd)) charset += 26;
    if (/[0-9]/.test(pwd)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) charset += 33;
    
    return Math.log2(Math.pow(charset, pwd.length));
  }, []);

    // Calculate time to crack
    const calculateTimeToCrack = useCallback((entropy, isCommon = false, score = 0, pwd = '') => {
      const guessesPerSecond = {
        online: 1000,          // Online attack
        offline: 1000000000,   // Offline attack (1 billion/sec)
        optimized: 100000000000 // Optimized cracking rig (100 billion/sec)
      };
      
      // If it's a common password, adjust the time to crack to be much faster
      if (isCommon) {
        return {
          online: 0.001,        // Almost instant for online attacks
          offline: 0.0001,      // Instant for offline attacks
          optimized: 0.00001    // Instant for optimized rigs
        };
      }
      
      // Adjust time to crack based on password strength score
      // For weak passwords, theoretical entropy is misleading
      let adjustmentFactor = 1;
      
      if (score < 20) {
        // Very weak passwords (0-19 score)
        adjustmentFactor = 0.00000001; // 100 million times faster than theoretical
      } else if (score < 40) {
        // Weak passwords (20-39 score)
        adjustmentFactor = 0.0000001; // 10 million times faster than theoretical
        
        // Special case for word+number patterns which are much weaker than their entropy suggests
        if (pwd && /^[a-z]{3,}[0-9]{1,6}$/i.test(pwd)) {
          adjustmentFactor = 0.000000001; // 1 billion times faster
        }
        
        // Special case for non-English word+number patterns
        if (pwd && /^[\p{L}\p{M}]{3,}[0-9]{1,6}$/u.test(pwd)) {
          adjustmentFactor = 0.000000001; // 1 billion times faster
        }
      } else if (score < 60) {
        // Moderate passwords (40-59 score)
        adjustmentFactor = 0.0001; // More realistic for moderate passwords (10,000x faster than theoretical)
      } else if (score < 80) {
        // Strong passwords (60-79 score)
        adjustmentFactor = 0.001; // 1,000x faster than theoretical
      } else {
        // Very strong passwords (80-100 score)
        adjustmentFactor = 0.01; // Still apply a 100x adjustment factor
      }
      
      // Apply additional adjustment for common patterns
      if (pwd) {
        // Further reduce time for passwords with common formats
        if (/^[A-Z][a-z]+\d{1,4}$/i.test(pwd)) {
          adjustmentFactor *= 0.1; // 10x faster for capitalized word + numbers
        }
        
        // Names or dictionary words with numbers
        if (/^[A-Z][a-z]{2,}[0-9]{1,4}$/i.test(pwd)) {
          adjustmentFactor *= 0.01; // 100x faster for likely name/word + numbers
        }
      }
      
      // Cap entropy for calculation purposes to avoid unrealistic times
      const effectiveEntropy = Math.min(entropy, score < 40 ? 50 : (score < 60 ? 70 : (score < 80 ? 90 : 120)));
      
      const totalCombinations = Math.pow(2, effectiveEntropy - 1);
      
      return {
        online: totalCombinations / guessesPerSecond.online * adjustmentFactor,
        offline: totalCombinations / guessesPerSecond.offline * adjustmentFactor,
        optimized: totalCombinations / guessesPerSecond.optimized * adjustmentFactor
      };
    }, []);

    // Format time duration
    const formatTime = useCallback((seconds) => {
      if (isNaN(seconds) || !isFinite(seconds)) return "Virtually forever";
      
      if (seconds < 0.001) return "Instantly";
      if (seconds < 1) return "Less than a second";
      if (seconds < 60) return `${Math.round(seconds)} seconds`;
      if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
      if (seconds < 604800) return `${Math.round(seconds / 86400)} days`; // 1 week
      if (seconds < 2629746) return `${Math.round(seconds / 604800)} weeks`; // ~1 month
      if (seconds < 31556952) return `${Math.round(seconds / 2629746)} months`; // ~1 year
      
      const years = seconds / 31556952;
      
      if (years < 10) return `${Math.round(years)} years`;
      if (years < 100) return `${Math.round(years / 10) * 10} years`;
      if (years < 1000) return `${Math.round(years / 100) * 100} years`;
      if (years < 10000) return `${Math.round(years / 1000)}K years`;
      if (years < 1000000) return `${Math.round(years / 10000) * 10}K years`;
      if (years < 1000000000) return `${Math.round(years / 1000000)}M years`;
      
      return "Billions of years";
    }, []);

    // Advanced password assessment function
    const assessPasswordStrength = useCallback((pwd) => {
      if (!pwd) return { score: 0, issues: [], patterns: [] };
      
      let score = 0;
      const issues = [];
      const patterns = [];
      
      // Basic checks
      const length = pwd.length;
      const hasUpper = /[A-Z]/.test(pwd);
      const hasLower = /[a-z]/.test(pwd);
      const hasNumber = /[0-9]/.test(pwd);
      const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
      const entropy = calculateEntropy(pwd);
      
      // Check if it's likely a common password
      const isCommon = isLikelyCommonPassword(pwd);
      if (isCommon) {
        issues.push('Common password or pattern detected');
        patterns.push('Common password pattern');
        score -= 40;
      }
      
      // Check for keyboard patterns
    keyboardPatterns.forEach(pattern => {
      if (pwd.toLowerCase().includes(pattern)) {
        patterns.push(`Keyboard pattern: ${pattern}`);
        score -= 15;
      }
    });
    
    // Check for repeating characters
    const repeatingChars = pwd.match(/(.)\1{2,}/g);
    if (repeatingChars) {
      patterns.push(`Repeating characters: ${repeatingChars.join(', ')}`);
      score -= 15;
    }
    
    // Check for common patterns
    // eslint-disable-next-line no-useless-escape
    commonPatterns.forEach(pattern => {
      if (pattern.test(pwd)) {
        patterns.push(`Common pattern: ${pattern.toString().replace(/^\/\^?|\$?\/$|\\d\{\d,\d\}/g, '').replace(/\\d/g, 'digits').replace(/\\w/g, 'letters')}`);
        score -= 15;
      }
    });
    
    // Check for simple substitutions (l33t speak)
    const hasL33tSpeak = /[a@][s$][d][f][1!]|[p][a@][s$][s$][w][0o][r][d]|[a@][d][m][1!][n]|[t][3e][s$][t]|[u][s$][e3][r]/.test(pwd.toLowerCase());
    if (hasL33tSpeak) {
      patterns.push('Simple character substitution (l33t speak)');
      score -= 10;
    }
    
    // Check for word + number pattern (but don't mark as common unless it's in the common list)
    const commonWords = ['password', 'admin', 'user', 'login', 'welcome', 'manager', 'secure', 'security', 
                        'test', 'server', 'database', 'account', 'system', 'network', 'default', 'guest'];
    
    // First check for standard English word + number pattern
    const wordNumberMatch = pwd.match(/^([a-z]{3,})([0-9]+)$/i);
    if (wordNumberMatch) {
      const wordPart = wordNumberMatch[1].toLowerCase();
      const numberPart = wordNumberMatch[2];
      
      if (commonWords.some(word => wordPart === word)) {
        patterns.push('Common word + number pattern');
        score -= 20;
      } else {
        // It's a word+number but not a common word
        patterns.push('Uncommon word + number pattern');
        // Give bonus points for uncommon word+number, with extra for longer number parts
        score += 10 + Math.min(5, numberPart.length); // Bonus increases with digits (max +5)
      }
    } 
    // Check for non-English word + number patterns (more general detection)
    else {
      const nonEnglishWordNumberMatch = pwd.match(/^([\p{L}\p{M}]{3,})([0-9]+)$/u);
      if (nonEnglishWordNumberMatch) {
        const wordPart = nonEnglishWordNumberMatch[1].toLowerCase();
        const numberPart = nonEnglishWordNumberMatch[2];
        
        // This regex matches any Unicode letters (from any language) followed by numbers
        if (!patterns.some(p => p.includes('word + number'))) {
          patterns.push('Word + number pattern');
          // Give bonus points for uncommon word+number combinations
          if (!commonWords.some(word => wordPart.includes(word))) {
            score += 10 + Math.min(5, numberPart.length); // Bonus increases with number of digits
          } else {
            score -= 5; // Small penalty for common word + number
          }
        }
      }
    }
    
    // Check for date patterns
    if (/^(19|20)\d{2}$/.test(pwd) || /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.](19|20)?\d{2}$/.test(pwd)) {
      patterns.push('Date pattern');
      score -= 20;
    }
    
    // Check for single character type
    if (pwd.length > 1) {
      if (/^[a-z]+$/i.test(pwd)) {
        issues.push('Only letters');
        score -= 20;
      } else if (/^\d+$/.test(pwd)) {
        issues.push('Only numbers');
        score -= 30;
      }
    }
    
    // Check for just adding a single symbol to a weak password
    if (hasSymbol && pwd.replace(/[^a-zA-Z0-9]/g, '').length > 0) {
      // Count how many symbols
      const symbolCount = pwd.replace(/[a-zA-Z0-9]/g, '').length;
      // If only one symbol and the password is otherwise simple (like word+symbol)
      if (symbolCount === 1 && /^[a-z]+[$&+,:;=?@#|'<>.^*()%!-]$/i.test(pwd)) {
        score -= 10; // Reduce the score gain from just adding a symbol to a simple word
        patterns.push('Simple word + symbol pattern');
      }
    }
    
    // Positive scoring - Length
    if (length >= 16) score += 25;
    else if (length >= 12) score += 20;
    else if (length >= 10) score += 15;
    else if (length >= 8) score += 10;
    else if (length >= 6) score += 5;
    else issues.push('Too short');
    
    // Positive scoring - Character variety
    if (hasUpper && hasLower && hasNumber && hasSymbol) score += 20;
    else if ((hasUpper || hasLower) && hasNumber && hasSymbol) score += 12;
    else if ((hasUpper || hasLower) && (hasNumber || hasSymbol)) score += 8;
    else score += 5;
    
    // Positive scoring - Entropy
    if (entropy > 80) score += 25;
    else if (entropy > 60) score += 20;
    else if (entropy > 40) score += 15;
    else if (entropy > 30) score += 10;
    else if (entropy > 20) score += 5;
    
    // Collect missing character types for feedback
    if (!hasUpper) issues.push('No uppercase');
    if (!hasLower) issues.push('No lowercase');
    if (!hasNumber) issues.push('No numbers');
    if (!hasSymbol) issues.push('No symbols');
    
    // Normalize score
    score = Math.max(0, Math.min(100, score));
    
    // Determine strength level
    let strength = 'Very Weak';
    let strengthColor = 'text-red-500';
    
    if (score >= 85) {
      strength = 'Very Strong';
      strengthColor = 'text-green-500';
    } else if (score >= 70) {
      strength = 'Strong';
      strengthColor = 'text-blue-500';
    } else if (score >= 50) {
      strength = 'Moderate';
      strengthColor = 'text-yellow-500';
    } else if (score >= 30) {
      strength = 'Weak';
      strengthColor = 'text-orange-500';
    }
    
    // For weak passwords, adjust entropy to better reflect actual security
    let adjustedEntropy = entropy;
    if (patterns.length > 0 && score < 30) {
      // Reduce effective entropy for weak passwords with patterns
      adjustedEntropy = Math.min(entropy, 40);
    }
    
    return {
      score,
      strength,
      strengthColor,
      entropy: adjustedEntropy,
      patterns,
      issues,
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol,
      length,
      isCommon,
      hasPatterns: patterns.length > 0
    };
  }, [calculateEntropy, isLikelyCommonPassword, keyboardPatterns, commonPatterns]);

  // Analyze password strength
  const analyzePassword = useCallback((pwd) => {
    if (!pwd) {
      setAnalysis(null);
      return;
    }

    const assessment = assessPasswordStrength(pwd);
    const timeToCrack = calculateTimeToCrack(assessment.entropy, assessment.isCommon, assessment.score, pwd);
    
    // Format feedback for display
    const feedback = [...assessment.issues];
    if (assessment.patterns.length > 0) {
      feedback.push(`Avoid patterns: ${assessment.patterns.join(', ')}`);
    }
    
    setAnalysis({
      ...assessment,
      timeToCrack,
      feedback,
      isCommon: assessment.isCommon
    });
  }, [assessPasswordStrength, calculateTimeToCrack]);

  // Generate password
  const generatePassword = useCallback(() => {
    const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, pronounceable } = generatorSettings;
    
    if (pronounceable) {
      // Generate pronounceable password
      const consonants = 'bcdfghjklmnpqrstvwxz';
      const vowels = 'aeiou';
      let result = '';
      
      for (let i = 0; i < Math.ceil(length / 2); i++) {
        if (i % 2 === 0) {
          result += consonants[Math.floor(Math.random() * consonants.length)];
        } else {
          result += vowels[Math.floor(Math.random() * vowels.length)];
        }
      }
      
      // Add numbers and symbols if requested
      if (includeNumbers && result.length < length) {
        result += Math.floor(Math.random() * 10);
      }
      if (includeSymbols && result.length < length) {
        result += '!@#$%'[Math.floor(Math.random() * 5)];
      }
      
      setGeneratedPassword(result.slice(0, length));
      return;
    }
    
    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }
    
    if (!charset) return;
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    
    setGeneratedPassword(result);
  }, [generatorSettings]);

  // Analyze bulk passwords
  const analyzeBulkPasswords = useCallback(() => {
    const passwords = bulkPasswords.split('\n').filter(p => p.trim());
    const results = passwords.map(pwd => {
      const assessment = assessPasswordStrength(pwd);
      
      return {
        password: pwd,
        score: assessment.score,
        strength: assessment.strength,
        entropy: Math.round(assessment.entropy * 10) / 10,
        isCommon: assessment.isCommon,
        patterns: assessment.patterns.length,
        hasIssues: assessment.patterns.length > 0 || assessment.issues.length > 0
      };
    });
    
    setBulkResults(results);
  }, [bulkPasswords, assessPasswordStrength]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // Export results
  const exportResults = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      singlePasswordAnalysis: analysis,
      bulkAnalysis: bulkResults,
      generatorSettings,
      generatedPassword
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'password-security-report.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [analysis, bulkResults, generatorSettings, generatedPassword]);

  // Sort bulk results
  const sortedBulkResults = useMemo(() => {
    if (!bulkResults.length) return [];
    
    return [...bulkResults].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [bulkResults, sortConfig]);

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  useEffect(() => {
    analyzePassword(password);
  }, [password, analyzePassword]);

  useEffect(() => {
    generatePassword();
  }, [generatorSettings, generatePassword]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} relative overflow-hidden flex flex-col`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Turtle className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-xl font-bold">HardLock Vault</h1>
                <p className="text-xs text-gray-500">Password Security Suite</p>
              </div>
            </div>  
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportResults}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-16 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'analyzer', label: 'Password Analyzer', icon: BarChart3 },
              { id: 'generator', label: 'Generator', icon: Zap },
              { id: 'bulk', label: 'Bulk Analysis', icon: Database },
              { id: 'education', label: 'Security Guide', icon: Book },
              { id: 'documentation', label: 'Documentation', icon: Info }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow">
        {activeTab === 'analyzer' && (
          <div className="space-y-8">
            {/* Password Input */}
            <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Target className="h-6 w-6 mr-2 text-blue-500" />
                Password Strength Analyzer
              </h2>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to analyze..."
                  className={`w-full p-4 pr-12 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="grid grid-cols-1 gap-8 min-h-[400px]">
              {analysis ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Strength Overview */}
                    <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className="text-xl font-semibold mb-4">Strength Overview</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Overall Score</span>
                            <span className={`font-bold ${analysis.strengthColor}`}>{analysis.score}/100</span>
                          </div>
                          <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3`}>
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                analysis.score >= 80 ? 'bg-green-500' :
                                analysis.score >= 60 ? 'bg-blue-500' :
                                analysis.score >= 40 ? 'bg-yellow-500' :
                                analysis.score >= 20 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${analysis.score}%` }}
                            ></div>
                          </div>
                          <p className={`text-sm mt-1 ${analysis.strengthColor}`}>{analysis.strength}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Length</span>
                              <span className="font-bold">{analysis.length}</span>
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Entropy</span>
                              <span className="font-bold">{Math.round(analysis.entropy * 10) / 10}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Uppercase', has: analysis.hasUpper },
                            { label: 'Lowercase', has: analysis.hasLower },
                            { label: 'Numbers', has: analysis.hasNumber },
                            { label: 'Symbols', has: analysis.hasSymbol }
                          ].map(item => (
                            <div key={item.label} className="flex items-center space-x-2">
                              {item.has ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Security Analysis */}
                    <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className="text-xl font-semibold mb-4">Security Analysis</h3>
                      
                      <div className="space-y-4">
                        {/* Common Password Check */}
                        <div className={`p-4 rounded-lg ${analysis.isCommon ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'}`}>
                          <div className="flex items-center space-x-2">
                            {analysis.isCommon ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            <span className="font-medium">
                              {analysis.isCommon ? 'Common Password Detected' : 'Not a Common Password'}
                            </span>
                          </div>
                        </div>

                        {/* Pattern Detection */}
                        {analysis.patterns.length > 0 && (
                          <div className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-yellow-700 dark:text-yellow-300">Patterns Detected</p>
                                <ul className="text-sm mt-1 space-y-1">
                                  {analysis.patterns.map((pattern, index) => (
                                    <li key={index} className="text-yellow-600 dark:text-yellow-400">• {pattern}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Time to Crack */}
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <h4 className="font-medium mb-3 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Time to Crack Estimates
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <span className="text-gray-400 w-32">Online Attack:</span>
                              <span className="font-mono">{formatTime(analysis.timeToCrack.online)}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-400 w-32">Offline Attack:</span>
                              <span className="font-mono">{formatTime(analysis.timeToCrack.offline)}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-400 w-32">Optimized Rig:</span>
                              <span className="font-mono">{formatTime(analysis.timeToCrack.optimized)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analysis.feedback.length > 0 && (
                    <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Info className="h-5 w-5 mr-2 text-blue-500" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {analysis.feedback.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-center`}>
                  <p className="text-gray-500">Enter a password to see analysis results</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'generator' && (
          <div className="space-y-8">
            {/* Generator Controls */}
            <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Zap className="h-6 w-6 mr-2 text-blue-500" />
                Password Generator
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Length: {generatorSettings.length}
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="4"
                        max="128"
                        value={generatorSettings.length}
                        onChange={(e) => setGeneratorSettings(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                        className="flex-grow"
                      />
                      <span className="text-sm font-mono w-8 text-center">{generatorSettings.length}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'includeUppercase', label: 'Uppercase Letters (A-Z)' },
                      { key: 'includeLowercase', label: 'Lowercase Letters (a-z)' },
                      { key: 'includeNumbers', label: 'Numbers (0-9)' },
                      { key: 'includeSymbols', label: 'Symbols (!@#$...)' },
                      { key: 'excludeSimilar', label: 'Exclude Similar Characters (il1Lo0O)' },
                      { key: 'pronounceable', label: 'Generate Pronounceable Password' }
                    ].map(option => (
                      <label key={option.key} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generatorSettings[option.key]}
                          onChange={(e) => setGeneratorSettings(prev => ({ ...prev, [option.key]: e.target.checked }))}
                          className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Generated Password</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={generatedPassword}
                        readOnly
                        className={`w-full p-3 pr-20 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} font-mono break-all overflow-x-auto`}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <button
                          onClick={() => copyToClipboard(generatedPassword)}
                          className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={generatePassword}
                          className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                          title="Generate new password"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {copied && (
                      <p className="text-green-500 text-sm mt-1">Copied to clipboard!</p>
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={generatePassword}
                      className={`py-3 px-6 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium transition-colors flex items-center justify-center space-x-2 min-w-[200px]`}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Generate New Password</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Password Analysis */}
            {generatedPassword && (
              <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-xl font-semibold mb-4">Generated Password Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{generatedPassword.length}</div>
                      <div className="text-sm text-gray-500">Characters</div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {Math.round(calculateEntropy(generatedPassword) * 10) / 10}
                      </div>
                      <div className="text-sm text-gray-500">Entropy (bits)</div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500 break-words">
                        {formatTime(calculateTimeToCrack(calculateEntropy(generatedPassword), false, 80).optimized)}
                      </div>
                      <div className="text-sm text-gray-500">Time to Crack</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="space-y-8">
            {/* Bulk Analysis Input */}
            <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Database className="h-6 w-6 mr-2 text-blue-500" />
                Bulk Password Analysis
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter passwords (one per line):
                  </label>
                  <textarea
                    value={bulkPasswords}
                    onChange={(e) => setBulkPasswords(e.target.value)}
                    placeholder="password123&#10;admin&#10;qwerty123&#10;MySecureP@ss!"
                    rows={8}
                    className={`w-full p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={analyzeBulkPasswords}
                    disabled={!bulkPasswords.trim()}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 min-w-[200px] justify-center ${
                      bulkPasswords.trim()
                        ? `${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                        : `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Analyze Passwords</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Results */}
            {bulkResults.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { 
                      label: 'Total Passwords', 
                      value: bulkResults.length, 
                      color: 'text-blue-500' 
                    },
                    { 
                      label: 'Strong Passwords', 
                      value: bulkResults.filter(r => r.score >= 70).length, 
                      subtext: `${Math.round((bulkResults.filter(r => r.score >= 70).length / bulkResults.length) * 100)}%`,
                      color: 'text-green-500' 
                    },
                    { 
                      label: 'Common Passwords', 
                      value: bulkResults.filter(r => r.isCommon).length, 
                      subtext: `${Math.round((bulkResults.filter(r => r.isCommon).length / bulkResults.length) * 100)}%`,
                      color: 'text-red-500' 
                    },
                    { 
                      label: 'With Patterns', 
                      value: bulkResults.filter(r => r.patterns > 0).length, 
                      subtext: `${Math.round((bulkResults.filter(r => r.patterns > 0).length / bulkResults.length) * 100)}%`,
                      color: 'text-yellow-500' 
                    }
                  ].map(stat => (
                    <div key={stat.label} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        {stat.subtext && <div className="text-xs text-gray-500 mt-1">{stat.subtext}</div>}
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strength Distribution */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3">Strength Distribution</h4>
                  <div className="h-6 w-full rounded-full overflow-hidden flex">
                    {[
                      { 
                        label: 'Very Weak', 
                        count: bulkResults.filter(r => r.score < 30).length, 
                        color: 'bg-red-500' 
                      },
                      { 
                        label: 'Weak', 
                        count: bulkResults.filter(r => r.score >= 30 && r.score < 50).length, 
                        color: 'bg-orange-500' 
                      },
                      { 
                        label: 'Moderate', 
                        count: bulkResults.filter(r => r.score >= 50 && r.score < 70).length, 
                        color: 'bg-yellow-500' 
                      },
                      { 
                        label: 'Strong', 
                        count: bulkResults.filter(r => r.score >= 70 && r.score < 85).length, 
                        color: 'bg-blue-500' 
                      },
                      { 
                        label: 'Very Strong', 
                        count: bulkResults.filter(r => r.score >= 85).length, 
                        color: 'bg-green-500' 
                      }
                    ].map((category, index) => {
                      const percentage = (category.count / bulkResults.length) * 100;
                      return percentage > 0 ? (
                        <div 
                          key={index}
                          className={`${category.color} h-full`}
                          style={{ width: `${percentage}%` }}
                          title={`${category.label}: ${category.count} (${Math.round(percentage)}%)`}
                        ></div>
                      ) : null;
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Very Weak</span>
                    <span>Weak</span>
                    <span>Moderate</span>
                    <span>Strong</span>
                    <span>Very Strong</span>
                  </div>
                </div>
                
                {/* Results Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className="text-left py-3 px-4">
                          <button 
                            className="flex items-center space-x-1 font-medium"
                            onClick={() => requestSort('password')}
                          >
                            <span>Password</span>
                            {getSortIcon('password')}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4">
                          <button 
                            className="flex items-center space-x-1 font-medium"
                            onClick={() => requestSort('score')}
                          >
                            <span>Score</span>
                            {getSortIcon('score')}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4">
                          <button 
                            className="flex items-center space-x-1 font-medium"
                            onClick={() => requestSort('strength')}
                          >
                            <span>Strength</span>
                            {getSortIcon('strength')}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4">
                          <button 
                            className="flex items-center space-x-1 font-medium"
                            onClick={() => requestSort('entropy')}
                          >
                            <span>Entropy</span>
                            {getSortIcon('entropy')}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBulkResults.map((result, index) => (
                        <tr key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className="py-3 px-4 font-mono text-sm">{result.password}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">{result.score}</span>
                              <div className={`w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                                <div
                                  className={`h-2 rounded-full ${
                                    result.score >= 80 ? 'bg-green-500' :
                                    result.score >= 60 ? 'bg-blue-500' :
                                    result.score >= 40 ? 'bg-yellow-500' :
                                    result.score >= 20 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${result.score}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className={`py-3 px-4 font-medium ${
                            result.score >= 80 ? 'text-green-500' :
                            result.score >= 60 ? 'text-blue-500' :
                            result.score >= 40 ? 'text-yellow-500' :
                            result.score >= 20 ? 'text-orange-500' : 'text-red-500'
                          }`}>
                            {result.strength}
                          </td>
                          <td className="py-3 px-4">
                            {result.entropy > 1000 
                              ? Math.round(result.entropy) 
                              : result.entropy} bits
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {result.isCommon && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                  Common
                                </span>
                              )}
                              {result.patterns > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                  Patterns: {result.patterns}
                                </span>
                              )}
                              {!result.hasIssues && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                  No issues
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-8">
            {/* Security Guide */}
            <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Book className="h-6 w-6 mr-2 text-blue-500" />
                Password Security Guide
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Best Practices */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-green-500">✓ Best Practices</h3>
                    <ul className="space-y-3">
                      {[
                        'Use at least 12 characters for strong passwords',
                        'Include uppercase, lowercase, numbers, and symbols',
                        'Use unique passwords for each account',
                        'Consider using passphrases (e.g., "Coffee!Morning#2024")',
                        'Enable two-factor authentication where possible',
                        'Use a reputable password manager',
                        'Regularly update passwords for sensitive accounts',
                        'Never share passwords or write them down unsecurely'
                      ].map((practice, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* What to Avoid */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-red-500">✗ What to Avoid</h3>
                    <ul className="space-y-3">
                      {[
                        'Dictionary words or common phrases',
                        'Personal information (birthdays, names, addresses)',
                        'Keyboard patterns (qwerty, 123456, asdf)',
                        'Simple substitutions (@ for a, 3 for e)',
                        'Reusing passwords across multiple sites',
                        'Sharing passwords via email or text',
                        'Using passwords shorter than 8 characters',
                        'Storing passwords in browsers on shared computers'
                      ].map((avoid, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{avoid}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Concepts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entropy Explanation */}
              <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                  Password Entropy
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Entropy measures the randomness and unpredictability of a password. Higher entropy means stronger security.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>&lt; 25 bits:</span>
                    <span className="text-red-500">Very Weak</span>
                  </div>
                  <div className="flex justify-between">
                    <span>25-50 bits:</span>
                    <span className="text-yellow-500">Weak</span>
                  </div>
                  <div className="flex justify-between">
                    <span>50-75 bits:</span>
                    <span className="text-blue-500">Moderate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; 75 bits:</span>
                    <span className="text-green-500">Strong</span>
                  </div>
                </div>
              </div>

              {/* Attack Methods */}
              <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-red-500" />
                  Common Attack Methods
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-red-400">Dictionary Attacks</h4>
                    <p className="text-gray-600 dark:text-gray-400">Uses common passwords and words</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-400">Brute Force</h4>
                    <p className="text-gray-600 dark:text-gray-400">Tries all possible combinations</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-400">Social Engineering</h4>
                    <p className="text-gray-600 dark:text-gray-400">Uses personal information</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-400">Credential Stuffing</h4>
                    <p className="text-gray-600 dark:text-gray-400">Reuses leaked passwords</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Policy Templates */}
            <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-500" />
                Password Policy Templates
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Basic Security',
                    requirements: [
                      'Minimum 8 characters',
                      'At least 1 uppercase letter',
                      'At least 1 lowercase letter',
                      'At least 1 number'
                    ],
                    use: 'Low-risk applications'
                  },
                  {
                    title: 'Enhanced Security',
                    requirements: [
                      'Minimum 12 characters',
                      'Mix of upper/lowercase',
                      'Numbers and symbols',
                      'No dictionary words',
                      'No personal information'
                    ],
                    use: 'Business applications'
                  },
                  {
                    title: 'Maximum Security',
                    requirements: [
                      'Minimum 16 characters',
                      'Complex character mix',
                      'High entropy (>60 bits)',
                      'Unique per system',
                      'Regular rotation',
                      'MFA required'
                    ],
                    use: 'Critical systems'
                  }
                ].map((policy, index) => (
                  <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className="font-semibold mb-2 text-blue-400">{policy.title}</h4>
                    <ul className="space-y-1 text-sm mb-3">
                      {policy.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start space-x-2">
                          <span className="text-gray-400">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500">
                      <strong>Best for:</strong> {policy.use}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documentation' && (
          <div className="space-y-8">
            <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Info className="h-6 w-6 mr-2 text-blue-500" />
                Technical Documentation
              </h2>
              
              <div className="space-y-8">
                {/* Overview */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-500">Overview</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    HardLock Vault is a comprehensive password security tool that helps users create, analyze, and manage secure passwords.
                    All operations are performed client-side in your browser - no passwords are transmitted or stored.
                  </p>
                </div>
                
                {/* Password Entropy */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-500">Password Entropy</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Entropy is a measure of password unpredictability, calculated in bits. Higher entropy means a more secure password.
                  </p>
                  
                  <h4 className="text-lg font-medium mb-2">How Entropy is Calculated</h4>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                    <code className="block text-sm">
                      Entropy = log2(CharsetSize^PasswordLength)
                    </code>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Where:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                    <li><strong>CharsetSize</strong>: The number of possible characters in each position</li>
                    <li>Lowercase letters (a-z): 26 characters</li>
                    <li>Uppercase letters (A-Z): 26 characters</li>
                    <li>Numbers (0-9): 10 characters</li>
                    <li>Special characters: 33 characters</li>
                    <li><strong>PasswordLength</strong>: The number of characters in the password</li>
                  </ul>
                </div>
                
                {/* Time to Crack */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-500">Time to Crack Estimates</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Time to crack estimates are based on the password's entropy and adjusted based on detected patterns.
                  </p>
                  
                  <h4 className="text-lg font-medium mb-2">How Time to Crack is Calculated</h4>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                    <code className="block text-sm">
                      TimeToCrack = (2^(Entropy-1)) / GuessesPerSecond * AdjustmentFactor
                    </code>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Where:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                    <li><strong>Entropy</strong>: The calculated entropy of the password in bits</li>
                    <li><strong>GuessesPerSecond</strong>: The number of password guesses per second</li>
                    <li>Online Attack: 1,000 guesses/second (rate-limited)</li>
                    <li>Offline Attack: 1 billion guesses/second (standard hardware)</li>
                    <li>Optimized Rig: 100 billion guesses/second (specialized hardware)</li>
                  </ul>
                </div>
                
                {/* Pattern Detection */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-500">Pattern Detection</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The application detects various patterns that weaken password security:
                  </p>
                  
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                    <li><strong>Common Passwords</strong>: Matches against a database of frequently used passwords</li>
                    <li><strong>Keyboard Patterns</strong>: Sequences like "qwerty" or "asdfgh"</li>
                    <li><strong>Sequential Patterns</strong>: Simple sequences like "12345" or "abcde"</li>
                    <li><strong>Word + Number Patterns</strong>: Common combinations like "password123"</li>
                    <li><strong>Date Patterns</strong>: Years or date formats</li>
                    <li><strong>Non-English Patterns</strong>: Similar patterns in non-Latin scripts</li>
                  </ul>
                </div>
                
                {/* Strength Score */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-500">Strength Score Calculation</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The password strength score (0-100) is calculated based on multiple factors:
                  </p>
                  
                  <h4 className="text-lg font-medium mb-2">Positive Factors</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                    <li><strong>Length</strong>: Longer passwords receive higher scores</li>
                    <li><strong>Character Variety</strong>: Using a mix of character types improves the score</li>
                    <li><strong>Entropy</strong>: Higher entropy contributes to a better score</li>
                  </ul>
                  
                  <h4 className="text-lg font-medium mb-2">Negative Factors</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                    <li><strong>Common Passwords</strong>: Severely penalizes the score (-40 points)</li>
                    <li><strong>Detected Patterns</strong>: Each detected pattern reduces the score</li>
                    <li><strong>Missing Character Types</strong>: Not using uppercase, lowercase, numbers, or symbols</li>
                  </ul>
                </div>
                
                {/* Technical Implementation */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-500">Technical Implementation</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    HardLock Vault is built using:
                  </p>
                  
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                    <li><strong>React</strong>: For the user interface and component architecture</li>
                    <li><strong>Tailwind CSS</strong>: For styling and responsive design</li>
                    <li><strong>JavaScript</strong>: For all password analysis algorithms</li>
                    <li><strong>Client-side processing</strong>: All operations run in your browser for privacy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'} backdrop-blur-sm border-t mt-auto`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Turtle className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-400 dark:text-gray-400">
                HardLock Vault - Professional Password Security Suite
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Built for cybersecurity professionals • Client-side processing • No data stored
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PasswordSecurityApp; 