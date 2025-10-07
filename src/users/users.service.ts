import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    private users = [
        {
            "id": 1,
            "name": "Henk de Hopper",
            "email": "henkdehopper@gmail.com",
            "role": "ENGINEER"
        },
        {
            "id": 2,
            "name": "Mara Machtig",
            "email": "maramachtig@gmail.com",
            "role": "ADMIN"
        },
        {
            "id": 3,
            "name": "Kees Kerfstok",
            "email": "keeskerfstok@gmail.com",
            "role": "ENGINEER"
        },
        {
            "id": 4,
            "name": "John Doe",
            "email": "john.doe@gmail.com",
            "role": "INTERN"
        },
        {
            "id": 5,
            "name": "Jane Doe",
            "email": "jane.doe@gmail.com",
            "role": "INTERN"
        }
    ]
}
