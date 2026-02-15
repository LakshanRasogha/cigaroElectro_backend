import User from '../models/user.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import axios from 'axios'

export function registerUser(req, res) {
    
    const data = req.body

    data.password = bcrypt.hashSync(data.password, 10)

    const newUser = new User(data)

    newUser.save().then(() =>{
        res.json({message: "User registered successfully"})
    }).catch((error) => {
    
        return res.status(409).json({ message: "Email already exists" })
    
})

}

export function loginUser(req, res) {
    const data = req.body

    User.findOne({
        email: data.email
    }).then((user)=>{
        if(user == null){
            res.status(400).json({error: "user not found"})
        }else{
            if(user.isBlocked){
                res.status(403).json({error:"Your account is blocked please contact the admin"})
                return
            }

            const isPasswordCorrect = bcrypt.compareSync(data.password, user.password)
            if(isPasswordCorrect){
                const token = jwt.sign({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    phone: user.phone
                }, process.env.JWT_SECRET)

                res.json({message: "login successful", token: token, user:user})
           
            }else{
                res.status(401).json({error: "invalid password"})
            }
        }
    })
        
}

export function isItAdmin(req){
    let isAdmin = false

    if(req.user != null ){
        if(req.user.role == "admin"){
            isAdmin = true
        }
    }
    return isAdmin
}

export function isItCustomer(req){
    let isCustomer = false

    if(req.user != null ){
        if(req.user.role == "customer"){
            isCustomer = true
        }
    }
    return isCustomer
}

export async function getAllUsers(req, res){
    if(isItAdmin(req)){
        try{
            const users = await User.find()
            res.json(users)
        }catch(e){
            res.status(500).json({error:"Faild to get users details"})
        }
    }else{
        res.status(403).json({error:"Unauthorized access"})
    }
}

export async function blockOrUnblockUser(req, res){
    const email = req.params.email
    if(isItAdmin(req)){
        try{
            const user = await User.findOne(
                {
                    email:email
                }
            )
            if(user == null){
                res.status(404).json({error:"User not Found"})
                return
            }

            const isBlocked = !user.isBlocked

            await User.updateOne(
                {
                    email:email
                },
                {
                    isBlocked: isBlocked
                }
            )

            res.json({message:"User Blocked/Unblocked successfully"})
        }catch(e){
            res.status(500).json({error:"Faild to get user"})
        }
    }else{
        res.status(403).json({error:"Unauthorized"})
    }
    
}

export function getUser(req, res){
    if(req.user != null){
        res.json(req.user)
    }else{
        res.status(403).json({error:"User Not found"})
    }
}

export async function editUser(req, res) {
    const { email } = req.params;
    const { email: _, ...updateData} = req.body;

    if (!isItCustomer(req)) {
        return res.status(403).json({ error: "Unauthorized: Access denied" });
    }

    try {
        // Update the user
        const updatedUser = await User.findOneAndUpdate(
            { email: email },       
            { $set: updateData },   
            { 
                new: true,          
                runValidators: true 
            }
        ).select("-password");      // Security: Don't send the password back to the frontend

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


export async function changePassword(req, res) {
    const { email } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        // 1. Verify the current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ error: "Current password is incorrect" });

        // 2. Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // 3. Save the user (Mongoose will trigger pre-save hooks if you have them)
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// export async function loginWithGoogle(req,res){
//     //https://www.googleapis.com/oauth2/v3/userinfo
//     const accessToken = req.body.accessToken
//     console.log(accessToken)
//     try{   
//         const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
//             headers:{
//                 Authorization: `Bearer ${accessToken}`
//             }
//         })
//         console.log(response.data)
//         const user = await User.findOne({
//             email: response.data.email,
//         })
//         if(user != null){
//             const token = jwt.sign({
//                     firstName: user.firstName,
//                     lastName: user.lastName,
//                     email: user.email,
//                     role: user.role,
//                     profilePicture: user.profilePicture,
//                     phone: user.phone
//                 }, 
//                 process.env.JWT_SECRET
//             )

//                 res.json({message: "login successful", token: token, user:user})
//         }else{
//             const newUser = new User({
//               email: response.data.email,
//               password: "123",
//               firstName: response.data.given_name, 
//               lastName: response.data.family_name,
//               address: "Not Given",
//               phone: "Not given",
//               profilePicture: response.data.picture
//             })
//             const savedUser = await newUser.save()
//             const token = jwt.sign({
//                     firstName: user.firstName,
//                     lastName: user.lastName,
//                     email: user.email,
//                     role: user.role,
//                     profilePicture: user.profilePicture,
//                     phone: user.phone
//                 }, 
//                 process.env.JWT_SECRET
//             )
//             res.json({message: "Login successfull", token: token, user: savedUser})
//         }
//     }catch(e){
//         console.log(e)
//         res.status(500).json({error: "Failed to login with Google"})
//     }
// }