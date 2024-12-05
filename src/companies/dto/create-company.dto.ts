//data transfer object class = object
import { IsNotEmpty } from 'class-validator';
export class CreateCompanyDto {

    @IsNotEmpty(
        {
            message: 'Name không được để trống'
        }
    )
    name:string;

    @IsNotEmpty(
        {
            message: 'Address không được để trống'
        }
    )
    address:string;


    @IsNotEmpty(
        {
            message: 'Description không được để trống'
        }
    )
    description:string;

}
