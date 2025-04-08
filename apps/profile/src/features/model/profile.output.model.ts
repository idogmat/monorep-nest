
import { Prisma } from 'node_modules/.prisma/profile-client';
import { Profile } from 'node_modules/.prisma/profile-client';

const profileWithSubscribers = {
  include: {
    subscribers: {
      include: {
        profile: true // Получаем связанные профили
      }
    },
    subscriptions: {
      include: {
        subscriber: true // Получаем связанные профили
      }
    },
  }
} as const;

// friends: {
//   include: {
//     subscriber: true,
//     profile: true
//   }
// }

export type ProfileWithSubscribers = Profile & Prisma.ProfileGetPayload<& typeof profileWithSubscribers>;
export type PaginationProfileWithSubscribers = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  items: ProfileWithSubscribers[] | [];
}
export class OutputProfileModel {
  id: string;
  userId: string;
  userName: string;
  photoUrl: { value: string };
  firstName: { value: string };
  lastName: { value: string };
  dateOfBirth: { value: string };
  country: { value: string };
  city: { value: string };
  aboutMe: { value: string };
  paymentAccount: boolean;
  followed: boolean;
  subscribers: number;
  subscriptions: number;
  createdAt: string
  // TODO remove excess fields ---- case
  yourProfile: true;
  yourFriend: true
}

export const OutputProfileModelMapper = (profile: ProfileWithSubscribers, _userId?: string): OutputProfileModel => {
  // console.log(profile)
  const outputModel = new OutputProfileModel();
  outputModel.id = profile.id;
  outputModel.userId = profile.userId;
  outputModel.userName = profile.userName;
  outputModel.photoUrl = { value: profile.photoUrl || '' };
  outputModel.firstName = { value: profile.firstName || '' };
  outputModel.lastName = { value: profile.lastName || '' };
  outputModel.dateOfBirth = { value: profile.dateOfBirth?.toISOString() || '' };
  outputModel.country = { value: profile.country || '' };
  outputModel.city = { value: profile.city || '' };
  outputModel.aboutMe = { value: profile.aboutMe || '' };
  outputModel.followed = followedCheck(profile.subscribers, _userId || '');
  // теперь уже хз
  // outputModel.yourProfile = profile.yourProfile;
  // outputModel.yourFriend = profile.yourFriend;
  outputModel.subscribers = getCount(profile.subscribers);
  outputModel.subscriptions = getCount(profile.subscriptions);
  outputModel.createdAt = profile.createdAt.toISOString();

  return outputModel;
};

const getCount = (array: ProfileWithSubscribers['subscribers']
  | ProfileWithSubscribers['subscriptions']) => array.length

const followedCheck = (array: ProfileWithSubscribers['subscribers'], id: string = '') => Boolean(array.find(e => e?.subscriberId === id))