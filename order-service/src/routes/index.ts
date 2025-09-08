import express from 'express';


const router = express.Router();

interface Route {
  path: string;
  route: express.Router;
}

// const moduleRoutes: Route[] = [
//   {
//     path: '/auth',
//     route: authRoute,
//   },
//   {
//     path: '/user',
//     route: userRoute,
//   },
 
// ];

// moduleRoutes.forEach(route => router.use(route.path, route.route));

export const ApplicationRouters = router;
