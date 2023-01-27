export class CreateOtRequestDto {
    shiftCode: string;
    date: string;
    method: string;
    mngId: string;
    unit?: string;
    quantity?: number;
    accountIds?: string[];
}