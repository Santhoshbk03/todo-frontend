import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  List,
  Space,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getGroupsApi,
  createGroupApi,
  updateGroupApi,
  deleteGroupApi,
} from "../service/groupservice.js";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  /* FETCH GROUPS */
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await getGroupsApi();
      setGroups(res.data);
    } catch {
      message.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  /* OPEN MODAL */
  const openModal = (group = null) => {
    setEditingGroup(group);
    setName(group?.name || "");
    setDescription(group?.description || "");
    setModalOpen(true);
  };

  /* CREATE / UPDATE */
  const handleSubmit = async () => {
    if (!name.trim()) {
      return message.warning("Group name is required");
    }

    try {
      if (editingGroup) {
        await updateGroupApi(editingGroup.id, { name, description });
        message.success("Group updated");
      } else {
        await createGroupApi({ name, description });
        message.success("Group created");
      }
      setModalOpen(false);
      fetchGroups();
    } catch {
      message.error("Operation failed");
    }
  };

  /* DELETE */
  const handleDelete = async (id) => {
    try {
      await deleteGroupApi(id);
      message.success("Group deleted");
      fetchGroups();
    } catch {
      message.error("Delete failed");
    }
  };

  return (
    <Card
      title="Groups"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          New Group
        </Button>
      }
    >
      <List
        loading={loading}
        dataSource={groups}
        locale={{ emptyText: "No groups created yet" }}
        renderItem={(group) => (
          <List.Item
            actions={[
              <EditOutlined
                key="edit"
                onClick={() => openModal(group)}
                style={{ cursor: "pointer" }}
              />,
              <Popconfirm
                title="Delete this group?"
                onConfirm={() => handleDelete(group.id)}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined 
                  key="delete" 
                  style={{ cursor: "pointer", color: "#ff4d4f" }} 
                />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={group.name}
              description={group.description || "No description"}
            />
          </List.Item>
        )}
      />

      {/* MODAL */}
      <Modal
        open={modalOpen}
        title={editingGroup ? "Edit Group" : "Create Group"}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editingGroup ? "Update" : "Create"}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onPressEnter={handleSubmit}
          />
          <Input.TextArea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </Space>
      </Modal>
    </Card>
  );
};

export default Groups;