import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {Field, ObjectType, ID, registerEnumType} from '@nestjs/graphql';
import {UserRole} from '../enums/user-role.enum';
import {UserStatus} from '../enums/user-status.enum';

registerEnumType(UserRole, {
    name: 'UserRole',
})

registerEnumType(UserStatus, {
    name: 'UserStatus',
})

@ObjectType()
@Entity()
export class User {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Field()
    @Column()
    email!: string;

    @Field()
    @Column()
    password!: string;

    @Field()
    @Column()
    name!: string;

    @Field()
    @Column({type: 'enum', enum: UserRole, default: UserRole.USER})
    role!: string;

    @Field()
    @Column({type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE})
    status!: string;

    @Field()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    createdAt!: Date;

    @Field()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    updatedAt!: Date;

    @Field()
    @Column({type: 'timestamptz', nullable: true})
    deletedAt!: Date;
}
