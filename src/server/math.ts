import {Injectable} from "angular2/core";
import {Mathy} from "../services";

@Injectable()
export class MathyImpl implements Mathy{
  add(a, b) {
    return a + b;    
  }
}