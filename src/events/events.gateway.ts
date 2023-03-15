// import {
//     OnGatewayConnection,
//     OnGatewayDisconnect,
//     OnGatewayInit,
//     SubscribeMessage,
//     WebSocketGateway,
//     WebSocketServer,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { ProductConsumer } from 'src/kafka/consumer/product.consumer';
// import { ShiftService } from '../shift/shift.service';

// @WebSocketGateway({
//     cors: {
//         origin: '*',
//     },
// })
// export class EventsGateway
//   implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
// {
//   constructor(private readonly productConsumer: ProductConsumer){}

//   @WebSocketServer()
//     private server: Server;
//     private clients: Socket[] = [];

//     afterInit() {
//       this.productConsumer.socketServer = this.server;
//     }

//     handleConnection(client: Socket, ...args: any[]) {
//         this.clients.push(client);
//         this.server.emit('init', { greeting: 'Hello from server' });
//     }

//     handleDisconnect(client: Socket) {
//         this.clients.forEach((connectedClient, i) => {
//             if (connectedClient == client) {
//                 this.clients.splice(i, 1);
//                 return;
//             }
//         });
//     }

//     @SubscribeMessage('message')
//     handleMessage(client: any, payload: any): string {
//         console.log(payload, '\t', typeof client);
//         return 'Hello world!';
//     }
// }
