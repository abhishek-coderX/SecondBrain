"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        return res
            .status(411)
            .json({ message: "Error in inputs", errors: error.issues });
    }
};
exports.validate = validate;
