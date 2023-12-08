// app.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway()
export class AppGateway {
  @WebSocketServer() server;

  sendStatusToClient(status: string) {
    const intervalId = setInterval(() => {
      console.log('Sending status to client:', status);
      this.server.emit('statusUpdate', status);
    }, 3000);

    setTimeout(() => {
      clearInterval(intervalId);
    }, 10000);
  }
}
