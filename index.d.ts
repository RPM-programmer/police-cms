import { Express } from "express";

declare function init(app: Express): Promise<void>;
export = init;
