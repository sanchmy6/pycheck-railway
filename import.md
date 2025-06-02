# Google Sheets CSV Import Feature

## Overview

The application supports importing problems directly from Google Sheets using the public CSV export feature. This requires no authentication and works with any publicly accessible Google Sheet.

The import uses an **update-or-create (upsert)** approach:

- If a problem with the same name exists in the same lecture, it will be updated
- If no matching problem exists, a new one will be created

## Setup

### 1. Environment Variable

Add the following to your `.env` file:

```
GOOGLE_SHEET_ID="your-google-sheet-id-here"
```

To find your Google Sheet ID:

1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
3. Copy the `YOUR_SHEET_ID` part

### 2. Make Sheet Public

Your Google Sheet must be publicly accessible:

1. Click "Share" in your Google Sheet
2. Change access to "Anyone with the link can view"
3. Ensure "Viewer" permissions are set

## CSV Format

Your Google Sheet must have the following columns (exact names required):

| Column Name  | Required | Description                           | Example                                                        |
| ------------ | -------- | ------------------------------------- | -------------------------------------------------------------- |
| name         | Yes      | Problem name                          | "Variable Assignment Error"                                    |
| description  | No       | Problem description                   | "Find the syntax error in variable assignment"                 |
| courseName   | Yes      | Course name (empty if doesn't exist)  | "Python Fundamentals"                                          |
| lectureName  | Yes      | Lecture name (empty if doesn't exist) | "Variables and Data Types"                                     |
| codeSnippet  | Yes      | Code to display (supports multiline)  | "def hello():<br>&nbsp;&nbsp;&nbsp;&nbsp;print('Hello World')" |
| correctLines | Yes      | Comma-separated line numbers          | "1,2"                                                          |
| hint         | Yes      | Hint text                             | "Check if the variable has a value assigned"                   |
| reasons      | Yes      | JSON object with line explanations    | {"1": "Missing value after equals sign"}                       |

### Important Notes:

- **Code Snippets**: Multiline code is fully supported. Use actual line breaks in your Google Sheet cells
- **Correct Lines**: Must contain valid integers separated by commas. Invalid numbers are filtered out but don't cause row failure
- **Reasons**: Must be valid JSON format. Supports objects, arrays, and complex structures

## Validation Rules

Rows will be **skipped** if they contain:

### Required Field Validation

- Empty values in: `name`, `courseName`, `lectureName`, `codeSnippet`, `correctLines`, `hint`, or `reasons`

### Data Format Validation

- Invalid JSON syntax in the `reasons` field
- Column count mismatch (wrong number of columns)

### Data Handling (Non-Failing)

- **Invalid line numbers**: Non-numeric values in `correctLines` are filtered out but don't fail the row
- **Special characters**: Unicode, emojis, and special characters are preserved
- **Long content**: No length limits enforced
- **Complex JSON**: Arrays, nested objects, and complex structures in `reasons` are supported

## Usage

1. Prepare your Google Sheet with the correct format
2. Make it publicly accessible
3. Set the `GOOGLE_SHEET_ID` environment variable
4. Go to Teacher Dashboard
5. Click "Import from Sheet" button
6. Review the import results

## Import Behavior

- **Courses and Lectures**: Auto-created if they don't exist
- **Existing Problems**: Updated if name matches within the same lecture (case-insensitive)
- **New Problems**: Created if no matching name exists
- **Invalid Data**: Rows with validation errors are skipped with detailed error messages
- **Partial Data**: Invalid line numbers are filtered out, but the row still processes if other data is valid
