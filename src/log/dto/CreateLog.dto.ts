import { DetailsDto } from "./details.dto";

export class CreateLogDto {
    mng_id: string;
    action: string;
    details: DetailsDto;
}