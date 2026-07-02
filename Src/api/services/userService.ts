// Src/api/services/userService.ts
import { callApi } from '../apiClient';
import { USER } from '../endpoints';

export const userService = {
  /** DELETE /user/delete/:userId */
  deleteAccount: (userId: string | number) =>
    callApi<null, { message?: string }>({
      method: 'delete',
      url: USER.DELETE(userId),
    }),
};
