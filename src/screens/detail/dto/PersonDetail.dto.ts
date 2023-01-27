export class PersonDetailDto{
    id: string;
    name: string;
    performance: number;
    checkInTime: string;
    checkOutTime: string;
    checkInStatus: string;
    otStatus?: string;
    otDuration?: number;
}