
> littlelist-crud-baseline@1.0.0 test:unit
> node --test test/unit/*.test.mjs

✔ accepts past, current and future calendar dates without a date window (1.1125ms)
✔ rejects impossible dates, timestamps, malformed representations and wrong types (0.252875ms)
✔ overdue means unfinished and strictly before the local calendar day (0.123167ms)
✔ uses device-local calendar components across opposite timezones and DST (133.836166ms)
✔ invalid and partial drafts cannot be mistaken for intentional clearing (0.85825ms)
✔ default persistent data is outside the application and dependency directories (0.964834ms)
✔ relative database overrides resolve from the application root (0.075833ms)
✔ absolute database overrides retain their explicitly selected location (0.059458ms)
✔ optional date can be assigned, edited and cleared independently of completion (3.765833ms)
✔ invalid date writes preserve all previously saved fields (0.793375ms)
✔ v1 migration preserves IDs, sequence, business fields and order and is idempotent (5.313584ms)
✔ failed migration rolls back without replacing data or advancing schema version (3.750166ms)
✔ date edits survive an actual database close and reopen (4.666875ms)
✔ creates an unfinished task with optional description and opaque stable identity (2.691125ms)
✔ newest-created tasks remain first when older tasks are edited (0.528083ms)
✔ updates title and multiline description while retaining identity and completion (0.447584ms)
✔ completion is reversible without extra state transitions (0.372417ms)
✔ deletes both unfinished and completed tasks permanently (0.474708ms)
✔ invalid edits preserve the last valid task (0.557ms)
✔ validates input types, supported fields and exact content bounds (0.346917ms)
✔ Unicode and markup remain literal user content (0.335667ms)
✔ missing IDs produce a clear not-found diagnostic (0.459833ms)
✔ stored tasks survive closing and reopening the database (4.421209ms)
✔ independent database connections preserve partial updates (2.8825ms)
✔ unsupported database schema fails without deleting stored data (3.941917ms)
ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 236.337
