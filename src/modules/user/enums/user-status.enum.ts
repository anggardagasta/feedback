import {registerEnumType} from '@nestjs/graphql';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

registerEnumType(UserStatus, {
    name: 'UserStatus',
    description: 'The status a user can have',
});