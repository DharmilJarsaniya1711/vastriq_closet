import { useFormContext } from 'react-hook-form';
import { TextInput, TextInputProps } from '@mantine/core';

export interface ControlledTextInputProps extends TextInputProps {
  name: string;
}

export const ControlledTextInput: React.FC<ControlledTextInputProps> = ({
  name,
  readOnly,
  ...props
}) => {
  const {
    register,
    formState: { errors, isLoading, isSubmitting },
  } = useFormContext();

  return (
    <TextInput
      {...props}
      {...register(name)}
      error={errors?.[name]?.message as string}
      aria-invalid={!!errors?.[name]?.message}
      readOnly={readOnly || isLoading || isSubmitting}
    />
  );
};
