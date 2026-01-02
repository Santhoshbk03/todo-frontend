import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseurl } from "../helpers/url";
import {
  Card,
  Button,
  Input,
  Select,
  Form,
  Modal,
  Tag,
  Progress,
  Tooltip,
  Typography,
  List,
  Empty,
  Divider,
  Avatar,
  Space,
  Switch,
  Timeline,
  DatePicker,
  Badge,
  Dropdown,
  Menu,
  message,
  Popconfirm,
  Collapse,
  Row,
  Col,
  Tabs,
  Checkbox,
  InputNumber,
  Upload,
  Radio
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  StarOutlined,
  FireOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SortAscendingOutlined,
  MoreOutlined,
  CheckOutlined,
  LikeOutlined,
  CommentOutlined,
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
  CloseOutlined,
  SendOutlined,
  RetweetOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import '../styles/Task.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const Tasks = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [comments, setComments] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewArchived, setViewArchived] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState('created');
  const [searchQuery, setSearchQuery] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [quickTasks, setQuickTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [commentLoading, setCommentLoading] = useState({});

  // Get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch groups
  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${baseurl}/groups`, getAuthHeader());
      setGroups(response.data);
      if (response.data.length > 0 && !selectedGroup) {
        setSelectedGroup(response.data[0].id);
        fetchTasksByGroup(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      message.error('Failed to load groups');
    }
  };

  // Fetch tasks by group
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
      
      // Calculate stats
      calculateStats(tasksData);
      
      // Generate quick tasks
      generateQuickTasks(tasksData);
      
      // Fetch comments for all tasks
      fetchAllComments(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      message.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for all tasks
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

  // Calculate statistics
  const calculateStats = (taskList) => {
    const now = new Date();
    const stats = {
      total: taskList.length,
      completed: taskList.filter(t => t.status === 'DONE').length,
      inProgress: taskList.filter(t => t.status === 'IN_PROGRESS').length,
      overdue: taskList.filter(t => {
        if (t.due_date) {
          const dueDate = new Date(t.due_date);
          return dueDate < now && t.status !== 'DONE';
        }
        return false;
      }).length
    };
    setStats(stats);
  };

  // Generate quick tasks (frontend feature)
  const generateQuickTasks = (taskList) => {
    const quick = taskList
      .filter(task => task.status === 'TODO' && task.priority === 'HIGH')
      .slice(0, 3)
      .map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        estimatedTime: 30 // Default 30 minutes for quick tasks
      }));
    setQuickTasks(quick);
  };

  // Create or update task
  const handleSubmitTask = async (values) => {
    try {
      if (editingTask) {
        await axios.put(
          `${baseurl}/tasks/${editingTask.id}`,
          values,
          getAuthHeader()
        );
        message.success('Task updated!');
      } else {
        await axios.post(`${baseurl}/tasks`, values, getAuthHeader());
        message.success('Task created!');
      }
      
      fetchTasksByGroup(selectedGroup);
      form.resetFields();
      setIsTaskModalVisible(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
      message.error(error.response?.data?.message || 'Failed to save task');
    }
  };

  // Batch operations
  const handleBatchComplete = async () => {
    if (selectedTasks.length === 0) {
      message.warning('Please select at least one task');
      return;
    }

    try {
      const promises = selectedTasks.map(taskId =>
        axios.put(
          `${baseurl}/tasks/${taskId}`,
          { status: 'DONE', progress: 100 },
          getAuthHeader()
        )
      );
      
      await Promise.all(promises);
      message.success(`${selectedTasks.length} tasks completed!`);
      setSelectedTasks([]);
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error completing tasks:", error);
      message.error('Failed to complete tasks');
    }
  };

  const handleBatchStart = async () => {
    if (selectedTasks.length === 0) {
      message.warning('Please select at least one task');
      return;
    }

    try {
      const promises = selectedTasks.map(taskId =>
        axios.put(
          `${baseurl}/tasks/${taskId}`,
          { status: 'IN_PROGRESS', progress: 0 },
          getAuthHeader()
        )
      );
      
      await Promise.all(promises);
      message.success(`${selectedTasks.length} tasks started!`);
      setSelectedTasks([]);
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error starting tasks:", error);
      message.error('Failed to start tasks');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedTasks.length === 0) {
      message.warning('Please select at least one task');
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
      message.error('Failed to delete tasks');
    }
  };

  // Quick complete task (frontend feature)
  const quickCompleteTask = async (taskId) => {
    try {
      await axios.put(
        `${baseurl}/tasks/${taskId}`,
        { status: 'DONE', progress: 100 },
        getAuthHeader()
      );
      message.success('Task completed!');
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error completing task:", error);
      message.error('Failed to complete task');
    }
  };

  // Start task (frontend feature)
  const startTask = async (taskId) => {
    try {
      await axios.put(
        `${baseurl}/tasks/${taskId}`,
        { status: 'IN_PROGRESS', progress: 0 },
        getAuthHeader()
      );
      message.success('Task started!');
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error starting task:", error);
      message.error('Failed to start task');
    }
  };

  // Archive task (frontend feature)
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
        message.success('Task archived!');
        fetchTasksByGroup(selectedGroup);
      }
    } catch (error) {
      console.error("Error archiving task:", error);
      message.error('Failed to archive task');
    }
  };

  // Duplicate task (frontend feature)
  const duplicateTask = async (task) => {
    try {
      const { id, created_at, updated_at, ...taskData } = task;
      await axios.post(
        `${baseurl}/tasks`,
        { ...taskData, title: `${task.title} (Copy)` },
        getAuthHeader()
      );
      message.success('Task duplicated!');
      fetchTasksByGroup(selectedGroup);
    } catch (error) {
      console.error("Error duplicating task:", error);
      message.error('Failed to duplicate task');
    }
  };

  // Add comment
  const handleAddComment = async (taskId, commentText) => {
    try {
      setCommentLoading(prev => ({ ...prev, [taskId]: true }));
      await axios.post(
        `${baseurl}/comments/${taskId}`,
        { comment: commentText },
        getAuthHeader()
      );
      message.success('Comment added!');
      
      // Refresh comments for this task
      const response = await axios.get(
        `${baseurl}/comments/${taskId}`,
        getAuthHeader()
      );
      setComments(prev => ({
        ...prev,
        [taskId]: response.data
      }));
      
      setIsCommentModalVisible(false);
    } catch (error) {
      console.error("Error adding comment:", error);
      message.error('Failed to add comment');
    } finally {
      setCommentLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  // Export tasks (frontend feature)
  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tasks_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    message.success('Tasks exported successfully!');
  };

  // Import tasks (frontend feature)
  const importTasks = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        message.info(`Found ${importedTasks.length} tasks to import`);
        
        // Upload tasks
        for (const task of importedTasks) {
          await axios.post(`${baseurl}/tasks`, task, getAuthHeader());
        }
        
        message.success('Tasks imported successfully!');
        fetchTasksByGroup(selectedGroup);
      } catch (error) {
        console.error("Error importing tasks:", error);
        message.error('Invalid file format or server error');
      }
    };
    reader.readAsText(file);
  };

  // Filter and sort tasks
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(task => task.status !== 'DONE');
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'due_date':
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

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="linear-tasks-container">
      {/* Header */}
      <div className="header-section">
        
        <div className="header-right">
          <Space>
            <Button 
              icon={<HistoryOutlined />} 
              onClick={() => setIsHistoryModalVisible(true)}
            >
              History
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsTaskModalVisible(true)}
            >
              New Task
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col xs={12} sm={6}>
            <Card size="small" className="stat-card">
              <div className="stat-content">
                <Text type="secondary">Total Tasks</Text>
                <Title level={3} style={{ margin: '8px 0 0 0' }}>{stats.total}</Title>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="stat-card completed-stat">
              <div className="stat-content">
                <Text type="secondary">Completed</Text>
                <Title level={3} style={{ margin: '8px 0 0 0', color: '#52c41a' }}>{stats.completed}</Title>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="stat-card progress-stat">
              <div className="stat-content">
                <Text type="secondary">In Progress</Text>
                <Title level={3} style={{ margin: '8px 0 0 0', color: '#1890ff' }}>{stats.inProgress}</Title>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="stat-card overdue-stat">
              <div className="stat-content">
                <Text type="secondary">Overdue</Text>
                <Title level={3} style={{ margin: '8px 0 0 0', color: '#f5222d' }}>{stats.overdue}</Title>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Left Sidebar - Groups & Quick Actions */}
        <Col xs={24} md={6}>
          <Card className="sidebar-card">
            <div className="sidebar-header">
              <Title level={5}><GroupOutlined /> Groups</Title>
            </div>
            <div className="groups-list">
              {groups.map(group => (
                <div
                  key={group.id}
                  className={`group-item ${selectedGroup === group.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedGroup(group.id);
                    fetchTasksByGroup(group.id);
                  }}
                >
                  <div className="group-info">
                    <Text strong>{group.name}</Text>
                    
                  </div>
                  {/* <div className="group-stats">
                    <Text type="secondary">
                      {tasks.filter(t => t.status !== 'DONE').length} active
                    </Text>
                  </div> */}
                </div>
              ))}
            </div>

            {quickTasks.length > 0 && (
              <div className="quick-actions">
                <div className="sidebar-header">
                  <Title level={5}><FireOutlined /> Quick Actions</Title>
                </div>
                <div className="quick-tasks-list">
                  {quickTasks.map(task => (
                    <div key={task.id} className="quick-task">
                      <Text ellipsis>{task.title}</Text>
                      <Space>
                        <Button 
                          size="small" 
                          type="primary" 
                          onClick={() => startTask(task.id)}
                        >
                          Start
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => quickCompleteTask(task.id)}
                        >
                          Done
                        </Button>
                      </Space>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Main Content Area */}
        <Col xs={24} md={18}>
          <Card className="main-content-card">
            {/* Controls Bar */}
            <div className="controls-bar">
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
                <div className="batch-actions">
                  <Space>
                    <Text strong>{selectedTasks.length} selected</Text>
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
                    <Button 
                      size="small" 
                      icon={<CloseOutlined />}
                      onClick={clearSelection}
                    >
                      Clear
                    </Button>
                  </Space>
                </div>
              )}
            </div>

            {/* Tasks List/Grid */}
            <div className="tasks-container">
              {loading ? (
                <div className="loading-state">
                  <Progress type="circle" percent={70} />
                  <Text type="secondary">Loading tasks...</Text>
                </div>
              ) : getFilteredTasks().length > 0 ? (
                viewMode === 'list' ? (
                  <List
                    dataSource={getFilteredTasks()}
                    renderItem={task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        comments={comments[task.id] || []}
                        onEdit={() => {
                          setEditingTask(task);
                          form.setFieldsValue(task);
                          setIsTaskModalVisible(true);
                        }}
                        onComplete={() => quickCompleteTask(task.id)}
                        onStart={() => startTask(task.id)}
                        onArchive={() => archiveTask(task.id)}
                        onDuplicate={() => duplicateTask(task)}
                        onViewComments={() => {
                          setSelectedTask(task);
                          setIsCommentModalVisible(true);
                        }}
                        onAddComment={(comment) => handleAddComment(task.id, comment)}
                        isSelected={selectedTasks.includes(task.id)}
                        onSelect={() => toggleTaskSelection(task.id)}
                        getStatusColor={getStatusColor}
                        getPriorityColor={getPriorityColor}
                      />
                    )}
                  />
                ) : (
                  <div className="tasks-grid">
                    {getFilteredTasks().map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        comments={comments[task.id] || []}
                        onEdit={() => {
                          setEditingTask(task);
                          form.setFieldsValue(task);
                          setIsTaskModalVisible(true);
                        }}
                        onComplete={() => quickCompleteTask(task.id)}
                        onStart={() => startTask(task.id)}
                        onAddComment={(comment) => handleAddComment(task.id, comment)}
                        getStatusColor={getStatusColor}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </div>
                )
              ) : (
                <Empty
                  description={
                    searchQuery ? "No tasks match your search" : "No tasks in this group"
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setIsTaskModalVisible(true)}
                  >
                    Create First Task
                  </Button>
                </Empty>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Create/Edit Task Modal */}
      <Modal
        title={editingTask ? "Edit Task" : "Create New Task"}
        open={isTaskModalVisible}
        onCancel={() => {
          setIsTaskModalVisible(false);
          setEditingTask(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <TaskForm
          form={form}
          onSubmit={handleSubmitTask}
          editingTask={editingTask}
          groups={groups}
          selectedGroup={selectedGroup}
        />
      </Modal>

      {/* History Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <Text strong>Completed Tasks History</Text>
          </Space>
        }
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        width={800}
        footer={null}
      >
        <HistoryView completedTasks={completedTasks} />
      </Modal>

      {/* Comments Modal */}
      <Modal
        title={`Comments for "${selectedTask?.title}"`}
        open={isCommentModalVisible}
        onCancel={() => setIsCommentModalVisible(false)}
        width={700}
        footer={null}
      >
        {selectedTask && (
          <CommentsView
            task={selectedTask}
            comments={comments[selectedTask.id] || []}
            onAddComment={handleAddComment}
          />
        )}
      </Modal>
    </div>
  );
};

// Task Form Component
const TaskForm = ({ form, onSubmit, editingTask, groups, selectedGroup }) => (
  <Form
    form={form}
    layout="vertical"
    onFinish={onSubmit}
    initialValues={{
      priority: 'MEDIUM',
      status: 'TODO',
      group_id: selectedGroup,
      ...(editingTask || {})
    }}
  >
    <Row gutter={16}>
      <Col span={24}>
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: 'Please enter task title' }]}
        >
          <Input placeholder="Enter task title" size="large" />
        </Form.Item>
      </Col>
      
      <Col span={24}>
        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            rows={4}
            placeholder="Enter task description"
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={12}>
        <Form.Item
          name="group_id"
          label="Group"
          rules={[{ required: true, message: 'Please select a group' }]}
        >
          <Select placeholder="Select group" size="large">
            {groups.map(group => (
              <Option key={group.id} value={group.id}>{group.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={12}>
        <Form.Item
          name="priority"
          label="Priority"
        >
          <Select size="large">
            <Option value="LOW">Low</Option>
            <Option value="MEDIUM">Medium</Option>
            <Option value="HIGH">High</Option>
          </Select>
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={12}>
        <Form.Item
          name="status"
          label="Status"
        >
          <Select size="large">
            <Option value="TODO">To Do</Option>
            <Option value="IN_PROGRESS">In Progress</Option>
            <Option value="DONE">Done</Option>
          </Select>
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={12}>
        <Form.Item
          name="due_date"
          label="Due Date"
        >
          <DatePicker
            style={{ width: '100%' }}
            size="large"
            showTime
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={12}>
        <Form.Item
          name="progress"
          label="Progress"
        >
          <InputNumber
            min={0}
            max={100}
            formatter={value => `${value}%`}
            parser={value => value.replace('%', '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item style={{ marginTop: 24 }}>
      <Space>
        <Button type="primary" htmlType="submit" size="large">
          {editingTask ? 'Update Task' : 'Create Task'}
        </Button>
        <Button onClick={() => form.resetFields()} size="large">Reset</Button>
      </Space>
    </Form.Item>
  </Form>
);

// Task Item Component (List View)
const TaskItem = ({
  task,
  comments = [],
  onEdit,
  onComplete,
  onStart,
  onArchive,
  onDuplicate,
  onViewComments,
  onAddComment,
  isSelected,
  onSelect,
  getStatusColor,
  getPriorityColor
}) => {
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const isCompleted = task.status === 'DONE';
  
  const handleAddComment = async () => {
    if (commentText.trim()) {
      await onAddComment(commentText);
      setCommentText('');
      setShowCommentInput(false);
    }
  };

  return (
    <div className={`task-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}>
      <div className="task-main">
        <div className="task-select">
          <Checkbox checked={isSelected} onChange={onSelect} />
        </div>
        
        <div className="task-info">
          <div className="task-header">
            <div className="task-title-section">
              <Space>
                {isCompleted ? (
                  <CheckCircleOutlined className="task-status-icon completed" />
                ) : task.status === 'IN_PROGRESS' ? (
                  <ArrowRightOutlined className="task-status-icon in-progress" />
                ) : (
                  <ClockCircleOutlined className="task-status-icon todo" />
                )}
                <Text strong className="task-title">{task.title}</Text>
              </Space>
            </div>
            <div className="task-tags">
              <Space>
                <Tag color={getPriorityColor(task.priority)}>
                  {task.priority}
                </Tag>
                <Tag color={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </Tag>
                {task.due_date && (
                  <Tag color={new Date(task.due_date) < new Date() && task.status !== 'DONE' ? 'red' : 'blue'}>
                    <CalendarOutlined /> {new Date(task.due_date).toLocaleDateString()}
                  </Tag>
                )}
              </Space>
            </div>
          </div>
          
          {task.description && (
            <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: '8px 0' }}>
              {task.description}
            </Paragraph>
          )}
          
          <div className="task-meta">
            <Space>
              <Text type="secondary">
                <UserOutlined /> Created by {task.creator || 'User'}
              </Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">
                {new Date(task.created_at).toLocaleDateString()}
              </Text>
              {comments.length > 0 && (
                <>
                  <Text type="secondary">•</Text>
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<CommentOutlined />}
                    onClick={() => onViewComments(task.id)}
                  >
                    {comments.length}
                  </Button>
                </>
              )}
            </Space>
          </div>
          
          {task.progress !== null && task.progress > 0 && (
            <div className="task-progress">
              <Progress 
                percent={task.progress} 
                size="small" 
                strokeColor={task.progress === 100 ? '#52c41a' : '#1890ff'}
              />
            </div>
          )}
          
          {/* Quick comment input */}
          {showCommentInput && (
            <div className="quick-comment-input" style={{ marginTop: 12 }}>
              <Input.TextArea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                maxLength={500}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button size="small" onClick={() => setShowCommentInput(false)}>
                  Cancel
                </Button>
                <Button type="primary" size="small" onClick={handleAddComment}>
                  <SendOutlined /> Comment
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="task-actions">
          <Space>
            {!isCompleted && (
              <>
                <Tooltip title="Start Task">
                  <Button 
                    size="small" 
                    icon={<ArrowRightOutlined />}
                    onClick={() => onStart(task.id)}
                  />
                </Tooltip>
                <Tooltip title="Complete Task">
                  <Button 
                    size="small" 
                    type="primary" 
                    icon={<CheckOutlined />}
                    onClick={() => onComplete(task.id)}
                  />
                </Tooltip>
              </>
            )}
            <Tooltip title="Add Comment">
              <Button 
                size="small" 
                icon={<CommentOutlined />}
                onClick={() => setShowCommentInput(!showCommentInput)}
              />
            </Tooltip>
            <Dropdown overlay={
              <Menu>
                <Menu.Item icon={<EditOutlined />} onClick={onEdit}>
                  Edit
                </Menu.Item>
                <Menu.Item icon={<CopyOutlined />} onClick={onDuplicate}>
                  Duplicate
                </Menu.Item>
                <Menu.Item icon={<InboxOutlined />} onClick={onArchive}>
                  Archive
                </Menu.Item>
              </Menu>
            }>
              <Button size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </div>
      </div>
    </div>
  );
};

// Task Card Component (Grid View)
const TaskCard = ({ task, comments = [], onEdit, onComplete, onStart, onAddComment, getStatusColor, getPriorityColor }) => {
  const isCompleted = task.status === 'DONE';
  
  return (
    <Card className="task-card" size="small">
      <div className="task-card-header">
        <div className="task-card-title">
          <Text strong ellipsis>{task.title}</Text>
        </div>
        <Space>
          <Tag size="small" color={getPriorityColor(task.priority)}>
            {task.priority}
          </Tag>
          {isCompleted ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ClockCircleOutlined style={{ color: '#faad14' }} />
          )}
        </Space>
      </div>
      
      {task.description && (
        <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ margin: '12px 0' }}>
          {task.description}
        </Paragraph>
      )}
      
      <div className="task-card-meta">
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <CalendarOutlined /> Created: {new Date(task.created_at).toLocaleDateString()}
          </Text>
          {task.due_date && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <CalendarOutlined /> Due: {new Date(task.due_date).toLocaleDateString()}
            </Text>
          )}
          {comments.length > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <CommentOutlined /> {comments.length} comments
            </Text>
          )}
        </Space>
      </div>
      
      <Divider style={{ margin: '12px 0' }} />
      
      <div className="task-card-actions">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          {!isCompleted && (
            <Space>
              <Button size="small" icon={<ArrowRightOutlined />} onClick={() => onStart(task.id)}>
                Start
              </Button>
              <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => onComplete(task.id)}>
                Complete
              </Button>
            </Space>
          )}
          <Button size="small" icon={<EditOutlined />} onClick={onEdit} />
        </Space>
      </div>
    </Card>
  );
};

// History View Component
const HistoryView = ({ completedTasks }) => (
  <div className="history-view">
    <Tabs defaultActiveKey="1">
      <TabPane tab="Recent" key="1">
        {completedTasks.length > 0 ? (
          <Timeline>
            {completedTasks.slice(0, 10).map(task => (
              <Timeline.Item
                key={task.id}
                color="green"
                dot={<CheckCircleOutlined style={{ fontSize: '16px' }} />}
              >
                <div className="history-item">
                  <Text strong>{task.title}</Text>
                  <Text type="secondary">
                    Completed on {new Date(task.updated_at || task.created_at).toLocaleDateString()}
                  </Text>
                  {task.description && (
                    <Paragraph type="secondary" ellipsis>
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
      </TabPane>
      <TabPane tab="All" key="2">
        <List
          dataSource={completedTasks}
          renderItem={task => (
            <List.Item>
              <List.Item.Meta
                title={task.title}
                description={`Completed: ${new Date(task.updated_at || task.created_at).toLocaleString()}`}
              />
            </List.Item>
          )}
        />
      </TabPane>
    </Tabs>
  </div>
);

// Comments View Component
const CommentsView = ({ task, comments = [], onAddComment }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!commentText.trim()) {
      message.warning('Please enter a comment');
      return;
    }
    
    try {
      setLoading(true);
      await onAddComment(task.id, commentText);
      setCommentText('');
      message.success('Comment added!');
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comments-view">
      <div className="comment-input-section">
        <Input.TextArea
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          showCount
        />
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSubmit}
            loading={loading}
            disabled={!commentText.trim()}
          >
            Add Comment
          </Button>
        </div>
      </div>
      
      <Divider>Comments ({comments.length})</Divider>
      
      {comments.length > 0 ? (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div>
                    <Text strong>{comment.author || 'Anonymous'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(comment.created_at).toLocaleString()}
                    </Text>
                  </div>
                </Space>
              </div>
              <div className="comment-content">
                {comment.comment}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty description="No comments yet. Be the first to comment!" />
      )}
    </div>
  );
};

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'TODO': return 'warning';
    case 'IN_PROGRESS': return 'processing';
    case 'DONE': return 'success';
    default: return 'default';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'HIGH': return 'red';
    case 'MEDIUM': return 'orange';
    case 'LOW': return 'green';
    default: return 'blue';
  }
};

export default Tasks;