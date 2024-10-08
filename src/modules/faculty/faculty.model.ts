import { Schema, model } from 'mongoose';
import { FacultyModel, TFaculty, TUserName } from './faculty.interface';
import { BloodGroup, Gender } from './faculty.constant';

const userNameSchema = new Schema<TUserName>({
  firstName: { type: String, required: [true, 'FirstName is required'] },
  middleName: { type: String, required: [true, 'MiddleName is required'] },
  lastName: { type: String, required: [true, 'LastName is required'] },
});
const facultySchema = new Schema<TFaculty>(
  {
    id: {
      type: String,
      required: [true, 'Faculty id is required'],
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User id is required'],
      unique: true,
      ref: 'User',
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
    },
    name: {
      type: userNameSchema,
      required: [true, 'Faculty Name is required'],
    },
    gender: {
      type: String,
      enum: { values: Gender, message: '{VALUE} is not a valid gender' },
      required: [true, 'Faculty gender is required'],
    },
    dateOfBirth: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Faculty email is required'],
    },
    contactNo: {
      type: String,
      required: [true, 'Faculty contactNo is required'],
    },
    emergencyContactNo: {
      type: String,
      required: [true, 'Faculty emergencyContactNo is required'],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BloodGroup,
        message: '{VALUE} is not a valid blood group',
      },
      required: [true, 'Faculty bloodGroup is required'],
    },
    presentAddress: {
      type: String,
      required: [true, 'Faculty presentAddress is required'],
    },
    permanentAddress: {
      type: String,
      required: [true, 'Faculty permanentAddress is required'],
    },
    profileImg: {
      type: String,
    },

    academicDepartment: {
      type: Schema.Types.ObjectId,
      required: [true, 'Academic Department is required'],
      ref: 'AcademicDepartment',
    },
    academicFaculty: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicFaculty',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
facultySchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
facultySchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
facultySchema.statics.isFacultyExists = async function (id: string) {
  const existingUser = await Faculty.findById(id);
  return existingUser;
};
export const Faculty = model<TFaculty, FacultyModel>('Faculty', facultySchema);
