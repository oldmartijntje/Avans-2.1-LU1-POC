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
            const { password, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword;
        });
    }

    findOneByName(username: string): Promise<User> {
        return this.userModel.findOne({ username }).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            const { password, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword;
        });
    }

    getByUuid(uuid: string): Promise<User> {
        if (!uuid) {
            throw new NotFoundException('User Not Found');
        }
        return this.userModel.findOne({ uuid }).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            return user;
        });
    }

    findOneByNameForAuth(username: string): Promise<User> {
        return this.userModel.findOne({ username }).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            return user; // Include the password for authentication purposes
        });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // ensure username not already taken
        const existing = await this.userModel.findOne({ username: createUserDto.username }).exec().catch(() => null);
        if (existing) {
            throw new ConflictException('Username already taken');
        }

        // hash password before saving
        const dto: any = { ...createUserDto };
        if (dto.password) {
            const saltRounds = 10;
            dto.password = bcrypt.hashSync(dto.password, saltRounds);
        }
        const createdUser = new this.userModel({
            ...dto,
            ...{ uuid: uuidv4() },
            ...{
                favourites: [],
                study: null
            }
        });
        const savedUser = await createdUser.save();
        const { password, ...userWithoutPassword } = savedUser.toObject();
        return userWithoutPassword;
    }

    async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
        const dto: any = { ...updateUserDto };

        // ensure username not already taken by another user
        if (dto.username) {
            const existing = await this.userModel.findOne({ username: dto.username, uuid: { $ne: uuid } }).exec().catch(() => null);
            if (existing) {
                throw new ConflictException('Username already taken');
            }
        }

        // if password is provided, hash it before updating
        if (dto.password) {
            const saltRounds = 10;
            dto.password = bcrypt.hashSync(dto.password, saltRounds);
        }
        return this.userModel.findOneAndUpdate({ uuid }, dto, { new: true }).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            const { password, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword;
        });
    }

    delete(uuid: string): Promise<User> {
        return this.userModel.findOneAndDelete({ uuid }).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            const { password, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword;
        });
    }

    async addFavourite(uuid: string, favouriteId: string): Promise<User> {
        return this.userModel.findOneAndUpdate(
            { uuid },
            { $addToSet: { favourites: favouriteId } }, // $addToSet ensures no duplicates
            { new: true }
        ).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            const { password, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword;
        });
    }

    async removeFavourite(uuid: string, favouriteId: string): Promise<User> {
        return this.userModel.findOneAndUpdate(
            { uuid },
            { $pull: { favourites: favouriteId } }, // $pull removes the item from the array
            { new: true }
        ).exec().then(user => {
            if (!user) {
                throw new NotFoundException('User Not Found');
            }
            const { password, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword;
        });
    }
}
