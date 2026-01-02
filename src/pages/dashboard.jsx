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
  TeamOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  MoreOutlined,
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
import { baseurl } from "../helpers/url";
import { fetchDashboardservice } from "../service/groupservice";

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetchDashboardservice();

      
      if (!response.ok) throw new Error("Failed to fetch dashboard");
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Dashboard error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    HIGH: "#ff4d4f",
    MEDIUM: "#faad14",
    LOW: "#52c41a",
  };

  const statusColors = {
    TODO: "#1890ff",
    DONE: "#52c41a",
    IN_PROGRESS: "#faad14",
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
          Loading dashboard...
        </Text>
      </div>
    );
  }

  const completionRate =
    data?.tasks?.total > 0
      ? Math.round((data.tasks.completed / data.tasks.total) * 100)
      : 0;

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
  const priorityData =
    data?.priority?.map((p) => ({
      name: p.priority.charAt(0) + p.priority.slice(1).toLowerCase(),
      value: Number(p.count),
      color: priorityColors[p.priority],
    })) || [];

  // Create chart data from tasks by day
  const tasksByDay = {};
  data?.recentTasks?.forEach((task) => {
    const date = new Date(task.updated_at);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    tasksByDay[dayName] = (tasksByDay[dayName] || 0) + 1;
  });

  const chartData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
    day,
    value: tasksByDay[day] || 0,
  }));

  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh", padding: 0 }}>
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
                <XAxis dataKey="day" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    background: "rgba(0,0,0,0.8)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="#fff" radius={[6, 6, 0, 0]} />
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
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
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
                  <List.Item style={{ padding: "10px 0", border: "none" }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={40}
                          style={{
                            background: statusColors[task.status] || "#1890ff",
                            fontSize: 16,
                          }}
                        >
                          {task.status === "DONE" ? "✓" : "○"}
                        </Avatar>
                      }
                      title={<Text strong style={{ fontSize: 13 }}>{task.title}</Text>}
                      description={
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(task.updated_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      }
                    />
                    <Tag
                      color={priorityColors[task.priority]}
                      style={{ borderRadius: 6, fontSize: 11 }}
                    >
                      {task.priority}
                    </Tag>
                  </List.Item>
                )}
                style={{height : "36vh",overflowY:"scroll"}}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Text type="secondary">No recent tasks</Text>
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
                <tbody style={{height : "36vh",overflowY : "scroll"}}>
                  {data?.recentTasks?.length > 0 ? (
                    data.recentTasks.map((task, index) => (
                      <tr key={task.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <Text strong style={{ fontSize: 13 }}>
                            {task.title}
                          </Text>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Tag
                            color={statusColors[task.status]}
                            style={{ borderRadius: 6, fontSize: 11 }}
                          >
                            {task.status}
                          </Tag>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <Tag
                            color={priorityColors[task.priority]}
                            style={{ borderRadius: 6, fontSize: 11 }}
                          >
                            {task.priority}
                          </Tag>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
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