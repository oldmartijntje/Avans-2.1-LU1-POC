import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    findAll(role?: 'TEACHER' | 'STUDENT' | 'ADMIN'): Promise<User[]> {
        if (role) {
            return this.userModel.find({ role }).exec();
        }
        return this.userModel.find().exec();
    }

    findOne(uuid: string): Promise<User> {
        return this.userModel.findOne({ uuid }).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            return user;
        });
    }

    findOneByName(name: string): Promise<User> {
        return this.userModel.findOne({ name }).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            return user;
        });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // ensure username not already taken
        const existing = await this.userModel.findOne({ name: createUserDto.name }).exec().catch(() => null);
        if (existing) {
            throw new ConflictException('Username already taken');
        }

        // hash password before saving
        const dto: any = { ...createUserDto };
        if (dto.password) {
            const saltRounds = 10;
            dto.password = bcrypt.hashSync(dto.password, saltRounds);
        }
        const createdUser = new this.userModel({ ...dto, ...{ uuid: uuidv4() } });
        return createdUser.save();
    }

    update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
        const dto: any = { ...updateUserDto };
        // if password is provided, hash it before updating
        if (dto.password) {
            const saltRounds = 10;
            dto.password = bcrypt.hashSync(dto.password, saltRounds);
        }
        return this.userModel.findOneAndUpdate({ uuid }, dto, { new: true }).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            return user;
        });
    }

    delete(uuid: string): Promise<User> {
        return this.userModel.findOneAndDelete({ uuid }).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            return user;
        });
    }
}
