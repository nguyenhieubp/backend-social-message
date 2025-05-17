import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log(process.env.MONGODB_URI);
    return 'Hello World!';
  }
}
