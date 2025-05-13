import { type Config } from './Config';

export declare global {
  // globals are bad, yes. The alternatives are either worse or more cumbersome - redux is just overcomplicated for what I'm using, and passing creds to every single prop is just cumbersome
  var credentials: string | undefined;
  var APP_CONFIG: Config;
}
