declare module "nodejs-websocket" {
  function createServer(fn: (conn: any) => void);
}