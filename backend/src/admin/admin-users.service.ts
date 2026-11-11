import { email } from "zod";
import {User} from "../users/user.model.js";
interface GetUsersOptions{
    page?:number;
    limit?:number;
    search?:string;
    status?:"active"|"suspended" |"deleted";
}
export const getAllUsers = async (options: GetUsersOptions = {}) => {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 10));

  const filter: Record<string, unknown> = {};

  if(options.status){
    filter.accountStatus= options.status;
  }
  if(options.search?.trim()){
    const search= options.search.trim();
    filter.$or=[{firstName:{$regex:search,$options:"i"}},
                 {lastName:{$regex:search,$options:"i"}},
                 {email:{$regex:search,$options:"i"}},

    ];
  }
  const[user, totalUsers]= await Promise.all([
    User.find(filter)
    .select("-__v")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
      User.countDocuments(filter)
  ]);
  return{
    user,
    pagination:{
        currentPage:page,
        limit,
        totalUsers,
        toatalPages:Math.ceil(totalUsers/limit)
    }
  };
};
export const getUserById= async(userId:string)=>{
    return User.findById(userId).select("-__v").lean();
};