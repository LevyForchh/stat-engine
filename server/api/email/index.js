'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './email.controller';

const router = new Router();

router.post(
  '/timeRangeAnalysis',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  bodyParser.json(),
  auth.hasFireDepartment,
  controller.setEmailOptions,
  controller.runComparison,
  controller.runRuleAnalysis,
  controller.setEmailRecipients,
  controller.setEmailMergeVars,
  controller.send,
);

module.exports = router;

export default router;
