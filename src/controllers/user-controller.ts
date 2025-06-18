import { Request, Response } from "express";
import { User } from "../models"; 
import HttpStatusCodes from "../constants/https-status-codes";
import { send } from "process";
import { sendSMS } from "../util/sms-utils";
import passwordUtil from "../util/password-util";
import Email from "../util/email-util";


interface IReqPagination extends Request {
    query: {
      limit: string;
      page: string;
      search: string;
    };
  }

   interface IReqCreateUser {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    picture?: string;
    phone?: string;
    password: string;
  }

  interface IReqUsersId extends Request<{ id: string }> {
      id: string;
}

  type IReqUpdateUser = Request<IReqUsersId, {}, Partial<IReqCreateUser>>;


export const getAllUsers = async (req: IReqPagination, res: any) => {
    try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
  
    const search = req.query.search || "";
  
    // List users in pagination
    // const response = await UserService.listAllUsers({ page, limit, search });
    const response = await User.find();
  
    return res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error", error });
    }
  };

export const getUserById = async (req: IReqUsersId, res: Response) => {
   console.log("Request Params:", req);
    const userId = req.params.id;
    console.log("User ID:", userId);
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: "User not found" });
    res.status(HttpStatusCodes.OK).json({ success: true, data: user });
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error", error });
  }
};

export const createUser = async (req: Request<{}, {}, IReqCreateUser>, res: Response) => {
    try {
      const { username, firstname, lastname, email, picture, phone, password } = req.body;

      const hashPassword: string = await passwordUtil.getHash(password);
  
      const newUser = new User({
        username,
        firstname,
        lastname,
        email,
        picture,
        phone,
        password :hashPassword
      });
  
      const savedUser = await newUser.save();
      if (savedUser.phone) {
        await sendSMS(`Hola amigo kesy hu theek hu?`, savedUser.phone);
      } else {
        console.log("Phone number not provided or empty.");
      }
      console.log("sending email to user", savedUser.email);
     
      const sendEmail = await new Email({ email})
      const emailProps = { token: "1234"}; 
      await sendEmail.sendForgotPassword(emailProps);
      console.log("email sent successfully!");
  
      res.status(HttpStatusCodes.OK).json({ success: true, data: savedUser });
    } catch (error) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ success: false, message: "Failed to create user", error });
    }
  };

export const updateUser = async (req: IReqUpdateUser, res: Response) => {
    const body = req.body;
    const Id = req.params.id;
  try {
    const updatedUser = await User.findByIdAndUpdate(Id, body, {
      new: true,
    });
    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update user", error });
  }
};

export const deleteUser = async (req: IReqUsersId, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: "User not found" });

    res.status(HttpStatusCodes.OK).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error", error });
  }
};

