export type IUser = {
  userName: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type UpdateUserInput = {
  userName: string;
  password: string;
  email: string;
};
