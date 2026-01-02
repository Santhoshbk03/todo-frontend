import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  List,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
  Form,
  Select,
  Typography,
  Avatar,
  Tag,
  Progress,
  Checkbox,
  Collapse,
  Empty,
  DatePicker,
  Tabs,
  Badge,
  Statistic,
  Tooltip,
  Slider,
  Menu,
  Divider,
  Dropdown,
  TimePicker,
  
  Radio,
  Switch,
  Timeline,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  UserOutlined,
  FireOutlined,
  CalendarOutlined,
  WarningOutlined,
  TrophyOutlined,
  RiseOutlined,
  FlagOutlined,
  MoreOutlined,
  ThunderboltOutlined,
  CloseOutlined,
  SaveOutlined,
  HistoryOutlined,
  SearchOutlined,
  FilterOutlined,
  StarOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SortAscendingOutlined,
  CheckOutlined,
  LikeOutlined,
  PaperClipOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  CopyOutlined,
  InboxOutlined,
  GroupOutlined,
  BulbOutlined,
  SyncOutlined,
  CheckSquareOutlined,
  SendOutlined,
  RetweetOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { baseurl } from "../helpers/url";
import {
  getGroupsApi,
  createGroupApi,
  updateGroupApi,
  deleteGroupApi,
} from "../service/groupservice.js";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const TasksAndGroups = () => {
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created");
  const [showCompleted, setShowCompleted] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  
  // Group Modal
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  
  // Task Modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm] = Form.useForm();

  // Comment Modal
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // FETCH GROUPS
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await getGroupsApi();
      setGroups(res.data);
      if (res.data.length > 0 && !selectedGroup) {
        const firstGroup = res.data[0].id;
        setSelectedGroup(firstGroup);
        fetchTasksByGroup(firstGroup);
      }
    } catch {
      message.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // FETCH TASKS BY GROUP
  const fetchTasksByGroup = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${baseurl}/tasks/group/${groupId}`,
        getAuthHeader()
      );
      const tasksData = response.data;
      setTasks(tasksData);
      
      // Separate completed tasks
      const completed = tasksData.filter(task => task.status === 'DONE');
      setCompletedTasks(completed);
      
      fetchAllComments(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      message.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // FETCH COMMENTS FOR ALL TASKS
  const fetchAllComments = async (taskList) => {
    const commentsData = {};
    for (const task of taskList) {
      try {
        const response = await axios.get(
          `${baseurl}/comments/${task.id}`,
          getAuthHeader()
        );
        commentsData[task.id] = response.data;
      } catch (error) {
        console.error(`Error fetching comments for task ${task.id}:`, error);
        commentsData[task.id] = [];
      }
    }
    setComments(commentsData);
  };

  // FETCH COMMENTS FOR SINGLE TASK
  const fetchCommentsForTask = async (taskId) => {
    try {
      const response = await axios.get(
        `${baseurl}/comments/${taskId}`,
        getAuthHeader()
      );
      setComments(prev => ({
        ...prev,
        [taskId]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching comments for task ${taskId}:`, error);
      message.error("Failed to load comments");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // GROUP OPERATIONS
  const openGroupModal = (group = null) => {
    setEditingGroup(group);
    setGroupName(group?.name || "");
    setGroupDescription(group?.description || "");
    setGroupModalOpen(true);
  };

  const handleGroupSubmit = async () => {
    if (!groupName.trim()) {
      return message.warning("Group name is required");
    }

    try {
      if (editingGroup) {
        await updateGroupApi(editingGroup.id, {
          name: groupName,
          description: groupDescription,
        });
        message.success("Group updated");
      } else {
        await createGroupApi({ name: groupName, description: groupDescription });
        message.success("Group created");
      }
      setGroupModalOpen(false);
      fetchGroups();
    } catch {
      message.error("Operation failed");
    }
  };

  const handleGroupDelete = async (id) => {
    try {
      await deleteGroupApi(id);
      message.success("Group deleted");
      if (selectedGroup === id) {
        setSelectedGroup(null);
        setTasks([]);
      }
      fetchGroups();
    } catch {
      message.error("Delete failed");
    }
  };

  // TASK OPERATIONS
  const openTaskModal = (task = null) => {
    setEditingTask(task);
    if (task) {
      taskForm.setFieldsValue({
        ...task,
        due_date: task.due_date ? new Date(task.due_date) : null,
      });
    } else {
      taskForm.resetFields();
      taskForm.setFieldsValue({ 
        group_id: selectedGroup,
        priority: "MEDIUM",
        status: "TODO",
        progress: 0,
      });
    }
    setTaskModalOpen(true);
  };

  const handleTaskSubmit = async (values) => {
    try {
      if (editingTask) {
        await axios.put(
          `${baseurl}/tasks/${editingTask.id}`,
          values,
          getAuthHeader()
        );
        message.success("Task updated!");
      } else {
        await axios.post(`${baseurl}/tasks`, values, getAuthHeader());
        message.success("Task created!");
      }

      setTaskModalOpen(false);
      setEditingTask(null);
      taskForm.resetFields();
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error saving task:", error);
      message.error("Failed to save task");
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await axios.delete(`${baseurl}/tasks/${taskId}`, getAuthHeader());
      message.success("Task deleted");
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      message.error("Failed to delete task");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedTasks.length === 0) {
      message.warning("Please select at least one task");
      return;
    }

    try {
      const promises = selectedTasks.map(taskId =>
        axios.delete(`${baseurl}/tasks/${taskId}`, getAuthHeader())
      );
      
      await Promise.all(promises);
      message.success(`${selectedTasks.length} tasks deleted!`);
      setSelectedTasks([]);
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error deleting tasks:", error);
      message.error("Failed to delete tasks");
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === "DONE" ? "TODO" : "DONE";
      const newProgress = newStatus === "DONE" ? 100 : task.progress || 0;
      
      await axios.put(
        `${baseurl}/tasks/${task.id}`,
        { ...task, status: newStatus, progress: newProgress },
        getAuthHeader()
      );
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      message.error("Failed to update task");
    }
  };

  const startTask = async (taskId) => {
    try {
      await axios.put(
        `${baseurl}/tasks/${taskId}`,
        { status: "IN_PROGRESS", progress: 0 },
        getAuthHeader()
      );
      message.success("Task started!");
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error starting task:", error);
      message.error("Failed to start task");
    }
  };

  const handleBatchStart = async () => {
    if (selectedTasks.length === 0) {
      message.warning("Please select at least one task");
      return;
    }

    try {
      const promises = selectedTasks.map(taskId =>
        axios.put(
          `${baseurl}/tasks/${taskId}`,
          { status: "IN_PROGRESS", progress: 0 },
          getAuthHeader()
        )
      );
      
      await Promise.all(promises);
      message.success(`${selectedTasks.length} tasks started!`);
      setSelectedTasks([]);
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error starting tasks:", error);
      message.error("Failed to start tasks");
    }
  };

  const handleBatchComplete = async () => {
    if (selectedTasks.length === 0) {
      message.warning("Please select at least one task");
      return;
    }

    try {
      const promises = selectedTasks.map(taskId =>
        axios.put(
          `${baseurl}/tasks/${taskId}`,
          { status: "DONE", progress: 100 },
          getAuthHeader()
        )
      );
      
      await Promise.all(promises);
      message.success(`${selectedTasks.length} tasks completed!`);
      setSelectedTasks([]);
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error completing tasks:", error);
      message.error("Failed to complete tasks");
    }
  };

  const updateTaskProgress = async (task, newProgress) => {
    try {
      const newStatus = newProgress === 100 ? "DONE" : newProgress > 0 ? "IN_PROGRESS" : "TODO";
      await axios.put(
        `${baseurl}/tasks/${task.id}`,
        { ...task, progress: newProgress, status: newStatus },
        getAuthHeader()
      );
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      message.error("Failed to update progress");
    }
  };

  const duplicateTask = async (task) => {
    try {
      const { id, created_at, updated_at, ...taskData } = task;
      await axios.post(
        `${baseurl}/tasks`,
        { ...taskData, title: `${task.title} (Copy)` },
        getAuthHeader()
      );
      message.success("Task duplicated!");
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error duplicating task:", error);
      message.error("Failed to duplicate task");
    }
  };

  const archiveTask = async (taskId) => {
    try {
      // Store in localStorage as archived
      const archived = JSON.parse(localStorage.getItem('archivedTasks') || '[]');
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        archived.push({
          ...task,
          archived_at: new Date().toISOString()
        });
        localStorage.setItem('archivedTasks', JSON.stringify(archived));
        
        // Delete from server
        await axios.delete(`${baseurl}/tasks/${taskId}`, getAuthHeader());
        message.success("Task archived!");
        fetchTasksByGroup(selectedGroup);
      }
    } catch (error) {
      console.error("Error archiving task:", error);
      message.error("Failed to archive task");
    }
  };

  // COMMENT OPERATIONS - ENHANCED
  const openCommentModal = (task) => {
    setSelectedTask(task);
    setEditingCommentId(null);
    setEditingCommentText("");
    setNewComment("");
    // Refresh comments for this task
    fetchCommentsForTask(task.id);
    setCommentModalOpen(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return message.warning("Please enter a comment");
    }

    try {
      await axios.post(
        `${baseurl}/comments/${selectedTask.id}`,
        { comment: newComment },
        getAuthHeader()
      );
      message.success("Comment added!");
      setNewComment("");
      
      // Refresh comments
      fetchCommentsForTask(selectedTask.id);
    } catch (error) {
      console.error("Error adding comment:", error);
      message.error("Failed to add comment");
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      return message.warning("Comment cannot be empty");
    }

    try {
      await axios.put(
        `${baseurl}/comments/${commentId}`,
        { comment: editingCommentText },
        getAuthHeader()
      );
      message.success("Comment updated!");
      setEditingCommentId(null);
      setEditingCommentText("");
      
      // Refresh comments
      fetchCommentsForTask(selectedTask.id);
    } catch (error) {
      console.error("Error updating comment:", error);
      message.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${baseurl}/comments/${commentId}`,
        getAuthHeader()
      );
      message.success("Comment deleted!");
      
      // Refresh comments
      fetchCommentsForTask(selectedTask.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error("Failed to delete comment");
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.comment);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  // FILTER AND SORT TASKS
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Filter by priority tab
    if (activeTab !== "all") {
      filtered = filtered.filter(task => task.priority === activeTab.toUpperCase());
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by priority dropdown
    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Filter by status dropdown
    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(task => task.status !== "DONE");
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "created":
          return new Date(b.created_at) - new Date(a.created_at);
        case "title":
          return a.title.localeCompare(b.title);
        case "due_date":
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    
    return filtered;
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Select all tasks
  const selectAllTasks = () => {
    const filtered = getFilteredTasks();
    setSelectedTasks(filtered.map(task => task.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedTasks([]);
  };

  // Export tasks
  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tasks_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    message.success("Tasks exported successfully!");
  };

  // STATISTICS
  const getTaskStats = () => {
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "DONE").length;
    const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
    const todo = tasks.filter(t => t.status === "TODO").length;
    const overdue = tasks.filter(t => {
      if (t.due_date && t.status !== "DONE") {
        return new Date(t.due_date) < now;
      }
      return false;
    }).length;
    
    const high = tasks.filter(t => t.priority === "HIGH").length;
    const medium = tasks.filter(t => t.priority === "MEDIUM").length;
    const low = tasks.filter(t => t.priority === "LOW").length;
    
    const avgProgress = total > 0 
      ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / total)
      : 0;
    
    return { total, completed, inProgress, todo, overdue, high, medium, low, avgProgress };
  };

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();
  const activeTasks = filteredTasks.filter(t => t.status !== "DONE");
  const doneTasks = filteredTasks.filter(t => t.status === "DONE");

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH": return "#ff4d4f";
      case "MEDIUM": return "#faad14";
      case "LOW": return "#52c41a";
      default: return "#1890ff";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "TODO": return "warning";
      case "IN_PROGRESS": return "processing";
      case "DONE": return "success";
      default: return "default";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "HIGH": return <FireOutlined />;
      case "MEDIUM": return <ThunderboltOutlined />;
      case "LOW": return <FlagOutlined />;
      default: return null;
    }
  };

  const formatDueDate = (date) => {
    if (!date) return null;
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dueDate.toDateString() === today.toDateString()) return "Today";
    if (dueDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = (task) => {
    if (!task.due_date || task.status === "DONE") return false;
    return new Date(task.due_date) < new Date();
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Task Item Component for List View
  const TaskItem = ({ task, comments, isSelected }) => {
    const isCompleted = task.status === "DONE";
    
    return (
      <div className={`task-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}`} style={{
        padding: "16px 0",
        borderBottom: "1px solid #f0f0f0",
        transition: "all 0.3s",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Checkbox
            checked={isSelected}
            onChange={() => toggleTaskSelection(task.id)}
            style={{ marginTop: 4 }}
          />
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Tag 
                color={getPriorityColor(task.priority)}
                icon={getPriorityIcon(task.priority)}
                style={{ margin: 0 }}
              >
                {task.priority}
              </Tag>
              
              <Text strong style={{ fontSize: 14 }}>
                {task.title}
              </Text>

              {isOverdue(task) && (
                <Tag color="red" icon={<WarningOutlined />}>
                  Overdue
                </Tag>
              )}
            </div>

            {task.description && (
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 2 }}
                style={{ margin: "8px 0", fontSize: 13, paddingLeft: 0 }}
              >
                {task.description}
              </Paragraph>
            )}

            {/* Progress Bar */}
            <div style={{ marginTop: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Progress</Text>
                <Text strong style={{ fontSize: 12, color: getPriorityColor(task.priority) }}>
                  {task.progress || 0}%
                </Text>
              </div>
              <Tooltip title="Click to adjust progress">
                <Slider
                  value={task.progress || 0}
                  onChange={(value) => updateTaskProgress(task, value)}
                  trackStyle={{ background: getPriorityColor(task.priority) }}
                  handleStyle={{ borderColor: getPriorityColor(task.priority) }}
                />
              </Tooltip>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {task.due_date && (
                <Space size={4}>
                  <CalendarOutlined style={{ fontSize: 12, color: isOverdue(task) ? "#ff4d4f" : "#999" }} />
                  <Text 
                    type={isOverdue(task) ? "danger" : "secondary"} 
                    style={{ fontSize: 12 }}
                  >
                    Due {formatDueDate(task.due_date)}
                  </Text>
                </Space>
              )}

              {comments[task.id]?.length > 0 && (
                <Button
                  type="link"
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => openCommentModal(task)}
                  style={{ padding: 0, height: "auto" }}
                >
                  {comments[task.id].length}
                </Button>
              )}

              <Tag color={getStatusColor(task.status)}>
                {task.status.replace("_", " ")}
              </Tag>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar size={32} icon={<UserOutlined />} style={{ background: "#1890ff" }} />
            
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item icon={<EditOutlined />} onClick={() => openTaskModal(task)}>
                    Edit Task
                  </Menu.Item>
                  <Menu.Item icon={<MessageOutlined />} onClick={() => openCommentModal(task)}>
                    View Comments ({comments[task.id]?.length || 0})
                  </Menu.Item>
                  {!isCompleted && (
                    <Menu.Item icon={<ArrowRightOutlined />} onClick={() => startTask(task.id)}>
                      Start Task
                    </Menu.Item>
                  )}
                  <Menu.Item icon={<CopyOutlined />} onClick={() => duplicateTask(task)}>
                    Duplicate
                  </Menu.Item>
                  <Menu.Item icon={<InboxOutlined />} onClick={() => archiveTask(task.id)}>
                    Archive
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                    icon={<DeleteOutlined />} 
                    danger
                    onClick={() => {
                      Modal.confirm({
                        title: 'Delete Task',
                        content: 'Are you sure you want to delete this task?',
                        okText: 'Delete',
                        okType: 'danger',
                        onOk: () => handleTaskDelete(task.id),
                      });
                    }}
                  >
                    Delete
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        </div>
      </div>
    );
  };

  // Task Card Component for Grid View
  const TaskCard = ({ task, comments }) => {
    const isCompleted = task.status === "DONE";
    
    return (
      <Card
        size="small"
        style={{
          height: "100%",
          borderRadius: 12,
          border: `1px solid ${getPriorityColor(task.priority)}20`,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Tag 
                color={getPriorityColor(task.priority)}
                style={{ margin: 0, fontSize: 10 }}
              >
                {task.priority}
              </Tag>
              {isOverdue(task) && (
                <Tag color="red" style={{ fontSize: 10 }}>Overdue</Tag>
              )}
            </div>
            <Text strong style={{ fontSize: 14 }} ellipsis>
              {task.title}
            </Text>
          </div>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item icon={<EditOutlined />} onClick={() => openTaskModal(task)}>
                  Edit
                </Menu.Item>
                <Menu.Item icon={<MessageOutlined />} onClick={() => openCommentModal(task)}>
                  Comments ({comments[task.id]?.length || 0})
                </Menu.Item>
                {!isCompleted && (
                  <Menu.Item icon={<ArrowRightOutlined />} onClick={() => startTask(task.id)}>
                    Start
                  </Menu.Item>
                )}
              </Menu>
            }
          >
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </div>
        
        {task.description && (
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 3 }}
            style={{ fontSize: 12, marginBottom: 12 }}
          >
            {task.description}
          </Paragraph>
        )}
        
        <div style={{ marginBottom: 12 }}>
          <Progress 
            percent={task.progress || 0} 
            size="small" 
            strokeColor={getPriorityColor(task.priority)}
            showInfo={false}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Progress</Text>
            <Text strong style={{ fontSize: 11, color: getPriorityColor(task.priority) }}>
              {task.progress || 0}%
            </Text>
          </div>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <Space size={4}>
            <Tag color={getStatusColor(task.status)} style={{ fontSize: 10 }}>
              {task.status.replace("_", " ")}
            </Tag>
            {task.due_date && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                <CalendarOutlined /> {formatDueDate(task.due_date)}
              </Text>
            )}
          </Space>
          
          {!isCompleted && (
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => toggleTaskStatus(task)}
            />
          )}
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: "0", background: "#fafafa", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          background: "#fff",
          padding: "20px 24px",
          marginBottom: 24,
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            My Tasks
          </Title>
          <Text type="secondary">Manage your projects and tasks efficiently</Text>
        </div>
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => setHistoryModalOpen(true)}>
            History
          </Button>
          <Button icon={<ExportOutlined />} onClick={exportTasks}>
            Export
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => openGroupModal()}>
            New Group
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openTaskModal()}
            disabled={!selectedGroup}
          >
            New Task
          </Button>
        </Space>
      </div>

      {/* Stats Bar */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Statistic 
                title="Total Tasks" 
                value={stats.total} 
                valueStyle={{ fontSize: 28 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderColor: "#52c41a",
              }}
            >
              <Statistic 
                title="Completed" 
                value={stats.completed} 
                valueStyle={{ fontSize: 28, color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderColor: "#1890ff",
              }}
            >
              <Statistic 
                title="In Progress" 
                value={stats.inProgress} 
                valueStyle={{ fontSize: 28, color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderColor: "#f5222d",
              }}
            >
              <Statistic 
                title="Overdue" 
                value={stats.overdue} 
                valueStyle={{ fontSize: 28, color: "#f5222d" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Sidebar - Groups & Stats */}
        <Col xs={24} md={6}>
          {/* Groups */}
          <Card
            title={
              <Space>
                <GroupOutlined />
                <span>Groups</span>
              </Space>
            }
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              marginBottom: 16,
            }}
            bodyStyle={{ padding: "12px" }}
          >
            <List
              loading={loading}
              dataSource={groups}
              locale={{ emptyText: "No groups yet" }}
              renderItem={(group) => {
                const groupTasks = tasks.filter(t => t.group_id === group.id);
                const groupProgress = groupTasks.length > 0
                  ? Math.round(groupTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / groupTasks.length)
                  : 0;
                
                return (
                  <div
                    onClick={() => {
                      setSelectedGroup(group.id);
                      fetchTasksByGroup(group.id);
                    }}
                    style={{
                      padding: "12px",
                      cursor: "pointer",
                      borderRadius: 8,
                      marginBottom: 8,
                      background: selectedGroup === group.id ? "#e6f7ff" : "transparent",
                      border: selectedGroup === group.id ? "1px solid #1890ff" : "1px solid transparent",
                      transition: "all 0.3s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong ellipsis>{group.name}</Text>
                        {group.description && (
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                              {group.description}
                            </Text>
                          </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                          <Progress 
                            percent={groupProgress} 
                            size="small" 
                            strokeColor="#1890ff"
                            showInfo={false}
                          />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {groupProgress}% Complete
                          </Text>
                        </div>
                      </div>
                      <Space onClick={(e) => e.stopPropagation()} style={{ marginLeft: 8 }}>
                        <EditOutlined
                          onClick={() => openGroupModal(group)}
                          style={{ cursor: "pointer", color: "#1890ff", fontSize: 14 }}
                        />
                        <Popconfirm
                          title="Delete this group?"
                          onConfirm={() => handleGroupDelete(group.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <DeleteOutlined
                            style={{ cursor: "pointer", color: "#ff4d4f", fontSize: 14 }}
                          />
                        </Popconfirm>
                      </Space>
                    </div>
                  </div>
                );
              }}
            />
          </Card>

          {/* Quick Stats */}
          {selectedGroup && (
            <Card
              title={
                <Space>
                  <TrophyOutlined />
                  <span>Statistics</span>
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Overall Progress</Text>
                  <Progress 
                    percent={stats.avgProgress} 
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: '#ff4d4f', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto 8px'
                    }}>
                      <Text strong style={{ color: '#fff', fontSize: 12 }}>{stats.high}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>High</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: '#faad14', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto 8px'
                    }}>
                      <Text strong style={{ color: '#fff', fontSize: 12 }}>{stats.medium}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Medium</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: '#52c41a', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto 8px'
                    }}>
                      <Text strong style={{ color: '#fff', fontSize: 12 }}>{stats.low}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>Low</Text>
                  </div>
                </div>

                {stats.overdue > 0 && (
                  <div style={{ 
                    background: "#fff2e8", 
                    padding: 8, 
                    borderRadius: 8,
                    border: "1px solid #ffbb96"
                  }}>
                    <Space>
                      <WarningOutlined style={{ color: "#fa8c16" }} />
                      <Text style={{ fontSize: 12 }}>
                        <Text strong style={{ color: "#fa8c16" }}>{stats.overdue}</Text> overdue tasks
                      </Text>
                    </Space>
                  </div>
                )}
              </Space>
            </Card>
          )}
        </Col>

        {/* Main Content - Tasks */}
        <Col xs={24} md={18}>
          {selectedGroup ? (
            <div>
              {/* Controls Bar */}
              <Card
                bordered={false}
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  marginBottom: 16,
                }}
                bodyStyle={{ padding: "16px 24px" }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} md={8}>
                    <Input
                      placeholder="Search tasks..."
                      prefix={<SearchOutlined />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      allowClear
                      size="large"
                    />
                  </Col>
                  <Col xs={24} md={16}>
                    <Space wrap>
                      <Select
                        placeholder="Priority"
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                        style={{ width: 120 }}
                      >
                        <Option value="all">All Priority</Option>
                        <Option value="HIGH">High</Option>
                        <Option value="MEDIUM">Medium</Option>
                        <Option value="LOW">Low</Option>
                      </Select>
                      
                      <Select
                        placeholder="Status"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 140 }}
                      >
                        <Option value="all">All Status</Option>
                        <Option value="TODO">To Do</Option>
                        <Option value="IN_PROGRESS">In Progress</Option>
                        <Option value="DONE">Done</Option>
                      </Select>
                      
                      <Select
                        placeholder="Sort by"
                        value={sortBy}
                        onChange={setSortBy}
                        style={{ width: 140 }}
                      >
                        <Option value="created">Created Date</Option>
                        <Option value="priority">Priority</Option>
                        <Option value="title">Title</Option>
                        <Option value="due_date">Due Date</Option>
                      </Select>
                      
                      <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                        <Radio.Button value="list"><UnorderedListOutlined /></Radio.Button>
                        <Radio.Button value="grid"><AppstoreOutlined /></Radio.Button>
                      </Radio.Group>
                      
                      <Switch
                        checkedChildren="Show Completed"
                        unCheckedChildren="Hide Completed"
                        checked={showCompleted}
                        onChange={setShowCompleted}
                      />
                    </Space>
                  </Col>
                </Row>
                
                {/* Batch Actions */}
                {selectedTasks.length > 0 && (
                  <div style={{ 
                    marginTop: 16, 
                    padding: 12, 
                    background: "#e6f7ff", 
                    borderRadius: 8,
                    border: "1px solid #91d5ff"
                  }}>
                    <Space>
                      <Text strong>{selectedTasks.length} tasks selected</Text>
                      <Button 
                        size="small" 
                        icon={<CheckOutlined />}
                        onClick={handleBatchComplete}
                      >
                        Complete
                      </Button>
                      <Button 
                        size="small" 
                        icon={<ArrowRightOutlined />}
                        onClick={handleBatchStart}
                      >
                        Start
                      </Button>
                      <Button 
                        size="small" 
                        onClick={selectAllTasks}
                      >
                        Select All
                      </Button>
                      <Button 
                        size="small" 
                        icon={<CloseOutlined />}
                        onClick={clearSelection}
                      >
                        Clear
                      </Button>
                      <Popconfirm
                        title="Delete selected tasks?"
                        onConfirm={handleBatchDelete}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button 
                          size="small" 
                          danger 
                          icon={<DeleteOutlined />}
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                )}
              </Card>

              {/* Priority Tabs */}
              <Card
                bordered={false}
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  marginBottom: 16,
                }}
                bodyStyle={{ padding: "12px 24px" }}
              >
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                  <TabPane 
                    tab={
                      <Badge count={stats.total} showZero>
                        <span>All Tasks</span>
                      </Badge>
                    } 
                    key="all" 
                  />
                  <TabPane 
                    tab={
                      <Badge count={stats.high} showZero style={{ background: "#ff4d4f" }}>
                        <Space>
                          <FireOutlined style={{ color: "#ff4d4f" }} />
                          <span>High</span>
                        </Space>
                      </Badge>
                    } 
                    key="high" 
                  />
                  <TabPane 
                    tab={
                      <Badge count={stats.medium} showZero style={{ background: "#faad14" }}>
                        <Space>
                          <ThunderboltOutlined style={{ color: "#faad14" }} />
                          <span>Medium</span>
                        </Space>
                      </Badge>
                    } 
                    key="medium" 
                  />
                  <TabPane 
                    tab={
                      <Badge count={stats.low} showZero style={{ background: "#52c41a" }}>
                        <Space>
                          <FlagOutlined style={{ color: "#52c41a" }} />
                          <span>Low</span>
                        </Space>
                      </Badge>
                    } 
                    key="low" 
                  />
                </Tabs>
              </Card>

              {/* Tasks Content */}
              {loading ? (
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                  bodyStyle={{ padding: 40, textAlign: "center" }}
                >
                  <Progress type="circle" percent={70} />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">Loading tasks...</Text>
                  </div>
                </Card>
              ) : filteredTasks.length > 0 ? (
                <div>
                  {/* Active Tasks Section */}
                  {activeTasks.length > 0 && (
                    <Card
                      bordered={false}
                      style={{
                        borderRadius: 12,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        marginBottom: 16,
                      }}
                      bodyStyle={{ padding: "20px" }}
                    >
                      <Collapse
                        defaultActiveKeys={["active"]}
                        ghost
                        expandIconPosition="end"
                      >
                        <Panel
                          header={
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Space>
                                <RiseOutlined style={{ color: "#1890ff" }} />
                                <Text strong style={{ fontSize: 15 }}>
                                  Active Tasks
                                </Text>
                                <Badge 
                                  count={activeTasks.length} 
                                  style={{ background: "#1890ff" }}
                                />
                              </Space>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Progress 
                                  type="circle" 
                                  percent={activeTasks.length > 0 ? Math.round(activeTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / activeTasks.length) : 0} 
                                  width={40}
                                  strokeWidth={8}
                                />
                              </div>
                            </div>
                          }
                          key="active"
                        >
                          {viewMode === "list" ? (
                            <List
                              dataSource={activeTasks}
                              renderItem={(task) => (
                                <TaskItem 
                                  key={task.id} 
                                  task={task} 
                                  comments={comments}
                                  isSelected={selectedTasks.includes(task.id)}
                                />
                              )}
                            />
                          ) : (
                            <Row gutter={[16, 16]}>
                              {activeTasks.map(task => (
                                <Col xs={24} sm={12} lg={8} key={task.id}>
                                  <TaskCard task={task} comments={comments} />
                                </Col>
                              ))}
                            </Row>
                          )}
                        </Panel>
                      </Collapse>
                    </Card>
                  )}

                  {/* Completed Tasks Section */}
                  {showCompleted && doneTasks.length > 0 && (
                    <Card
                      bordered={false}
                      style={{
                        borderRadius: 12,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                      bodyStyle={{ padding: "20px" }}
                    >
                      <Collapse ghost expandIconPosition="end">
                        <Panel
                          header={
                            <Space>
                              <CheckCircleOutlined style={{ color: "#52c41a" }} />
                              <Text strong style={{ fontSize: 15 }}>
                                Completed Tasks
                              </Text>
                              <Badge count={doneTasks.length} style={{ background: "#52c41a" }} />
                            </Space>
                          }
                          key="completed"
                        >
                          {viewMode === "list" ? (
                            <List
                              dataSource={doneTasks}
                              renderItem={(task) => (
                                <TaskItem 
                                  key={task.id} 
                                  task={task} 
                                  comments={comments}
                                  isSelected={selectedTasks.includes(task.id)}
                                />
                              )}
                            />
                          ) : (
                            <Row gutter={[16, 16]}>
                              {doneTasks.map(task => (
                                <Col xs={24} sm={12} lg={8} key={task.id}>
                                  <TaskCard task={task} comments={comments} />
                                </Col>
                              ))}
                            </Row>
                          )}
                        </Panel>
                      </Collapse>
                    </Card>
                  )}
                </div>
              ) : (
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                  bodyStyle={{ padding: 40, textAlign: "center" }}
                >
                  <Empty
                    description={
                      searchQuery ? "No tasks match your search" : "No tasks in this group"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => openTaskModal()}
                    >
                      Create Your First Task
                    </Button>
                  </Empty>
                </Card>
              )}
            </div>
          ) : (
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                height: "100%",
              }}
              bodyStyle={{ 
                padding: "60px 20px", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center" 
              }}
            >
              <Empty
                description={
                  <div style={{ textAlign: "center" }}>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      No Group Selected
                    </Title>
                    <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
                      Select a group or create a new one to start managing tasks
                    </Text>
                  </div>
                }
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => openGroupModal()}
                  size="large"
                >
                  Create Your First Group
                </Button>
              </Empty>
            </Card>
          )}
        </Col>
      </Row>

      {/* Group Modal */}
      <Modal
        title={editingGroup ? "Edit Group" : "Create New Group"}
        open={groupModalOpen}
        onOk={handleGroupSubmit}
        onCancel={() => setGroupModalOpen(false)}
        okText={editingGroup ? "Update" : "Create"}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Group Name *"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            size="large"
            autoFocus
          />
          <TextArea
            placeholder="Description (optional)"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            rows={4}
            showCount
            maxLength={200}
          />
        </Space>
      </Modal>

      {/* Task Modal */}
      <Modal
        title={editingTask ? "Edit Task" : "Create New Task"}
        open={taskModalOpen}
        onOk={() => taskForm.submit()}
        onCancel={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        okText={editingTask ? "Update" : "Create"}
        width={600}
        destroyOnClose
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleTaskSubmit}
          initialValues={{
            priority: "MEDIUM",
            status: "TODO",
            progress: 0,
            group_id: selectedGroup,
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Task Title"
                rules={[{ required: true, message: "Please enter task title" }]}
              >
                <Input placeholder="What needs to be done?" />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Task details (optional)" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="HIGH">
                    <Space>
                      <FireOutlined style={{ color: "#ff4d4f" }} />
                      High
                    </Space>
                  </Option>
                  <Option value="MEDIUM">
                    <Space>
                      <ThunderboltOutlined style={{ color: "#faad14" }} />
                      Medium
                    </Space>
                  </Option>
                  <Option value="LOW">
                    <Space>
                      <FlagOutlined style={{ color: "#52c41a" }} />
                      Low
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item name="due_date" label="Due Date">
                <DatePicker
                  style={{ width: "100%" }}
                  showTime={false}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="TODO">To Do</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="DONE">Done</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item name="progress" label="Progress (%)">
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                />
              </Form.Item>
            </Col>
            
            {!editingTask && (
              <Col span={24}>
                <Form.Item
                  name="group_id"
                  label="Group"
                  rules={[{ required: true, message: "Please select a group" }]}
                >
                  <Select>
                    {groups.map(group => (
                      <Option key={group.id} value={group.id}>
                        {group.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>

      {/* Comments Modal - ENHANCED */}
      <Modal
        title={
          <Space>
            <MessageOutlined />
            <span>Comments</span>
            {selectedTask && (
              <Text type="secondary" style={{ fontSize: 14 }}>
                {selectedTask.title}
              </Text>
            )}
          </Space>
        }
        open={commentModalOpen}
        onCancel={() => {
          setCommentModalOpen(false);
          setSelectedTask(null);
          setNewComment("");
          setEditingCommentId(null);
          setEditingCommentText("");
        }}
        footer={null}
        width={500}
        bodyStyle={{ maxHeight: "60vh", overflow: "auto" }}
      >
        <div style={{ marginBottom: 16 }}>
          {selectedTask && comments[selectedTask.id]?.length > 0 ? (
            <List
              dataSource={comments[selectedTask.id]}
              renderItem={(comment) => (
                <List.Item 
                  key={comment.id}
                  style={{ padding: "12px 0" }}
                >
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <Avatar 
                        size={32} 
                        style={{ 
                          backgroundColor: `#${comment.id?.toString().slice(-6) || '1890ff'}`,
                          flexShrink: 0 
                        }}
                      >
                        {comment.author ? comment.author[0].toUpperCase() : "U"}
                      </Avatar>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <Space size={4}>
                            <Text strong style={{ fontSize: 13 }}>
                              {comment.author || "User"}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {formatCommentDate(comment.created_at)}
                            </Text>
                          </Space>
                          
                          <Space size={4}>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => startEditingComment(comment)}
                              style={{ height: "auto", padding: "0 4px" }}
                            />
                            <Popconfirm
                              title="Delete this comment?"
                              onConfirm={() => handleDeleteComment(comment.id)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                style={{ height: "auto", padding: "0 4px" }}
                              />
                            </Popconfirm>
                          </Space>
                        </div>
                        
                        {editingCommentId === comment.id ? (
                          <div style={{ marginTop: 8 }}>
                            <Input.TextArea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              autoSize={{ minRows: 2, maxRows: 4 }}
                              autoFocus
                            />
                            <Space style={{ marginTop: 8 }}>
                              <Button
                                type="primary"
                                size="small"
                                icon={<SaveOutlined />}
                                onClick={() => handleUpdateComment(comment.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={cancelEditingComment}
                              >
                                Cancel
                              </Button>
                            </Space>
                          </div>
                        ) : (
                          <div style={{ 
                            background: "#fafafa", 
                            padding: 12, 
                            borderRadius: 8,
                            border: "1px solid #f0f0f0"
                          }}>
                            <Paragraph style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>
                              {comment.comment}
                            </Paragraph>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Empty 
              description="No comments yet" 
              style={{ margin: "20px 0" }}
            />
          )}
        </div>
        
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input.TextArea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onPressEnter={(e) => {
              if (e.ctrlKey || e.metaKey) {
                handleAddComment();
              }
            }}
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={500}
            showCount
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button 
              type="primary" 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              icon={<PlusOutlined />}
            >
              Add Comment
            </Button>
          </div>
        </Space>
      </Modal>

      {/* History Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <Text strong>Completed Tasks History</Text>
          </Space>
        }
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        width={800}
        footer={null}
      >
        {completedTasks.length > 0 ? (
          <Timeline>
            {completedTasks.slice(0, 10).map(task => (
              <Timeline.Item
                key={task.id}
                color="green"
                dot={<CheckCircleOutlined style={{ fontSize: '16px' }} />}
              >
                <div style={{ paddingLeft: 8 }}>
                  <Text strong>{task.title}</Text>
                  <div>
                    <Text type="secondary">
                      Completed on {new Date(task.updated_at || task.created_at).toLocaleDateString()}
                    </Text>
                  </div>
                  {task.description && (
                    <Paragraph type="secondary" ellipsis style={{ marginTop: 4 }}>
                      {task.description}
                    </Paragraph>
                  )}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Empty description="No completed tasks yet" />
        )}
      </Modal>
    </div>
  );
};

export default TasksAndGroups;