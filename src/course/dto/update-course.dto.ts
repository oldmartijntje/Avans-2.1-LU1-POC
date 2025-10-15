import { PartialType } from '@nestjs/mapped-types';
import { AddCourseDto } from './add-course.dto';

export class UpdateCourseDto extends PartialType(AddCourseDto) { }