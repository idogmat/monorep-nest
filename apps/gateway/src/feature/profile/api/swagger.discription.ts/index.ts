import { applyDecorators, Type } from "@nestjs/common";
import { ApiBody, ApiExtraModels } from "@nestjs/swagger";
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
