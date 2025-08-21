import { applyDecorators, Type } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiExtraModels, ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { UserProfileResponse } from "../../../../../../libs/proto/generated/profile";
import { UpdateProfileModel } from '../model/input/update.profile.model';
import { PostUpdateModel } from '../../../posts/api/model/input/post.update.model';

export const ApiFileWithDto = <TModel extends Type<any>>(model: TModel, fileFieldName = 'file') => {
  const values = new model().swagger()

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
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

  @ApiProperty({ type: Boolean })
  paymentAccount: boolean;

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
export function UpdateProfileApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Обновление профиля пользователя',
      description: 'Обновляет указанные поля профиля. Все поля необязательные.',
    }),
    ApiBody({ type: UpdateProfileModel }),
    ApiResponse({ status: 200, description: 'Профиль успешно обновлен' }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  );
}
