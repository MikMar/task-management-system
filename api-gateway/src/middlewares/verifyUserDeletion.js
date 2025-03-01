const verifyUserDeletion = (req, res, next) => {
  const { role, id } = req.user;
  const requestedUserId = req.params.user_id;

  // Allow if the user is an admin OR if they're deleting their own account
  if (role === "admin" || id === requestedUserId) {
    return next(); // User is authorized
  }

  return res
    .status(403)
    .json({ error: "Unauthorized: You cannot delete this user" });
};

module.exports = verifyUserDeletion;
