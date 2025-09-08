export enum ENUM_USER_ROLE {
    
    ADMIN = 'ADMIN',
    USER = 'USER',
  }
  
  ;
  
  export enum ENUM_COOKIE_NAME {
    REFRESH_TOKEN = 'AIJwt',
  }
  
  export type DiskTypeEnum = 'LOCAL' | 'AWS' | 'SHARED';
  
  export type GeoLocationTypeEnum = 'Point' | 'Polygon';
  
  export const allGeoLocationTypeEnum: GeoLocationTypeEnum[] = [
    'Point',
    'Polygon',
  ];
  