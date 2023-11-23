// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';

// @Injectable()
// export class ApiKeyMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     const apiKey = req.header('Authorization');

//     if (
//       apiKey !==
//       'xnd_development_7kWjixnClUSbCEVa35SjG7etTZpEWWN32V9jAOn1C22t6Uq8he1uJPKj3kYg4U04'
//     ) {
//       return res
//         .status(401)
//         .json({ message: 'Unauthorized - Invalid API key' });
//     }

//     next();
//   }
// }
