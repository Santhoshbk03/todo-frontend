import React, { useState } from "react";
import { Input, Button, Checkbox, message } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import "../styles/Loginpage.css";
import axios from "axios";
import { baseurl } from "../helpers/url";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
         const responce = await axios.post(`${baseurl}/auth/login`, {
      email,
      password,
    });
    localStorage.setItem("token", responce.data.user.token);
    localStorage.setItem("userdetails", responce.data.user.data);
    if (responce.status == 200) navigate("/dashboard");
    message.success("login Succesfull")
    } catch (error) {
        message.error(error.message)
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
                className='modern-input'
              />
            </div>

            <div className='form-group'>
              <label>Password</label>
              <Input.Password
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              >
                Remember me
              </Checkbox>
            </div>

            <Button type='primary' onClick={handleLogin} className='login-btn'>
              Log In
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
