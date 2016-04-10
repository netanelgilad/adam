import {Injector} from 'angular2/core';

const providers = [];

export function Singleton() {
  return function(target) {
    providers.push(target)
  }
}

export function createInjector() {
  return Injector.resolveAndCreate(providers);
}