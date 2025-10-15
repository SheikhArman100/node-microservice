
  export enum ENUM_COOKIE_NAME {
    REFRESH_TOKEN = 'MicroserviceJwt',
  }
  
  export type DiskTypeEnum = 'LOCAL' | 'AWS' | 'SHARED';
  
  export type GeoLocationTypeEnum = 'Point' | 'Polygon';
  
  export const allGeoLocationTypeEnum: GeoLocationTypeEnum[] = [
    'Point',
    'Polygon',
  ];
  