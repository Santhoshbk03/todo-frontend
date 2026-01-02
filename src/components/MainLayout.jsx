import { Layout, Menu, Badge, Avatar, Dropdown } from "antd";
import {
  DashboardOutlined,
  FolderOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
  DownOutlined,
  MailOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider, Header, Content } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }
    navigate(key);
  };

  const userMenuItems = [
    { key: "profile", label: "Profile" },
    { key: "settings", label: "Settings" },
    { type: "divider" },
    { key: "logout", label: "Logout", icon: <LogoutOutlined /> },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      {/* SIDEBAR */}
      <Sider
        width={250}
        style={{
          background: "#fff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            height: 80,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#000",
              letterSpacing: "-0.5px",
            }}
          >
            TODO
          </span>
        </div>

        <div style={{ padding: "24px 16px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#999",
              marginBottom: 12,
              paddingLeft: 8,
              letterSpacing: "0.5px",
            }}
          >
            MAIN MENU
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            style={{
              border: "none",
              background: "transparent",
            }}
            items={[
              {
                key: "/dashboard",
                icon: <DashboardOutlined />,
                label: "Dashboard",
                style: {
                  background:
                    location.pathname === "/dashboard"
                      ? "#f5f5f5"
                      : "transparent",
                  borderRadius: 8,
                  marginBottom: 4,
                },
              },
             
              {
                key: "/tasks",
                icon: <CheckSquareOutlined />,
                label: "Tasks",
                style: { borderRadius: 8, marginBottom: 4 },
              },
            ]}
          />

          <div style={{ position: "absolute", bottom: 24, left: 16, right: 16 }}>
            <Menu
              mode="inline"
              onClick={handleMenuClick}
              style={{
                border: "none",
                background: "transparent",
              }}
              items={[
                {
                  key: "logout",
                  icon: <LogoutOutlined />,
                  label: "Logout",
                  style: { borderRadius: 8 },
                },
              ]}
            />
          </div>
        </div>
      </Sider>

      {/* MAIN CONTENT */}
      <Layout style={{ background: "#f5f6fa" }}>
        <Header
          style={{
            background: "#fff",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            height: 80,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 600, color: "#000" }}>
            My Todo App
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <MailOutlined style={{ fontSize: 20, color: "#666", cursor: "pointer" }} />
            <BellOutlined style={{ fontSize: 20, color: "#666", cursor: "pointer" }} />
            
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 8,
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Avatar
                  src="https://i.pravatar.cc/150?img=12"
                  size={40}
                  style={{ border: "2px solid #f0f0f0" }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#000" }}>
                    {localStorage.getItem("")}
                  </div>
                </div>
                <DownOutlined style={{ fontSize: 12, color: "#999" }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: 32 }}>
          <div
            style={{
              padding: 24,
              height: "80vh",
              background: "#fff",
              borderRadius: 12,
              overflow : "scroll"
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;