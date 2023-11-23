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

export type PaymentParams = {
  reference_id: string;
  amount: string;
  customer: string;
  currency: string;
};
