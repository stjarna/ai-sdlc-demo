
> littlelist-crud-baseline@1.0.0 test:unit
> node --test test/unit/*.test.mjs

✔ accepts past, current and future calendar dates without a date window (1.050708ms)
✔ rejects impossible dates, timestamps, malformed representations and wrong types (0.285875ms)
✔ overdue means unfinished and strictly before the local calendar day (0.111334ms)
✔ uses device-local calendar components across opposite timezones and DST (134.859667ms)
✔ invalid and partial drafts cannot be mistaken for intentional clearing (0.897833ms)
✔ default persistent data is outside the application and dependency directories (0.84925ms)
✔ relative database overrides resolve from the application root (0.095208ms)
✔ absolute database overrides retain their explicitly selected location (0.082125ms)
✔ optional date can be assigned, edited and cleared independently of completion (5.384125ms)
✔ invalid date writes preserve all previously saved fields (0.807ms)
✔ v1 migration preserves IDs, sequence, business fields and order and is idempotent (6.212292ms)
✔ failed migration rolls back without replacing data or advancing schema version (3.648542ms)
✔ date edits survive an actual database close and reopen (4.798041ms)
✔ creates an unfinished task with optional description and opaque stable identity (4.070833ms)
✔ newest-created tasks remain first when older tasks are edited (0.510833ms)
✔ updates title and multiline description while retaining identity and completion (0.388583ms)
✔ completion is reversible without extra state transitions (0.353125ms)
✔ deletes both unfinished and completed tasks permanently (0.405542ms)
✔ invalid edits preserve the last valid task (0.633875ms)
✔ validates input types, supported fields and exact content bounds (0.362333ms)
✔ Unicode and markup remain literal user content (0.356708ms)
✔ missing IDs produce a clear not-found diagnostic (0.736291ms)
✔ stored tasks survive closing and reopening the database (4.019125ms)
✔ independent database connections preserve partial updates (3.283541ms)
✔ unsupported database schema fails without deleting stored data (3.970583ms)
ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 240.309291
