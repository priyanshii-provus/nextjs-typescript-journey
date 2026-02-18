import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  email: string
  password: string
  isVerified: boolean
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
})

const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default UserModel
