import { Controller, Get, Param } from '@nestjs/common';
import { DepartmentService } from './department.service';

@Controller('departments')
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}

    @Get('/:id')
    getDepartments(@Param('id') id: string) {
        return this.departmentService.getDepartmentsById(id);
    }
}
