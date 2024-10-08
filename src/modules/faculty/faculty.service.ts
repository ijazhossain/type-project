import httpStatus from 'http-status';
import AppError from '../../app/errors/AppError';
import { Faculty } from './faculty.model';
import { User } from '../user/user.model';
import mongoose from 'mongoose';
import { TFaculty } from './faculty.interface';
import QueryBuilder from '../../app/builder/QueryBuilder';
import { FacultySearchableFields } from './faculty.constant';

/* const getAllFacultiesFromDB = async (query: Record<string, unknown>) => {
  const queryObj = { ...query };
  const searchableFields = ['email', 'name.firstName', 'presentAddress'];
  let searchTerm = '';
  if (query?.searchTerm) {
    searchTerm = query?.searchTerm as string;
  }
  //searching
  const searchQuery = Faculty.find({
    $or: searchableFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: 'i' },
    })),
  });
  //Filtering
  const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  excludeFields.forEach((el) => delete queryObj[el]);
  const filterQuery = searchQuery.find(queryObj);
  //Sort
  let sort = '-createdAt';
  if (query?.sort) {
    sort = query.sort as string;
  }
  const sortQuery = filterQuery.sort(sort);
  //limit
  let page = 1;
  let limit = 10;
  let skip = 0;
  if (query.limit) {
    limit = Number(query.limit);
  }
  if (query.page) {
    page = Number(query.page);
    skip = (page - 1) * limit;
  }
  const paginateQuery = sortQuery.skip(skip);
  const limitQuery = paginateQuery.limit(limit);
  //Field limiting
  let fields = '-__v';
  if (query.fields) {
    fields = (query.fields as string).split(',').join(' ');
  }
  const fieldsQuery = await limitQuery.select(fields);
  return fieldsQuery;
}; */
const getAllFacultiesFromDB = async (query: Record<string, unknown>) => {
  const facultyQuery = new QueryBuilder(
    Faculty.find().populate('academicDepartment academicFaculty'),
    query,
  )
    .search(FacultySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await facultyQuery.modelQuery;
  const meta = await facultyQuery.countTotal();
  return {
    meta,
    result,
  };
};
const getSingleFacultyFromDB = async (id: string) => {
  if (!(await Faculty.isFacultyExists(id))) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty does not exists');
  }
  const result = await Faculty.findById(id);
  return result;
};
const deleteSingleFacultyFromDB = async (id: string) => {
  if (!(await Faculty.isFacultyExists(id))) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty does not exists');
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deletedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );
    if (!deletedFaculty) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete faculty');
    }
    const userId = deletedFaculty.user;
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true, session },
    );
    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    await session.commitTransaction();
    await session.endSession();
    return deletedFaculty;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();

    throw new Error(err);
  }
};
const updateSingleFacultyIntoDB = async (
  id: string,
  payload: Partial<TFaculty>,
) => {
  if (!(await Faculty.isFacultyExists(id))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Faculty do not found');
  }
  const { name, ...remainingFacultyData } = payload;
  const modifiedUpdateData: Record<string, unknown> = {
    ...remainingFacultyData,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdateData[`name.${key}`] = value;
    }
  }

  const result = await Faculty.findByIdAndUpdate(id, modifiedUpdateData, {
    new: true,
    runValidators: true,
  });
  return result;
};
export const FacultyServices = {
  getAllFacultiesFromDB,
  getSingleFacultyFromDB,
  deleteSingleFacultyFromDB,
  updateSingleFacultyIntoDB,
};
