
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

export class OutputProfileModel {
  id: string;
  userId: string;
  photoUrl: string;
  paymentAccount: boolean;
  subscribers: number;
  subscriptions: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  country: string;
  city: string;
  // ---- case
  followed: boolean;
  yourProfile: true;
  yourFriend: true
}

export const OutputProfileModelMapper = (profile: ProfileWithSubscribers, _userId?: string): OutputProfileModel => {
  const outputModel = new OutputProfileModel();
  outputModel.id = profile.id;
  outputModel.userId = profile.userId;
  outputModel.photoUrl = profile.photoUrl;
  outputModel.firstName = profile.firstName;
  outputModel.lastName = profile.lastName;
  outputModel.dateOfBirth = profile.dateOfBirth;
  outputModel.country = profile.country;
  outputModel.city = profile.city;
  outputModel.followed = followedCheck(profile.subscribers, _userId || '');
  // точно нужны
  // outputModel.yourProfile = profile.yourProfile;
  // outputModel.yourFriend = profile.yourFriend;
  outputModel.subscribers = getCount(profile.subscribers);
  outputModel.subscriptions = getCount(profile.subscriptions);
  // console.log(profile)

  return outputModel;
};

const getCount = (array: ProfileWithSubscribers['subscribers']
  | ProfileWithSubscribers['subscriptions']) => array.length

const followedCheck = (array: ProfileWithSubscribers['subscribers'], id: string = '') => Boolean(array.find(e => e.subscriberId === id))