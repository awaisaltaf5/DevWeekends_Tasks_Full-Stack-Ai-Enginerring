"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// GET /api/tasks - Get all tasks
router.get('/', taskController_1.getTasks);
// POST /api/tasks - Create a new task
router.post('/', validation_1.validateTaskCreation, validation_1.handleValidationErrors, taskController_1.createTask);
// GET /api/tasks/:id - Get single task
router.get('/:id', validation_1.validateTaskId, validation_1.handleValidationErrors, taskController_1.getTask);
// PUT /api/tasks/:id - Update task
router.put('/:id', validation_1.validateTaskUpdate, validation_1.handleValidationErrors, taskController_1.updateTask);
// DELETE /api/tasks/:id - Delete task
router.delete('/:id', validation_1.validateTaskId, validation_1.handleValidationErrors, taskController_1.deleteTask);
exports.default = router;
