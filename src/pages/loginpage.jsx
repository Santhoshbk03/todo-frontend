import React, { useState } from "react";
import { Input, Button, Checkbox, message } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import "../styles/loginpage.css";
import { useNavigate } from "react-router-dom";
import { loginService } from "../service/auth.service";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      message.error("Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      message.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const values = {
        email: email,
        password: password,
      };

      const response = await loginService(values);
      console.log(response.data.user.token);
      

      if (response.data.user.token) {
        localStorage.setItem("token", response.data.user.token);
        
        if (response.data.data) {
          localStorage.setItem("userdetails", JSON.stringify(response.data.data));
        } else if (response.data.user) {
          localStorage.setItem("userdetails", JSON.stringify(response.data.user));
        }

        message.success("Login Successful");
        
        // Fixed: Use === instead of ==, and check response status correctly
        if (response.status === 200) {
          navigate("/dashboard");
        }
      } else {
        message.error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Better error handling
      if (error.response?.status === 401) {
        message.error("Invalid email or password");
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (!error.response) {
        message.error("Network error - please check your connection");
      } else {
        message.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap'
        rel='stylesheet'
      />

      <div className='login-container'>
        <div className='login-form-side'>
          <div className='login-form-wrapper'>
            {/* Heading */}
            <h1 className='welcome-title'>Welcome Back</h1>
            <p className='welcome-subtitle'>
              Sign in to access your personalized dashboard and continue your
              journey with us.
            </p>

            {/* Form */}
            <div className='form-group'>
              <label>Email Address</label>
              <Input
                placeholder='Enter your email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className='modern-input'
                type='email'
              />
            </div>

            <div className='form-group'>
              <label>Password</label>
              <Input.Password
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                iconRender={(visible) =>
                  visible ? (
                    <EyeOutlined className='password-icon' />
                  ) : (
                    <EyeInvisibleOutlined className='password-icon' />
                  )
                }
                className='modern-input'
              />
            </div>

            <div className='options-row'>
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className='modern-checkbox'
                disabled={loading}
              >
                Remember me
              </Checkbox>
            </div>

            <Button 
              type='primary' 
              onClick={handleLogin} 
              className='login-btn'
              loading={loading}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>

            <p className='signup-link'>
              New to our platform? <a href='/signup'>Create an account</a>
            </p>
          </div>
        </div>

        <div className='decorative-side'>
          <div className='glass-orb orb-1'></div>
          <div className='glass-orb orb-2'></div>
          <div className='glass-orb orb-3'></div>
          <div className='floating-particle particle-1'></div>
          <div className='floating-particle particle-2'></div>
          <div className='floating-particle particle-3'></div>
          <div className='accent-line line-1'></div>
          <div className='accent-line line-2'></div>
          <div className='hero-content'>
            <h2>Elevate Your Digital Journey</h2>
            <p>
              Experience seamless access, cutting-edge tools, and personalized
              insights trusted by innovators worldwide.
            </p>
          </div>
          <div className='accent-icon'>✦</div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;