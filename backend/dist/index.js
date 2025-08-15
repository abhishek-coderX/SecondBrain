"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const dotenv_1 = __importDefault(require("dotenv"));
const contents_1 = __importDefault(require("./routes/contents"));
const share_1 = __importDefault(require("./routes/share"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const tags_1 = __importDefault(require("./routes/tags"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const frontendURL = "http://localhost:5173";
app.use((0, cors_1.default)({
    origin: frontendURL,
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/', auth_1.default);
app.use('/', contents_1.default);
app.use('/', tags_1.default);
app.use('/', share_1.default);
(0, db_1.default)().then(() => {
    console.log("connected to database");
    app.listen(4000, () => {
        console.log("server running on port 4000");
    });
})
    .catch((err) => {
    console.log(err);
});
