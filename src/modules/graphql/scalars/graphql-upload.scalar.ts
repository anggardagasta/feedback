import {Scalar, CustomScalar} from '@nestjs/graphql';

@Scalar('Upload')
export class GraphQLUploadScalar implements CustomScalar<any, any> {
    description = 'Upload custom scalar for file upload';

    parseValue(value: any) {
        return value; // No transformation needed for incoming value
    }

    serialize(value: any) {
        return value; // No transformation needed for outgoing value
    }

    parseLiteral(ast: any) {
        return ast.value; // Just pass the value
    }
}
