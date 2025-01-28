import { User } from '@/modules/m-user/users/entities/user.entity';

export class UserWithRoles extends User {
  roles: string[];
}
