import { applyDecorators, Type } from "@nestjs/common";
import { ApiBody, ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { UserProfileResponse } from "../../../../../../libs/proto/generated/profile";

export const ApiFileWithDto = <TModel extends Type<any>>(model: TModel, fileFieldName = 'file') => {
  const values = new model().swagger()

  return applyDecorators(
    ApiExtraModels(model),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileFieldName]: {
            format: 'binary',
            type: 'string',
          },
          ...Object.fromEntries(
            Object.entries(values).map(([key]) => [
              key,
              { type: 'string', default: values[key] },
            ]),
          ),
        },
      },
    }),
  );
};

export class UserProfileResponseDto implements UserProfileResponse {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: String })
  userName: string;

  @ApiProperty({ type: String })
  photoUrl: string;

  @ApiProperty({ type: String })
  firstName: string;

  @ApiProperty({ type: String })
  lastName: string;

  @ApiProperty({ type: String })
  dateOfBirth: string;

  @ApiProperty({ type: String })
  country: string;

  @ApiProperty({ type: String })
  city: string;

  @ApiProperty({ type: String })
  aboutMe: string;

  @ApiProperty({ type: Boolean })
  followed: boolean;

  @ApiProperty({ type: Number })
  subscribers: number;

  @ApiProperty({ type: Number })
  subscriptions: number;

  @ApiProperty({ type: String })
  createdAt: string;

}

