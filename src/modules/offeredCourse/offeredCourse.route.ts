import { Router } from 'express';
import { OfferedCourseControllers } from './offeredCourse.controller';

import { OfferedCourseValidations } from './offeredCourse.validation';
import validateRequest from '../../app/middlewares/validateRequest';
import auth from '../../app/utils/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router();
router.post(
  '/create-offered-course',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(OfferedCourseValidations.createOfferedCourseValidationSchema),
  OfferedCourseControllers.createOfferedCourse,
);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty),
  OfferedCourseControllers.getAllOfferedCourses,
);
router.get(
  '/my-offered-courses',
  auth(USER_ROLE.student),
  OfferedCourseControllers.getMyOfferedCourses,
);
router.get(
  '/:id',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.admin,
    USER_ROLE.faculty,
    USER_ROLE.student,
  ),
  OfferedCourseControllers.getSingleOfferedCourse,
);
router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(OfferedCourseValidations.updateOfferedCourseValidationSchema),
  OfferedCourseControllers.updateOfferedCourse,
);
router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  OfferedCourseControllers.deleteOfferedCourse,
);
export const OfferedCourseRoutes = router;
