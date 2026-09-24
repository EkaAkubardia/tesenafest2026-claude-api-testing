# Test cases - steps and expected results

Source: `Test Cases for automation.md` (written by testers). This document adds the steps, expected results, test data and cleanup that the automation follows.

**Status: draft - waiting for test owner approval. No test code is written until this is approved.**

## Conventions

- **Test data** - every name starts with `autotest-<runId>-`, e.g. `autotest-20260924T1200-project`. Leftovers with this prefix are swept before and after every run.
- **Cleanup** - everything a test creates is deleted at the end, even if the test fails. Deleting a project also deletes its tasks.
- **"Loads"** - means a separate `GET` request after the change. We never rely only on the response to the change itself.
- **Priority** - the API uses 1 (normal) .. 4 (urgent). The app shows it the other way round: API 4 = "P1" in the app.
- **Dates** - explicit dates use `YYYY-MM-DD`. Dates in words use English (`due_lang: en`). Todoist reads them in the **account's timezone**, so tests compare two server results with each other, never with the clock of the CI machine.
- **Free plan** - only features available on a free account are used.
- **To confirm** marks behaviour the API documentation doesn't state clearly. It is checked against the live API in the next step. If reality differs, the test owner decides whether the expected result changes or it is reported as a bug.

| Wave | Test cases | Tags |
|---|---|---|
| 1 - smoke | TC-001..005 | `@smoke @regression` |
| 2 - single feature | TC-006..009 | `@regression` |
| 3 - end-to-end | TC-011 | `@e2e @regression` |
| 4 - alternative | TC-012..013 | `@regression` |
| 5 - negative | TC-014..015 | `@negative @regression` |

TC-010 is dropped: it depends on sections, which are out of scope.

---

## Wave 1 - smoke

### TC-001 [Projects] A new project is created and comes back under the name that was entered

Tags: `@TC-001 @smoke @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Create a project named `autotest-<runId>-project` | 200; the response has an `id` and `name` = the entered name |
| 2 | Load the project by its `id` | 200; `name` = the entered name |

Cleanup: delete the project.

### TC-002 [Tasks] A new task is created with the text that was entered

Tags: `@TC-002 @smoke @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Create a test project | 200 |
| 2 | Create a task in it with content `autotest-<runId>-Buy milk` | 200; the response has an `id` and `content` = the entered text |
| 3 | Load the task by its `id` | 200; `content` = the entered text, `project_id` = the test project |

Cleanup: delete the project (and with it the task).

### TC-003 [Tasks] A new task is created with the due date that was entered

Tags: `@TC-003 @smoke @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Create a test project | 200 |
| 2 | Create a task with `due_date` = today + 7 days (`YYYY-MM-DD`) | 200; `due.date` = the entered date |
| 3 | Load the task by its `id` | 200; `due.date` = the entered date, `due.is_recurring` = false |

Cleanup: delete the project.

### TC-004 [Labels] A new label is created under the name that was entered

Tags: `@TC-004 @smoke @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Create a label named `autotest-<runId>-label` | 200; the response has an `id` and `name` = the entered name |
| 2 | Load the label by its `id` | 200; `name` = the entered name |

Cleanup: delete the label.
To confirm: personal labels can be created through the API on a free account.

### TC-005 [Comments] A comment is added to a task with the text that was entered

Tags: `@TC-005 @smoke @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Create a test project and a task in it | 200 |
| 2 | Add a comment to the task with content `autotest-<runId>-comment` | 200; `content` = the entered text, `task_id` = the task |
| 3 | Load the comment by its `id` | 200; `content` = the entered text |
| 4 | Load the task | `note_count` = 1 |

Cleanup: delete the project (the task and its comments go with it).
To confirm: comments are available through the API on a free account.

---

## Wave 2 - functional tests of a single feature

### TC-006 [Projects] A renamed project loads under the new name the next time it is opened, not only in the response to the update

Tags: `@TC-006 @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Create a project named `autotest-<runId>-old` | 200 |
| 2 | Rename it to `autotest-<runId>-new` | 200; the response `name` = the new name |
| 3 | Load the project by its `id` (separate request) | `name` = the new name, `id` unchanged |
| 4 | Load the list of all projects | the project appears with the new name; no project has the old name |

Cleanup: delete the project.

### TC-007 [Tasks] A task can be created with the required fields only, and every optional field is stored exactly as it was entered

Tags: `@TC-007 @regression`

Proposed optional fields (all available on the free plan): `description`, `project_id`, `parent_id`, `priority`, `labels`, `due_date`.
Out of scope: `section_id` (sections are out of scope), `assignee_id` (needs a shared project), `duration` and `deadline_date` (may need a paid plan).

Part A - required fields only

| # | Step | Expected result |
|---|---|---|
| 1 | Create a task with only `content` | 200; `content` = the entered text |
| 2 | Load the task | `project_id` = the Inbox project (`inbox_project_id` from the user), `description` = "", `priority` = 1, `labels` = [], `due` = null, `parent_id` = null |

Part B - all optional fields

