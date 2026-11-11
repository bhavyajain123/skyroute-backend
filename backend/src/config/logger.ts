type LogLevel="INFO" | "WARN"|"ERROR"|"DEBUG";
function log(level:LogLevel, message:string, meta?:unknown): void{
    const timestamp= new Date().toISOString();

    const output={
        timestamp,
        level,
        message,
        ...(meta !== undefined?{meta}:{}),
    };
    if(level=== "ERROR"){
        console.error(JSON.stringify(output));

    }else if(level === "WARN"){
        console.warn(JSON.stringify(output));
    }else{
        console.log(JSON.stringify(output));
    }
}
export const logger={
    info(message:string, meta?:unknown):void{
        log("INFO", message, meta);
    },
     warn(message: string, meta?: unknown): void {
    log("WARN", message, meta);
  },

  error(message: string, meta?: unknown): void {
    log("ERROR", message, meta);
  },

  debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      log("DEBUG", message, meta);
    }
},
};