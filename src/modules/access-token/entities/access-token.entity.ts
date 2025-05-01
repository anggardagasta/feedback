import {Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';
import {Field, ObjectType} from '@nestjs/graphql';

@ObjectType()
@Entity()
export class AccessToken {
    @Field()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Field()
    @Index()
    @Column('uuid')
    userId!: string;

    @Field()
    @Index({unique: true})
    @Column()
    token!: string;

    @Field()
    @Column({default: false})
    isValid!: boolean;

    @Field()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    expiresAt!: Date;

    @Field()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    createdAt!: Date;
}
