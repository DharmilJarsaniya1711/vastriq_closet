export const getSingleIdContent = (modelName: string) => {
  let content = '';
  const joiSchema = `Joi.string().required()`;
  content += `@JoiSchema(${joiSchema})`;

  const swaggerSchema = `@ApiProperty({
        description: 'ID of ${modelName}',
        example: '638749402112a2071eb7ccdd',
        required: true,
        type: String,
    })
    `;
  content += swaggerSchema;

  const classProp = `id: string` + '\n';
  content += classProp;

  return content;
};
