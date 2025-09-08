// import { SortOrder } from 'mongoose';
// /**
//  * Calculating pagination related input
//  */
// export type IOptions = {
//   page?: number;
//   limit?: number;
//   sortBy?: string;
//   sortOrder?: SortOrder;
// };

// /**
//  * Calculating pagination function output
//  */
// export type IOptionsResult = {
//   page: number;
//   limit: number;
//   skip: number;
//   sortBy: string;
//   /** mongoose SortOrder options */
//   sortOrder: SortOrder;
// };

// /**
//  * Calculates pagination options based on the provided options.
//  * @param options The pagination options to calculate.
//  *
//  * @returns The calculated pagination options including skip value.
//  */
// export const calculatePagination = (options: IOptions): IOptionsResult => {
//   const page = Number(options.page || 1);
//   const limit = Number(options.limit || 10);
//   const skip = (page - 1) * limit;

//   const sortBy = options.sortBy || 'createdAt';
//   const sortOrder = options.sortOrder || 'desc';

//   return {
//     page,
//     limit,
//     skip,
//     sortBy,
//     sortOrder,
//   };
// };
