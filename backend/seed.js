require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");

const COLORS = ["#7c3aed", "#2563eb", "#ec4899", "#06b6d4", "#10b981"];

const USERS = [
  {
    name: "Alex Rivera",
    email: "alex@taskflow.io",
    password: "demo123",
    role: "admin",
    color: "#7c3aed",
  },
  {
    name: "Sam Chen",
    email: "sam@taskflow.io",
    password: "demo123",
    role: "member",
    color: "#2563eb",
  },
  {
    name: "Priya Patel",
    email: "priya@taskflow.io",
    password: "demo123",
    role: "member",
    color: "#ec4899",
  },
  {
    name: "Jordan Kim",
    email: "jordan@taskflow.io",
    password: "demo123",
    role: "member",
    color: "#06b6d4",
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Project.deleteMany(),
    Task.deleteMany(),
  ]);
  console.log("Cleared existing data");

  // Create users
  const users = await Promise.all(
    USERS.map(async (u) => {
      const avatar = u.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return User.create({ ...u, avatar });
    }),
  );
  console.log(`Created ${users.length} users`);
  const [alex, sam, priya, jordan] = users;

  // Create projects
  const projects = await Promise.all([
    Project.create({
      name: "TaskFlow Redesign",
      description: "Complete UI/UX overhaul of the main product",
      color: "linear-gradient(90deg,#7c3aed,#2563eb)",
      owner: alex._id,
      members: [alex._id, sam._id, priya._id],
    }),
    Project.create({
      name: "Mobile App Launch",
      description: "iOS and Android app development and deployment",
      color: "linear-gradient(90deg,#06b6d4,#10b981)",
      owner: alex._id,
      members: [alex._id, sam._id, jordan._id],
    }),
    Project.create({
      name: "Marketing Campaign",
      description: "Q2 growth campaign across all digital channels",
      color: "linear-gradient(90deg,#ec4899,#f97316)",
      owner: alex._id,
      members: [alex._id, priya._id, jordan._id],
    }),
  ]);
  console.log(`Created ${projects.length} projects`);
  const [redesign, mobile, marketing] = projects;

  // Create tasks
  const today = new Date();
  const future = (days) =>
    new Date(today.getTime() + days * 86400000).toISOString().split("T")[0];
  const past = (days) =>
    new Date(today.getTime() - days * 86400000).toISOString().split("T")[0];

  await Task.create([
    {
      title: "Design new dashboard layout",
      description: "Wireframes and mockups for the new dashboard",
      project: redesign._id,
      assignee: sam._id,
      status: "done",
      priority: "high",
      due: past(10),
      createdBy: alex._id,
    },
    {
      title: "Implement glassmorphism components",
      description: "Reusable glass card components",
      project: redesign._id,
      assignee: priya._id,
      status: "progress",
      priority: "high",
      due: future(10),
      createdBy: alex._id,
    },
    {
      title: "Write API documentation",
      description: "Document all REST endpoints",
      project: redesign._id,
      assignee: sam._id,
      status: "todo",
      priority: "medium",
      due: future(20),
      createdBy: alex._id,
    },
    {
      title: "QA testing and bug fixes",
      description: "Full regression testing on all features",
      project: redesign._id,
      assignee: alex._id,
      status: "todo",
      priority: "low",
      due: future(25),
      createdBy: alex._id,
    },
    {
      title: "Setup React Native project",
      description: "Initialize project structure and configure CI/CD",
      project: mobile._id,
      assignee: sam._id,
      status: "done",
      priority: "high",
      due: past(15),
      createdBy: alex._id,
    },
    {
      title: "Build auth flow screens",
      description: "Login, signup, forgot password screens",
      project: mobile._id,
      assignee: jordan._id,
      status: "progress",
      priority: "high",
      due: future(5),
      createdBy: alex._id,
    },
    {
      title: "Integrate push notifications",
      description: "Setup Firebase Cloud Messaging",
      project: mobile._id,
      assignee: sam._id,
      status: "todo",
      priority: "medium",
      due: future(15),
      createdBy: alex._id,
    },
    {
      title: "Create social media assets",
      description: "Design assets for social platforms",
      project: marketing._id,
      assignee: priya._id,
      status: "done",
      priority: "medium",
      due: past(5),
      createdBy: alex._id,
    },
    {
      title: "Write blog posts",
      description: "4 blog posts for the campaign launch",
      project: marketing._id,
      assignee: priya._id,
      status: "progress",
      priority: "low",
      due: past(2),
      createdBy: alex._id,
    },
    {
      title: "Setup ad campaigns",
      description: "Google Ads and Meta campaign configuration",
      project: marketing._id,
      assignee: jordan._id,
      status: "todo",
      priority: "high",
      due: past(3),
      createdBy: alex._id,
    },
  ]);
  console.log("Created 10 tasks");

  console.log("\n✅ Seed complete!");
  console.log("Demo credentials:");
  USERS.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.role})`));
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
