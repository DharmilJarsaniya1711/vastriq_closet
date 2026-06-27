import { IDocument } from '../common';

export interface IUser extends IDocument {
  email: string;
  firstName: string;
  lastName: string;
}
