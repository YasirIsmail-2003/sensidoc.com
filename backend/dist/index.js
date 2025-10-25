"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const auth_1 = __importDefault(require("./routes/auth"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const ai_1 = __importDefault(require("./routes/ai"));
const doctors_1 = __importDefault(require("./routes/doctors"));
const admin_1 = __importDefault(require("./routes/admin"));
const blogs_1 = __importDefault(require("./routes/blogs"));
const contact_1 = __importDefault(require("./routes/contact"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const errorHandler_1 = require("./utils/errorHandler");
const swagger_1 = require("./config/swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use(rateLimiter_1.generalLimiter);
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'SensiDoc API is running',
        timestamp: new Date().toISOString(),
        version: API_VERSION,
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SensiDoc API Documentation'
}));
app.use(`/api/${API_VERSION}/auth`, auth_1.default);
app.use(`/api/${API_VERSION}/appointments`, appointments_1.default);
app.use(`/api/${API_VERSION}/ai`, ai_1.default);
app.use(`/api/${API_VERSION}/doctors`, doctors_1.default);
app.use(`/api/${API_VERSION}/admin`, admin_1.default);
app.use(`/api/${API_VERSION}/blogs`, blogs_1.default);
app.use(`/api/${API_VERSION}/contact`, contact_1.default);
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to SensiDoc Healthcare API',
        version: API_VERSION,
        documentation: '/api-docs',
        endpoints: {
            auth: `/api/${API_VERSION}/auth`,
            appointments: `/api/${API_VERSION}/appointments`,
            ai: `/api/${API_VERSION}/ai`,
            doctors: `/api/${API_VERSION}/doctors`,
            admin: `/api/${API_VERSION}/admin`,
            blogs: `/api/${API_VERSION}/blogs`,
            contact: `/api/${API_VERSION}/contact`
        }
    });
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`
🏥 SensiDoc Healthcare API Server Started
🚀 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server running on port ${PORT}
📚 API Documentation: http://localhost:${PORT}/api-docs
🔗 API Base URL: http://localhost:${PORT}/api/${API_VERSION}
⚡ Health Check: http://localhost:${PORT}/health
  `);
});
exports.default = app;
//# sourceMappingURL=index.js.map