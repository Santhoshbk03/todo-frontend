import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import '../styles/SignUpPage.css';

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkPasswordMatch = (value) => {
    setConfirmPassword(value);
    if (value === '') {
      setPasswordMatch(null);
    } else if (value === password) {
      setPasswordMatch('valid');
    } else {
      setPasswordMatch('invalid');
    }
  };

  const handleSignUp = () => {
    if (password && password === confirmPassword) {
      console.log('Sign Up Success:', { username, email, password });
      // Add your actual signup API call here
    } else {
      setPasswordMatch('invalid');
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="signup-container">
        {/* Left: Form Side */}
        <div className="signup-form-side">
          <div className="signup-form-wrapper">
          

            <h1 className="welcome-title">Start Your Journey</h1>
            <p className="welcome-subtitle">
              Create an account to unlock powerful tools and personalized experiences.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
              {/* Username */}
              <div className="form-group">
                <label>Username</label>
                <Input
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="modern-input"
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email Address</label>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="modern-input"
                  type="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Password</label>
                <Input.Password
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  iconRender={(visible) =>
                    visible ? <EyeOutlined className="password-icon" /> : <EyeInvisibleOutlined className="password-icon" />
                  }
                  className="modern-input"
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label>Confirm Password</label>
                <Input.Password
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => checkPasswordMatch(e.target.value)}
                  iconRender={(visible) =>
                    visible ? <EyeOutlined className="password-icon" /> : <EyeInvisibleOutlined className="password-icon" />
                  }
                  className={`modern-input ${
                    passwordMatch === 'valid' ? 'match-valid' : ''
                  } ${passwordMatch === 'invalid' ? 'match-invalid' : ''}`}
                  required
                />
                {passwordMatch === 'valid' && (
                  <span className="match-feedback valid">Passwords match ✓</span>
                )}
                {passwordMatch === 'invalid' && confirmPassword && (
                  <span className="match-feedback invalid">Passwords do not match ✗</span>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="primary" 
                htmlType="submit" 
                className="signup-btn"
                block
              >
                Create Account
              </Button>
            </form>

            {/* Login Link */}
            <p className="login-link">
              Already have an account? <a href="#">Log in here</a>
            </p>
          </div>
        </div>

        {/* Right: Decorative Side - Hidden on mobile */}
        {!isMobile && (
          <div className="decorative-side">
            <div className="wave-bg wave-1"></div>
            <div className="wave-bg wave-2"></div>
            <div className="wave-bg wave-3"></div>

            <div className="glow-orb orb-a"></div>
            <div className="glow-orb orb-b"></div>
            <div className="glow-orb orb-c"></div>

            <div className="ripple-ring ring-1"></div>
            <div className="ripple-ring ring-2"></div>

            <div className="hero-content">
              <h2>Innovate Without Limits</h2>
              <p>
                Join a community of creators building the future with cutting-edge tools and seamless collaboration.
              </p>
            </div>

            <div className="accent-icon">∞</div>
          </div>
        )}
      </div>
    </>
  );
};

export default SignUpPage;