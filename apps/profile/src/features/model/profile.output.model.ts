
import { Subscribable } from 'rxjs';
import { Profile, Subscription, Prisma } from '../../../prisma/generated/profile-client';

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

const profileWithSubscribersGql = {
  include: {
    profile: true, // Получаем связанные профили
    subscriber: true // Получаем связанные профили
  }
} as const;

export type ProfileWithSubscribers = Profile & Prisma.ProfileGetPayload<& typeof profileWithSubscribers>;
export type ProfileWithSubscribersGql = Subscription & Prisma.SubscriptionGetPayload<& typeof profileWithSubscribersGql>;

export type PaginationProfileWithSubscribers = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  items: ProfileWithSubscribers[] | [];
}

export type PaginationProfileWithSubscribersGql = {
  totalCount: number;
  items: ProfileWithSubscribersGql[] | [];
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

export class OutputProfileUpdateModel {
  id: string;
  userId: string;
  userName: string;
  photoUrl: string ;
  firstName:  string ;
  lastName:  string ;
  dateOfBirth: string ;
  country: string;
  city: string;
  aboutMe: string ;
  paymentAccount: boolean;
  createdAt: string
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
  outputModel.paymentAccount = profile.paymentAccount;

  return outputModel;
};

export const OutputProfileUpdateModelMapper = (profile: Profile): OutputProfileUpdateModel => {

  const outputModel = new OutputProfileUpdateModel();
  outputModel.id = profile.id;
  outputModel.userId = profile.userId;
  outputModel.userName = profile.userName;
  outputModel.photoUrl = profile.photoUrl;
  outputModel.firstName = profile.firstName;
  outputModel.lastName =  profile.lastName ;
  outputModel.dateOfBirth = profile.dateOfBirth?.toISOString();
  outputModel.country = profile.country;
  outputModel.city = profile.city ;
  outputModel.aboutMe = profile.aboutMe;
  outputModel.createdAt = profile.createdAt.toISOString();
  outputModel.paymentAccount = profile.paymentAccount;

  return outputModel;
};
const getCount = (array: ProfileWithSubscribers['subscribers']
  | ProfileWithSubscribers['subscriptions']) => array.length

const followedCheck = (array: ProfileWithSubscribers['subscribers'], id: string = '') => Boolean(array.find(e => e?.subscriberId === id))