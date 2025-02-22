const z = require("zod");
const { checkUserExists } = require("../helpers/helper");

const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  description: z.string().min(1, "Description cannot be empty"),
  assignedTo: z
    .string()
    .min(1, "Assignee cannot be empty")
    .nullable()
    .optional()
    .refine(
      async (userId) => {
        if (!userId) return true;
        return await checkUserExists(userId);
      },
      {
        message: "Assigned user does not exist",
      }
    ),
  status: z.enum(["open", "in progress", "closed"]).default("open"),
});

const UpdateTaskSchema = CreateTaskSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

module.exports = { CreateTaskSchema, UpdateTaskSchema };
