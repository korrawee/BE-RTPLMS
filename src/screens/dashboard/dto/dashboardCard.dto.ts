import { DepartmentforDashboardDto } from "src/department/dto/DepartmentforDashboard.dto";
import { ShiftforDashboardDto } from "src/shift/dto/ShiftForDashboard.dto";
// Dashboard APIs

// Requirements
// - departments of logged in account  FROM Department table
// - Productivity (กำลังการผลิต) FROM FROM Shift table
// - Shift member FROM Shift table
// - Checked-in member FROM Shift table
// - URI to detail page

export class DashboardCardDto {
    department: DepartmentforDashboardDto;
    shifts: Array<ShiftforDashboardDto>;
}