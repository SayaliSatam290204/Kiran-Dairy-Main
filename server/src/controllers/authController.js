import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Shop from "../models/Shop.js";

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      location,
      ownerName,
      contactNo,
      address,
      isActive
    } = req.body;

    if (!name || !password || !role || (!email && !phone)) {
      return res
        .status(400)
        .json({ message: "Name, role, password and Email/Phone are required" });
    }

    let shopDoc = null;
    if (role === "shop") {
      if (!location || !ownerName || !contactNo || !address) {
        return res
          .status(400)
          .json({ message: "All shop fields are required" });
      }

      const existingShopByEmail = await Shop.findOne({ email });
      if (existingShopByEmail) {
        return res.status(409).json({ message: "Shop with this email already exists" });
      }
      const existingShopByPhone = await Shop.findOne({ contactNo });
      if (existingShopByPhone) {
        return res
          .status(409)
          .json({ message: "Shop with this contact number already exists" });
      }
      const existingUserByName = await User.findOne({ phone: name });
      if (existingUserByName) {
        return res.status(409).json({ message: "Shop name already taken" });
      }

      shopDoc = await Shop.create({
        name,
        location,
        ownerName,
        contactNo,
        email,
        address,
        isActive: isActive ?? true
      });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ message: "Email already registered" });
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({ message: "Phone already registered" });
      }
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const userPayload = {
      name,
      email: email || null,
      phone: phone || null,
      password: hashedPassword,
      role
    };
    if (shopDoc) {
      userPayload.shopId = shopDoc._id;
      userPayload.phone = name;
      userPayload.name = ownerName;
    }

    const user = await User.create(userPayload);

    const token = jwt.sign(
      { id: user._id, role: user.role, shopId: user.shopId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email || null,
          phone: user.phone || null,
          role: user.role,
          shopId: user.shopId,
          isActive: user.isActive
        },
        token
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email/Phone already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const authController = {
  // ✅ LOGIN (Admin: email + password) | (Shop: phone + password)
  login: async (req, res) => {
    try {
      const { email, phone, password } = req.body;

      if (!password || (!email && !phone)) {
        return res
          .status(400)
          .json({ message: "Email/Phone and password are required" });
      }

      // ✅ Find user by email or phone
      const query = email ? { email } : { phone };

      const user = await User.findOne(query).select("+password");
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // ✅ Check active
      if (user.isActive === false) {
        return res.status(403).json({ message: "Account is inactive" });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role, shopId: user.shopId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email || null,
            phone: user.phone || null,
            role: user.role,
            shopId: user.shopId,
            isActive: user.isActive
          },
          token
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  register: registerUser,

  registerAdmin: async (req, res) => {
    const requiredKey = process.env.ADMIN_REGISTRATION_KEY;
    if (requiredKey && req.body?.adminKey !== requiredKey) {
      return res.status(403).json({ message: "Invalid or missing admin key" });
    }
    return registerUser({ ...req, body: { ...req.body, role: "admin" } }, res);
  },

  adminExists: async (req, res) => {
    try {
      const count = await User.countDocuments({
        role: { $in: ["admin", "super-admin"] }
      });
      res.json({ exists: count > 0 });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};