| # | Step | Expected result |
|---|---|---|
| 1 | Create a test project and a parent task in it | 200 |
| 2 | Create a task with `content`, `description` = "autotest description", `project_id` = the test project, `parent_id` = the parent task, `priority` = 3, `labels` = [`autotest-<runId>-a`, `autotest-<runId>-b`], `due_date` = today + 3 days | 200 |
| 3 | Load the task | each field equals exactly what was entered; `labels` contains both names (order doesn't matter) |

Cleanup: delete the Inbox task (part A), delete the project (part B). To confirm: whether labels given by name on a task create personal labels. If they do, delete them too.

### TC-008 [Tasks] A project's task list contains only the tasks of that project, nothing from elsewhere

Tags: `@TC-008 @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Create project A with 2 tasks and project B with 1 task | 200 each |
| 2 | Load the task list filtered by project A (following all pages) | exactly the 2 tasks of project A (compared by `id`); every task has `project_id` = A; project B's task isn't there |

Cleanup: delete both projects.

### TC-009 [Tasks] A due date entered in words lands on the same day as the same date entered explicitly

Tags: `@TC-009 @regression`

Proposal: English, relative word `tomorrow`. Todoist resolves it in the account's timezone. Both dates come from the server, so the CI machine's clock and timezone don't matter.

| # | Step | Expected result |
|---|---|---|
| 1 | Create a test project | 200 |
| 2 | Create task A with `due_string` = "tomorrow", `due_lang` = "en" | 200; `due.date` is set |
| 3 | Create task B with `due_date` = task A's `due.date` | 200 |
| 4 | Load both tasks | same `due.date`; task A's `due.date` = the account's today + 1 day (today computed in the timezone from the user's `tz_info`) |

Guard: if the account's date changes between steps 2 and 4 (a run exactly at midnight), the test fails with a clear message instead of a false bug.
Cleanup: delete the project.

---

## Wave 3 - end-to-end scenarios

### TC-011 [E2E] A project from empty to done: three tasks, two ticked off, one still open at the end

Tags: `@TC-011 @e2e @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Create a project | 200 |
| 2 | Load the project's task list | empty |
| 3 | Add tasks 1, 2 and 3 | 200 each |
| 4 | Load the project's task list | exactly tasks 1, 2, 3 |
| 5 | Tick off (close) tasks 1 and 2 | 200 each |
| 6 | Load the project's task list | only task 3 |
| 7 | Load tasks 1 and 2 by `id` | `checked` = true |
| 8 | Load task 3 by `id` | `checked` = false |

Cleanup: delete the project.
To confirm: completed tasks can still be loaded by `id` with `checked` = true. If not, step 7 uses the completed tasks endpoint (`/tasks/completed/by_completion_date`).

---

## Wave 4 - alternative scenarios

### TC-012 [Tasks] A task ticked off by mistake can be put back among the open ones, and it is the same task, not a new one

Tags: `@TC-012 @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Create a test project and a task with content and a description | 200 |
| 2 | Tick off (close) the task | 200 |
| 3 | Load the project's task list | the task isn't there |
| 4 | Reopen the task | 200 |
| 5 | Load the project's task list | the task is back with the **same `id`**, exactly one task in the list |
| 6 | Load the task by `id` | `checked` = false; `content` and `description` unchanged |

Cleanup: delete the project.

### TC-013 [Tasks] A recurring task does not disappear when ticked off and moves on to its next due date

Tags: `@TC-013 @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Create a test project | 200 |
| 2 | Create a task with `due_string` = "every day", `due_lang` = "en" | 200; `due.is_recurring` = true; note `due.date` as D |
| 3 | Tick off (close) the task | 200 |
| 4 | Load the task by `id` | still exists with the same `id`; `checked` = false; `due.date` = D + 1 day; `due.is_recurring` = true |
| 5 | Load the project's task list | the task is still there |

Cleanup: delete the project.

---

## Wave 5 - critical negative scenarios

### TC-014 [E2E] With no access token and with a malformed token the request fails with 401 and nothing is created

Tags: `@TC-014 @negative @regression`

| # | Step | Expected result |
|---|---|---|
| 1 | Try to create a project named `autotest-<runId>-noauth` **without** an access token | 401 |
| 2 | Try to create a project named `autotest-<runId>-badauth` with a malformed token (`Bearer not-a-real-token`) | 401 |
| 3 | With the valid token, load the list of all projects | no project named `...-noauth` or `...-badauth` |

Cleanup: nothing should exist. If step 3 finds a project, the sweep deletes it and the test fails.
Note: the tests never print the valid token. The malformed one is a fixed fake value.

### TC-015 [Tasks] A task with no text, with a required field missing, and with an unreadable due date is rejected

Tags: `@TC-015 @negative @regression`

Proposal: `content` is the only required field, so "no text" and "required field missing" become two separate cases - an empty value and a missing field.

| # | Step | Expected result |
|---|---|---|
| 1 | Create a test project | 200 |
| 2 | Create a task with `content` = "" (no text) | 400 |
| 3 | Create a task **without** the `content` field | 400 |
| 4 | Create a task with valid content and `due_string` = "autotest not a date" | 400 |
| 5 | Load the project's task list | empty - none of the attempts created a task |

Each case runs as its own step, so the report shows exactly which one failed.
Cleanup: delete the project.
To confirm: the API rejects an unreadable `due_string` with 400 instead of creating a task without a due date.

---

## Approval

- [ ] TC-007 field list approved
- [ ] TC-009 approach (English, "tomorrow", account timezone) approved
- [ ] TC-015 cases approved
- [ ] All steps and expected results approved by the test owner
