import 'reflect-metadata';
import {Application} from "./application";
import {createInjector} from "./injector";

createInjector().get(Application).start();