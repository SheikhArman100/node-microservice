// import axios from 'axios';
// import logger from '../app/middleware/logger';
// import config from '../config';

// type HistoryItem = {
//   question: string;
//   answer: string;
//   timestamp: number;
// };

// type AiRequestPayload = {
//   session_id:string
//   question: string;
//   history: HistoryItem[];
// };

// // type AiResponse = {
// //   answer_details: string;
// //   related_questions: string[];
// //   images: string[];
// // };

// export const getAiResponse = async (
//   payload: AiRequestPayload,
// ): Promise<any> => {
//   try {
    
//     const response = await axios.post(
//       `${config.ai_url}/ask`,
//       payload,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         withCredentials: true,
//       },
//     );
//     console.log(response);
  

//     return {
//       answer: response.data.answer || 'No details available',
//       sources: response.data.sources || [],
//     };
//   } catch (error) {
//     logger.error(error)
//     // throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Server Error');
//   }
// };
