import { NextFunction, Request, Response } from "express";
import { z } from "zod"; 

export const validate =
  (schema: z.ZodType<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); 
      next();
    } catch (error: any) {
      return res
        .status(411) 
        .json({ message: "Error in inputs", errors: error.issues });
    }
  };
