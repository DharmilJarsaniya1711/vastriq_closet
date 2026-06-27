import { useMutation } from '@tanstack/react-query';

import { submitContact } from '../requests/contact.requests';

export const useSubmitContact = () => useMutation({ mutationFn: submitContact });
