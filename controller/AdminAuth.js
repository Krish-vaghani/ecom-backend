import Admin from "../models/Admin.js";
import { AdminLoginValidator } from "../validators/AdminAuthValidator.js";
import { GenerateAdminToken } from "../helper/helper.js";
import { comparepassword } from "../helper/helper.js";

export const AdminLogin = async (req, res) => {
  const { error } = AdminLoginValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).lean();
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await comparepassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = GenerateAdminToken(admin._id);
    return res.status(200).json({
      message: "Admin login successful.",
      data: {
        token,
        adminId: admin._id,
        email: admin.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
