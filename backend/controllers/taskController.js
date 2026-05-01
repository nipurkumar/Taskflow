const Task = require("../models/Task");
const Project = require("../models/Project");

// Helper: check if user is member of project
const isMember = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, members: userId });
  return !!project;
};

// GET /api/tasks?project=:projectId — get tasks for a project
const getTasks = async (req, res) => {
  try {
    const { project, status, priority, assignee } = req.query;
    const filter = {};

    if (project) {
      if (!(await isMember(project, req.user._id))) {
        return res
          .status(403)
          .json({ message: "Not a member of this project" });
      }
      filter.project = project;
    } else {
      // Get all tasks from user's projects
      const userProjects = await Project.find({ members: req.user._id }).select(
        "_id",
      );
      filter.project = { $in: userProjects.map((p) => p._id) };
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate("assignee", "name email avatar color")
      .populate("project", "name color")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignee", "name email avatar color")
      .populate("project", "name color members")
      .populate("createdBy", "name");

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!(await isMember(task.project._id, req.user._id))) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tasks — create task (project owner/admin only)
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, status, priority, due } =
      req.body;
    if (!title || !project || !due) {
      return res
        .status(400)
        .json({ message: "Title, project, and due date are required" });
    }

    const proj = await Project.findOne({ _id: project, owner: req.user._id });
    if (!proj && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only project owner or admin can create tasks" });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      status,
      priority,
      due,
      createdBy: req.user._id,
    });
    await task.populate("assignee", "name email avatar color");
    await task.populate("project", "name color");
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/tasks/:id — update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isOwner = task.project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isAssignee = task.assignee?.toString() === req.user._id.toString();

    // Members can only update status
    if (!isOwner && !isAdmin) {
      if (isAssignee) {
        // Members can only change status
        const { status } = req.body;
        task.status = status || task.status;
        await task.save();
        await task.populate("assignee", "name email avatar color");
        return res.json(task);
      }
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    // Admin/owner can update all fields
    const { title, description, assignee, status, priority, due } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee) task.assignee = assignee;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (due) task.due = due;

    await task.save();
    await task.populate("assignee", "name email avatar color");
    await task.populate("project", "name color");
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/tasks/:id — delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isOwner = task.project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this task" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
