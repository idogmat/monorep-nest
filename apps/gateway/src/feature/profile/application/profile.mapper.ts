import { Injectable } from "@nestjs/common";
import { UserProfileResponse } from "../../../../../libs/proto/generated/profile";


const chekNestValue = (o: string | { value: string }) => {
  return typeof o === 'object' ? o?.value : o
}

@Injectable()
export class ProfileMappingService {
  constructor() { }

  profileMapping(profile: UserProfileResponse) {
    return {
      ...profile,
      photoUrl: chekNestValue(profile.photoUrl),
      firstName: chekNestValue(profile.firstName),
      lastName: chekNestValue(profile.lastName),
      dateOfBirth: chekNestValue(profile.dateOfBirth),
      country: chekNestValue(profile.country),
      city: chekNestValue(profile.city),
      aboutMe: chekNestValue(profile.aboutMe),
    }
  }
}