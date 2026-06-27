import { FieldWithSearchableFields } from '../../dto/list';

export const getSearchContent = (modelName: string, fields: FieldWithSearchableFields[]) => {
  let content = '';

  const swaggerSchema = `@ApiProperty({
        description: 'Search by ${modelName} ${fields.map((f) => f.name).join(',')}',
        example: 'test',
        required: false,
        type: String,
    })
    `;
  content += swaggerSchema;

  const classProp = 'search?: string' + '\n';
  content += classProp;

  return content;
};
