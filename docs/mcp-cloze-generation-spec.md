# MCP Cloze Generation

## Goal

Replace direct vocabulary-cloze LLM generation with an MCP-assisted path while retaining the current API-based implementation behind a configuration switch.

## Job model

Only one content-generation job may exist per user. A job stores only:

- user ID
- generation type
- creation time

Creating a job replaces that user's previous job. Jobs contain no prompt, input payload, output payload, public job ID, or status.

## MCP flow

1. Vocabulary cloze generation creates a `VOCABULARY_CLOZE` job when MCP is configured.
2. MCP authenticates a user through the random key in the MCP URL.
3. Fetch tool requires that user's active job to have type `VOCABULARY_CLOZE`.
4. Fetch tool calculates current candidates and returns the existing cloze prompt.
5. Store tool accepts the existing `VocabularyClozeBatch` contract.
6. Store tool uses existing cloze validation and persistence.
7. Successful storage deletes the job in the same transaction.

## Provider switch

Exactly one provider is active per deployment:

- `MCP`: generation endpoint creates a job.
- `LLM_API`: generation endpoint invokes the existing synchronous implementation.

## MCP URL

Profile UI contains a button that fetches and copies the authenticated user's MCP URL. URL is never rendered as visible content and is not returned by cloze-generation endpoint.

## Security

- MCP key determines user identity; MCP tools never accept user ID.
- Job lookup always uses authenticated user ID and expected job type.
- URL keys require HTTPS and query-parameter redaction from access logs.
- Store operation locks or atomically consumes the job to prevent concurrent submissions.

## Acceptance criteria

- Existing cloze prompt and LLM input/output objects remain unchanged.
- MCP jobs contain no generation data.
- Only one job exists per user.
- Successful MCP storage removes job; failed storage retains it.
- Configuration can select MCP or existing API implementation.
- Profile copies MCP URL without displaying it.
