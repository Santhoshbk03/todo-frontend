import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Avatar,
  Tag,
  Spin,
  List,
} from "antd";
import {
  ArrowUpOutlined,
  MoreOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { fetchDashboardservice } from "../service/groupservice";

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchDashboard();
  }, []);

 const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("🔄 Fetching dashboard data...");
      
      const response = await fetchDashboardservice();
      
      console.log("📡 Full response:", response.data);


      
      // Handle 304 Not Modified - force refresh
      if (response.status === 304) {
        console.log("🔄 304 Not Modified - forcing refresh...");
        // Add cache busting parameter
        const timestamp = new Date().getTime();
        const refreshedResponse = await fetchDashboardservice(timestamp);
        
        if (refreshedResponse.ok) {
          const result = await refreshedResponse.json();
          console.log("✅ Refreshed dashboard data:", result);
          setData(result);
          return;
        }
      }
      
     
      
      
      const result = response.data;
      console.log("✅ Dashboard data received:", result);
      
      // Set the data directly (your API returns the data object directly)
      setData(result);
      setError(null);
      
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err.message, err);
      setError(err.message || "Failed to load dashboard");
      
    //   // Retry logic
    //   if (retryCount < 2) {
    //     setTimeout(() => {
    //       console.log(`🔄 Retrying dashboard fetch (${retryCount + 1}/2)...`);
    //       setRetryCount(prev => prev + 1);
    //       fetchDashboard();
    //     }, 1000 * (retryCount + 1));
    //   }
    } finally {
      setLoading(false);
    }
  };


  // Add this in your Dashboard component's JSX, before the return statement
const testDirectApi = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseurl}/dashboard?t=${Date.now()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Cache-Control": "no-cache"
      }
    });
    const data = await response.json();
    console.log("Direct API test:", data);
    setData(data);
  } catch (err) {
    console.error("Direct API test failed:", err);
  }
};

// Add a debug button in your header section:
<div style={{ 
  padding: "16px 0",
  marginBottom: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}}>
  <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
  <div>
    <Button 
      onClick={testDirectApi}
      style={{ marginRight: 8 }}
    >
      Test API
    </Button>
    <Button 
      icon={<ReloadOutlined />}
      onClick={fetchDashboard}
      loading={loading}
    >
      Refresh
    </Button>
  </div>
