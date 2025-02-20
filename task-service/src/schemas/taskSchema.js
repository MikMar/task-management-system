const z = require("zod");

const TaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  description: z.string().min(1, "Description cannot be empty"),
  assignedTo: z.string().min(1, "Assignee cannot be empty").nullable().optional(),
  status: z.enum(["open", "in progress", "closed"]).default("open"),
});

module.exports = { TaskSchema };
