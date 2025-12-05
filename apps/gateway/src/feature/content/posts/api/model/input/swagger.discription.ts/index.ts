import { applyDecorators, Type } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiExtraModels, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PostOutputModel, PostQueryOutputModel } from "../../output/post.output.model";


export const ApiFileWithDto = <TModel extends Type<any>>(model: TModel, fileFieldName = 'files') => {
  const dto = new model().swagger()

  return applyDecorators(
    ApiConsumes('multipart/form-data'), // <-- обязательно
    ApiExtraModels(model),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileFieldName]: {
            type: 'string',
            format: 'binary',
          },
          ...Object.fromEntries(
            Object.keys(dto).map((key) => [
              key,
              { type: 'string', default: dto[key] },
            ]),
          ),
        },
      },
    }),
  );
};

export const GetPostsApiQuery = () => {
  return applyDecorators(
    ApiQuery({ name: 'pageNumber', required: false }),
    ApiQuery({ name: 'pageSize', required: false }),
    ApiQuery({ name: 'sortBy', required: false }),
    ApiQuery({ name: 'sortDirection', required: false }),
    ApiResponse({
      status: 200,
      description: 'Successfully fetched post',
      type: PostQueryOutputModel
    })
  );
};

// export function UpdateProfileApiDecorator() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Обновление профиля пользователя',
//       description: 'Обновляет указанные поля профиля. Все поля необязательные.',
//     }),
//     ApiBody({ type: UpdateProfileModel }),
//     ApiResponse({ status: 200, description: 'Профиль успешно обновлен' }),
//     ApiResponse({ status: 400, description: 'Некорректные данные' }),
//     ApiResponse({ status: 401, description: 'Не авторизован' }),
//     ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
//   );
// }
