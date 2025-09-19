import User from "../models/userModel.js"


export const getAllUsers = async (req, res) => {
  try {
    const user = await User.find()

  res.status(200).json({ message : "all users fetched successfully" , users : user })
    
  } catch (error) {
    console.error(" error in getAllUsers" , error);
    res.status(500).json({ message : error.message }) 
  }  
}

export const getUserById = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message : "user not found"})
    }

    res.status(200).json({ message : "user fetched successfully" , user })
    
  } catch (error) {
    console.error(" error in get user by id" , error);
    res.status(500).json({ message : error.message })
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message : "user not found"})
    }
    
    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({ message : "user deleted successfully"})
  } catch (error) {
    console.error(" error in deletUser" , error);
    res.status(500).json({ message : error.message })
  }
}