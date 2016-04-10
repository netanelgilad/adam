import { createServer } from "nodejs-websocket";
import {Injectable, Injector} from "angular2/core";
import {Log} from "../logger";
import {Singleton} from "./injector";

@Injectable()
@Log()
@Singleton()
export class SocketServer {
  private static SERVER_PORT = 8001;

  constructor(private injector: Injector) {}

  start() {
    createServer(this.onNewConnection.bind(this)).listen(SocketServer.SERVER_PORT);
  }

  onNewConnection(conn) {
    console.log("New connection");
    conn.on("text", this.handleTextMessage.bind(this, conn));
    conn.on("close", this.onConnectionClose.bind(this));
  }

  handleTextMessage(conn, str: string) {
    const message : Message = JSON.parse(str);
    const instance = this.injector.get(message.instance);
    const returnValue = instance[message.func].apply(instance, message.args);
    conn.sendText(JSON.stringify(returnValue));
  }

  onConnectionClose(code, reason) {
    console.log("Connection closed")
  }
}

export interface Message {
  instance: string;
  func: string;
  args: Array<any>;
}