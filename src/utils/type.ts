export type CreateUserParams = {
  username: string;
  password: string;
  name: string;
  email: string;
  no_telepon: string;
};

export type UpdateUserParams = {
  username: string;
  password: string;
  name: string;
  email: string;
  no_telepon: string;
};

export type RolesParams = {
  roles_name: string;
};
