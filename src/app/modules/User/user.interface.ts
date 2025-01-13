export type IUser = {
  userName: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type UpdateUserInput = {
  password: string;
  email: string;
};
