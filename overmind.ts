/*
 *  Write a function to check whether you have been successfully invited to the program.
 *  Given an array of users, the function should satisfies the conditions:
 * Return `true` if:
 *  - The `username` is identical to your username, rodonguyen
 *  - The `invitedBy` field is identical to another user's `inviteCode`
 * Else return `false`.
 */

export type User = {
	name: string,
	username: string,
	inviteCode: string,
	invitedBy?: string,
};

const MYSELF = 'rodonguyen';

export function amIInvited(users: User[]): boolean {
	for (const user of users) {
		// Check if the username is identical to MYSELF
		const is_username_exist = user.username === MYSELF;
		if (!is_username_exist) {
			continue;
		}

		// Check if invitedBy field is identical to another user's inviteCode
		const is_invited = user.invitedBy && users.some((otherUser) => otherUser.inviteCode === user.invitedBy);
		if (is_invited) {
			return true;
		}
	}

	// If no match is found, return false
	return false;
}
