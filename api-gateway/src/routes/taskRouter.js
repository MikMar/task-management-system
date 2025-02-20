const router = require("express").Router();
const taskController = require("../controllers/taskController");

// Create a new task
router.post("/", taskController.createTask);

// List all tasks with optional filters
router.get("/", taskController.listTasks);

// Get task details
router.get("/:id", taskController.getTaskById);

// Update task details
router.patch("/:id", taskController.updateTask);

// Delete a task
router.delete("/:id", taskController.deleteTask);

module.exports = router;
