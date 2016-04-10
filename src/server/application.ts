import {Injectable} from "angular2/core";
import {SocketServer} from "./socket-server";
import {Log} from "../logger";
import {Singleton} from "./injector";

@Injectable()
@Log()
@Singleton()
export class Application {
  constructor(private socketServer: SocketServer) {}

  start() {
    this.socketServer.start();
  }
}