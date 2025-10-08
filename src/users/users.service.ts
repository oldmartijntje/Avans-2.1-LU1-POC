import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

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

    create(createUserDto: CreateUserDto): Promise<User> {
        const createdUser = new this.userModel({ ...createUserDto, ...{ uuid: uuidv4() } });
        return createdUser.save();
    }

    update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
        return this.userModel.findOneAndUpdate({ uuid }, updateUserDto, { new: true }).exec().then(user => {
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
