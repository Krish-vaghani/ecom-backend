import User from "../models/User.js";
import { AuthValidator } from "../validators/Auth.js";
import { FindOne, SingleRecordOperation } from "../helper/commonquery.js";
import { comparepassword, GenerateToken, hashpassword } from "../helper/helper.js";

export const Register = async (req, res) => {
  const { error } = AuthValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, password } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: "Name is required for registration." });
  }
  try {
    const existing = await FindOne(User, { email });
    if (existing.status === 200) {
      return res.status(409).json({ message: "User already exists with this email." });
    }

    const hash = await hashpassword(password);
    const result = await SingleRecordOperation("i", User, { name, email, password: hash });
    return res.status(result.status).json({ message: "Registration successful.", data: result.data });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

export const Login = async (req, res) => {
  const { error } = AuthValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;
  try {
    const userFind = await FindOne(User, { email });
    if (userFind.status !== 200 || !userFind.data) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await comparepassword(password, userFind.data.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = GenerateToken(userFind.data._id);
    return res.status(200).json({ message: "Login successful.", data: { token } });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
