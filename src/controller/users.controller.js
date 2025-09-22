import User from '../models/users.js';
import { createAccessToken } from '../utility/jwt.js';
//-------------------------- LOGIN --------------------------
export async function logInAdmin(req, res, next) {
  const { email, password } = req.body;

  try {
    const userStored = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!userStored) {
      return res.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    const isMatch = await userStored.comparePassword(password.trim());
    if (!isMatch) {
      return res.status(400).send({
        status: "error",
        message: "Invalid password",
      });
    }

    const token = await createAccessToken(userStored);
    return res.status(200).send({
      status: "success",
      message: "Login successful",
      accessToken: token,
      data: {
        id: userStored._id,
        name: userStored.name,
        email: userStored.email,
        phoneNumber: userStored.phoneNumber,
        role: userStored.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
}

//--------------------------<< Sign Up >>--------------------------
export async function SignUp(req, res, next) {
  try {
    const data = {
      ...req.body,
      email: req.body.email.trim().toLowerCase(),
      avatar: req.file
        ? global.config.userPicturePath + req.file.filename
        : null,
      createdBy: req.user?.id || null,
    };

    const user = new User(data);
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

  res.status(201).send({
    status: "success",
    message: "Signed Up successfully",
    data: userObj
  });
  } catch (error) {
    next(error);
  }
}

//-------------------------- GET USERS --------------------------
export async function getUser(req, res, next) {
  try {
    const {
      limit = 10,
      page = 1,
      search = "",
      order = "desc",
      orderBy = "createdAt",
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const users = await User.find(query)
      .select("name email type role phoneNumber status")
      .sort({ [orderBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).send({
      status: "success",
      total,
      data: users,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

// Delete a user by ID
export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
  
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res
      .status(200)
      .json({ status: "success", message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}