</div>

  // Fixed status colors - added all possible statuses from your data
  const priorityColors = {
    HIGH: "#ff4d4f",
    MEDIUM: "#faad14",
    LOW: "#52c41a",
  };

  const statusColors = {
    TODO: "#1890ff",
    DONE: "#52c41a",
    'IN_PROGRESS': "#faad14",
    PENDING: "#d4d4d4",
  };

  // Get status color with fallback
  const getStatusColor = (status) => {
    return statusColors[status] || "#1890ff";
  };

  // Get status display text
  const getStatusText = (status) => {
    const statusMap = {
      'DONE': 'Done',
      'IN_PROGRESS': 'In Progress',
      'PENDING': 'Pending',
      'TODO': 'To Do'
    };
    return statusMap[status] || status;
  };

  // Get avatar icon for status
  const getStatusIcon = (status) => {
    const iconMap = {
      'DONE': '✓',
      'IN_PROGRESS': '→',
      'PENDING': '○',
      'TODO': '○'
    };
    return iconMap[status] || '○';
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "100px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh"
      }}>
        <Spin size="large" />
        <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
          {retryCount > 0 ? `Loading dashboard... (Retry ${retryCount}/3)` : "Loading dashboard..."}
        </Text>
        {retryCount > 0 && (
          <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
            Taking longer than usual...
          </Text>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "100px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh"
      }}>
        <Text type="danger" style={{ fontSize: 16, marginBottom: 16 }}>
          Failed to load dashboard
        </Text>
        <Text type="secondary" style={{ marginBottom: 24, maxWidth: 400 }}>
          {error}
        </Text>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={() => {
            setRetryCount(0);
            fetchDashboard();
          }}
          style={{ marginBottom: 8 }}
        >
          Retry
        </Button>
        <Button 
          type="link" 
          onClick={() => navigate("/")}
        >
          Go to Home
        </Button>
      </div>
    );
  }

  // Handle case where data might be null or empty
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "100px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh"
      }}>
        <Text type="secondary" style={{ marginBottom: 16 }}>
          No dashboard data available
        </Text>
        <Button 
          type="primary" 
          onClick={() => {
            setRetryCount(0);
            fetchDashboard();
          }}
        >
          Load Dashboard
        </Button>
      </div>
    );
  }

  console.log("🎨 Rendering dashboard with data:", data);

  const completionRate = data?.tasks?.completionRate || 0;

  const statCards = [
    {
      title: "Groups",
      value: data?.groups || 0,
      change: "Total groups",
      bg: "linear-gradient(135deg, #FFF4E6 0%, #FFE7BA 100%)",
    },
    {
      title: "Active Tasks",
      value: data?.tasks?.active || 0,
      change: "In progress",
      bg: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
    },
    {
      title: "Total Tasks",
      value: data?.tasks?.total || 0,
      change: "All tasks",
      bg: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
    },
    {
      title: "Completed",
      value: data?.tasks?.completed || 0,
      change: `${completionRate}% complete`,
      bg: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
    },
  ];

  // Priority distribution data
  const priorityData = data?.priority?.map((p) => ({
    name: p.priority?.charAt(0) + p.priority?.slice(1).toLowerCase() || 'Unknown',
    value: Number(p.count || 0),
    color: priorityColors[p.priority] || "#d9d9d9",
  })) || [];

  // Create chart data from weekly stats
  let chartData = [];
  
  if (data?.weeklyStats && data.weeklyStats.length > 0) {
    // Use weeklyStats from API
    chartData = data.weeklyStats.map(week => ({
      day: week.day,
      value: week.total || 0,
    }));
  } else if (data?.recentTasks && data.recentTasks.length > 0) {
    // Fallback: create from recent tasks
    const tasksByDay = {};
    data.recentTasks.forEach((task) => {
      const date = new Date(task.updated_at || task.created_at);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      tasksByDay[dayName] = (tasksByDay[dayName] || 0) + 1;
    });

    chartData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
      day,
      value: tasksByDay[day] || 0,
    }));
  }

  // Ensure we have at least some data for the chart
  if (chartData.length === 0) {
    chartData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
      day,
      value: 0,
    }));
  }

  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh", padding: 0 }}>
      {/* Header with refresh button */}
      <div style={{ 
        padding: "16px 0",
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
        <Button 
          icon={<ReloadOutlined />}
          onClick={fetchDashboard}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Stat Cards Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card
              bordered={false}
              style={{
                background: stat.bg,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>
                  {stat.title}
                </Text>
                <Button
                  type="text"
                  icon={<ArrowUpOutlined />}
                  size="small"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    borderRadius: 6,
                    padding: "0 6px",
                    height: 20,
                    fontSize: 10,
                  }}
                />
              </div>
              <div>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#000",
                    display: "block",
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 11, color: "#666" }}>{stat.change}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]}>
        {/* Task Activity Chart */}
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{
              background: "linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              color: "#fff",
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <Text style={{ fontSize: 15, color: "#fff", fontWeight: 500, display: "block" }}>
                  Task Activity
                </Text>
                <div style={{ marginTop: 6 }}>
                  <Text style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
                    {completionRate}%
                  </Text>
                  <Tag
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "none",
                      color: "#fff",
                      marginLeft: 8,
                      fontSize: 11,
                    }}
                  >
                    Completion Rate
                  </Tag>
                </div>
              </div>
              <Button
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  borderRadius: 6,
                  fontSize: 12,
                  height: 28,
                }}
              >
                7 Days
              </Button>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="day" 
                  stroke="#fff" 
                  tick={{ fill: "#fff", fontSize: 12 }} 
                />
                <YAxis 
                  stroke="#fff" 
                  tick={{ fill: "#fff", fontSize: 12 }} 
                />
                <RechartsTooltip
                  contentStyle={{
                    background: "rgba(0,0,0,0.8)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value} tasks`, 'Count']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Bar 
                  dataKey="value" 
                  fill="#fff" 
                  radius={[6, 6, 0, 0]} 
                  name="Tasks"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Priority Distribution */}
        <Col xs={24} lg={8}>
          <Card
            title={<Text strong style={{ fontSize: 15 }}>Priority Distribution</Text>}
            extra={<Button type="text" icon={<MoreOutlined />} />}
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              height: "100%",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={5}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name, props) => [
                      `${value} tasks`, 
                      props.payload.name
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Text type="secondary">No priority data available</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        {/* Recent Tasks */}
        <Col xs={24} lg={12}>
          <Card
            title={<Text strong style={{ fontSize: 15 }}>Recent Tasks</Text>}
            extra={
              <Button type="link" onClick={() => navigate("/tasks")} style={{ fontSize: 12 }}>
                View All →
              </Button>
            }
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            bodyStyle={{ padding: "12px 16px" }}
          >
            {data?.recentTasks?.length > 0 ? (
              <List
                dataSource={data.recentTasks}
                renderItem={(task) => (
                  <List.Item 
                    style={{ 
                      padding: "10px 0", 
                      border: "none",
                      cursor: "pointer"
                    }}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={40}
                          style={{
                            background: getStatusColor(task.status),
                            fontSize: 16,
                            fontWeight: "bold",
                          }}
                        >
                          {getStatusIcon(task.status)}
                        </Avatar>
                      }
                      title={
                        <Text strong style={{ fontSize: 13 }}>
                          {task.title}
                        </Text>
                      }
                      description={
                        <div>
                          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                            {task.group_name || 'No Group'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {new Date(task.updated_at || task.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Text>
                        </div>
                      }
                    />
                    <Tag
                      color={priorityColors[task.priority] || "#d9d9d9"}
                      style={{ borderRadius: 6, fontSize: 11 }}
                    >
                      {task.priority || 'N/A'}
                    </Tag>
                  </List.Item>
                )}
                style={{ height: "36vh", overflowY: "auto" }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Text type="secondary">No recent tasks</Text>
                <Button 
                  type="link" 
                  onClick={() => navigate("/tasks/new")}
                  style={{ fontSize: 12, marginTop: 8 }}
                >
                  Create your first task
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* All Tasks Table */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text strong style={{ fontSize: 15 }}>Task Overview</Text>
                <Button 
                  type="link" 
                  onClick={() => navigate("/tasks")}
                  style={{ fontSize: 12 }}
                >
                  View All →
                </Button>
              </div>
            }
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#999",
                        fontSize: 11,
                      }}
                    >
                      TASK
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#999",
                        fontSize: 11,
                      }}
                    >
                      STATUS
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontWeight: 600,
                        color: "#999",
                        fontSize: 11,
                      }}
                    >
                      PRIORITY
                    </th>
                  </tr>
                </thead>
                <tbody style={{ height: "36vh", overflowY: "auto", display: "block" }}>
                  {data?.recentTasks?.length > 0 ? (
                    data.recentTasks.map((task) => (
                      <tr 
                        key={task.id} 
                        style={{ 
                          borderBottom: "1px solid #f0f0f0",
                          cursor: "pointer",
                          display: "table",
                          width: "100%",
                          tableLayout: "fixed"
                        }}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <td style={{ padding: "12px 16px", width: "40%" }}>
                          <div>
                            <Text strong style={{ fontSize: 13, display: "block" }}>
                              {task.title}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {task.group_name || 'No Group'}
                            </Text>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", width: "30%" }}>
                          <Tag
                            color={getStatusColor(task.status)}
                            style={{ borderRadius: 6, fontSize: 11 }}
                          >
                            {getStatusText(task.status)}
                          </Tag>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", width: "30%" }}>
                          <Tag
                            color={priorityColors[task.priority] || "#d9d9d9"}
                            style={{ borderRadius: 6, fontSize: 11 }}
                          >
                            {task.priority || 'N/A'}
                          </Tag>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr style={{ display: "table", width: "100%" }}>
                      <td colSpan={3} style={{ padding: "40px", textAlign: "center" }}>
                        <Text type="secondary">No tasks available</Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;