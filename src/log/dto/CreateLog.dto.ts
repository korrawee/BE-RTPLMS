import { DetailsDto } from './Details.dto';

export class CreateLogDto {
    mng_id: string;
    action: string;
    details: DetailsDto;
}
