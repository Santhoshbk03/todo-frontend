import React from 'react';
import { 
  DashboardOutlined, 
  CheckCircleOutlined, 
  CalendarOutlined,
  LineChartOutlined, 
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  FolderOpenOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const SideNav = ({ activeTab, onTabChange, isCollapsed, onToggleCollapse }) => {
  // Navigation items
  const navItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      badge: null
    },
    {
      key: 'todos',
      icon: <CheckCircleOutlined />,
      label: 'Todo List',
      badge: 5 // Number of pending todos
    },
    {
      key: 'projects',
      icon: <FolderOpenOutlined />,
      label: 'Projects',
      badge: null
    },
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
      badge: 'New'
    },
    {
      key: 'analytics',
      icon: <LineChartOutlined />,
      label: 'Analytics',
      badge: null
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      badge: null
    }
  ];

  // User stats
  const userStats = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'JD',
    productivityScore: 85,
    tasksCompleted: 42,
    streakDays: 7
  };

  return (
    <aside className={`side-nav ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo and Collapse Toggle */}
      <div className="nav-header">
        <div className="logo-section">
          <div className="logo-icon">
            <CheckCircleOutlined />
          </div>
          {!isCollapsed && (
            <div className="logo-text">
              <h2>Todo<span className="highlight">Pro</span></h2>
              <p className="logo-subtitle">Productivity Suite</p>
            </div>
          )}
        </div>
        
        <button 
          className="collapse-toggle"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* User Profile Section */}
      <div className="user-profile-section">
        <div className="user-avatar">
          <div className="avatar-circle">
            {userStats.avatar}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <h4>{userStats.name}</h4>
              <p>{userStats.email}</p>
              <div className="user-stats">
                <span className="stat-item">
                  <CheckCircleOutlined />
                  {userStats.tasksCompleted}
                </span>
                <span className="stat-item">
                  <BellOutlined />
                  {userStats.streakDays}d
                </span>
              </div>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="productivity-meter">
            <div className="meter-label">
              <span>Productivity</span>
              <span>{userStats.productivityScore}%</span>
            </div>
            <div className="meter-bar">
              <div 
                className="meter-fill" 
                style={{ width: `${userStats.productivityScore}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="nav-menu">
        <div className="menu-section">
          <h3 className={isCollapsed ? 'visually-hidden' : 'section-title'}>
            Navigation
          </h3>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
                  onClick={() => onTabChange(item.key)}
                  aria-label={item.label}
                  aria-current={activeTab === item.key ? 'page' : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                  {item.badge && (
                    <span className="nav-badge">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn primary">
              <CheckCircleOutlined />
              <span>Add Task</span>
            </button>
            <button className="action-btn secondary">
              <CalendarOutlined />
              <span>Schedule</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications and Settings */}
      <div className="nav-footer">
        <button className="footer-btn notification-btn">
          <BellOutlined />
          {!isCollapsed && <span>Notifications</span>}
          <span className="notification-dot"></span>
        </button>
        
        <button className="footer-btn user-btn">
          <UserOutlined />
          {!isCollapsed && <span>Profile</span>}
        </button>
        
        <button className="footer-btn logout-btn">
          <LogoutOutlined />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapsed State Indicators */}
      {isCollapsed && (
        <div className="collapsed-tooltip">
          {navItems.map((item) => (
            <div 
              key={item.key}
              className={`tooltip-item ${activeTab === item.key ? 'active' : ''}`}
            >
              {item.icon}
              <span className="tooltip-text">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};

export default React.memo(SideNav);