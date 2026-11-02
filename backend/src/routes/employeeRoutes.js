const express = require('express');
const router = express.Router();
const {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deactivateEmployee
} = require('../controllers/employeeController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');

// GET /api/v1/employees (Search, filter, paginate)
router.get('/', authMiddleware, listEmployees);

// POST /api/v1/employees (Restricted to ADMIN and HR)
router.post('/', authMiddleware, roleGuard(['ADMIN', 'HR']), createEmployee);

// GET /api/v1/employees/:id (Singular lookup / profile view)
router.get('/:id', authMiddleware, getEmployeeById);

// =========================================================================
// INTENTIONAL SEEDED DEFECT-004:
// Insecure Direct Object Reference / Broken Function Level Authorization:
// roleGuard(['ADMIN', 'HR']) is omitted from the PUT route chain!
// An identity authenticated with the EMPLOYEE role can submit modification
// requests against arbitrary IDs (e.g. EMP-001) and receive 200 OK instead
// of being rejected with 403 Forbidden.
// Expected fix: router.put('/:id', authMiddleware, roleGuard(['ADMIN', 'HR']), updateEmployee);
// =========================================================================
router.put('/:id', authMiddleware, updateEmployee);

// DELETE /api/v1/employees/:id (Soft-delete / offboarding: Restricted to ADMIN and HR)
router.delete('/:id', authMiddleware, roleGuard(['ADMIN', 'HR']), deactivateEmployee);

module.exports = router;
