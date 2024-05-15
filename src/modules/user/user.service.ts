import config from '../../app/config';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateStudentId } from './user.utils';

const createStudentIntoDB = async (password: string, payload: TStudent) => {
  //create a user obj
  const userData: Partial<TUser> = {};

  //if password is not given use default password
  userData.password = password || (config.default_pass as string);

  //set student role
  userData.role = 'student';

  //Find academic semester info
  const admissionSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  );
  if (!admissionSemester) {
    throw new Error('Failed to create user');
  }
  //set manually generated Id
  userData.id = await generateStudentId(admissionSemester);
  //create a user
  const newUser = await User.create(userData);
  //create a student
  if (Object.keys(newUser).length) {
    //set id, _id as user
    payload.id = newUser.id;
    payload.user = newUser._id; //reference id
    const newStudent = await Student.create(payload);

    return newStudent;
  }
};
export const UserServices = {
  createStudentIntoDB,
};
