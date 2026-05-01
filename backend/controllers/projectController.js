const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

// GET /api/projects — get all projects user is member of
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id })
      .populate("owner", "name email avatar color")
      .populate("members", "name email avatar color")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/projects/:id — get single project
const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      members: req.user._id,
    })
      .populate("owner", "name email avatar color")
      .populate("members", "name email avatar color");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/projects — create project (admin only)
const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name)
      return res.status(400).json({ message: "Project name is required" });

    const project = await Project.create({
      name,
      description: description || "",
      color: color || "linear-gradient(90deg,#7c3aed,#2563eb)",
      owner: req.user._id,
    });
    await project.populate("owner members", "name email avatar color");
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/projects/:id — update project
const updateProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, description, color },
      { new: true },
    ).populate("owner members", "name email avatar color");
    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or not authorized" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/projects/:id — delete project and all its tasks
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or not authorized" });
    await Task.deleteMany({ project: req.params.id });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/projects/:id/members — add member by email
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found with that email" });

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or not authorized" });

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    project.members.push(user._id);
    await project.save();
    await project.populate("owner members", "name email avatar color");
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/projects/:id/members/:userId — remove member
const removeMember = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or not authorized" });

    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({ message: "Cannot remove project owner" });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId,
    );
    await project.save();
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
