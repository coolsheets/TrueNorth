# Using AI Assistants with TrueNorth

This guide explains how to effectively use AI assistants (like GitHub Copilot, ChatGPT, Claude) with the TrueNorth project.

## Setting Up AI Context

Always start your AI conversations by pointing to our context file:

```
Please review the .github/AI_ASSISTANT_CONFIG.md file before helping with this task.
```

## Common AI Requests

Here are some effective ways to request help from AI assistants:

### For Bug Fixes
```
Following our project standards in .github/AI_ASSISTANT_CONFIG.md, please help me fix this bug in [file]. The issue is [description].
```

### For New Features
```
Please implement a new component following our MUI-based structure in .github/AI_ASSISTANT_CONFIG.md that does [description].
```

### For Code Reviews
```
Review this code according to our project standards in .github/AI_ASSISTANT_CONFIG.md and suggest improvements.
```

## Correcting AI Responses

If the AI suggests code that doesn't match our standards:

```
This suggestion uses [wrong pattern]. Please refer to our AI context file and adjust your solution to use [correct pattern] instead.
```

## Tips for Better AI Results

1. **Be Specific**: Clearly state what you need and in what file
2. **Provide Context**: Share relevant existing code and explain its purpose
3. **Break Down Complex Requests**: Ask for one thing at a time
4. **Review Before Implementing**: Always review AI suggestions before applying them
5. **Iterative Refinement**: Ask the AI to improve its suggestions based on feedback

## AI-Assisted Tasks That Work Well

- Converting between similar patterns (e.g., adjusting component props)
- Writing unit tests for existing components
- Implementing new UI components based on existing patterns
- Documenting code with JSDoc comments
- Suggesting refactoring opportunities

## AI-Assisted Tasks to Avoid

- Complete architecture design from scratch
- Security-critical implementations
- Performance optimizations without benchmarking
- Complex business logic without human review

Remember: AI is a tool to enhance your productivity, not replace your judgment. Always review and understand code before committing it.
