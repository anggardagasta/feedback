import {registerEnumType} from '@nestjs/graphql';

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

registerEnumType(UserRole, {
    name: 'UserRole',
    description: 'The roles a user can have',
});