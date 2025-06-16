"use client";

import React, { useState } from "react";

interface ImportHelpWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportHelpWindow({ isOpen, onClose }: ImportHelpWindowProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "format" | "setup">("overview");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Google Sheets Import Help
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="px-6 flex space-x-8">
            {[
              { key: "overview", label: "Overview" },
              { key: "setup", label: "Setup" },
              { key: "format", label: "CSV Format" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  How It Works
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Import problems directly from Google Sheets using the public CSV export feature. 
                  No authentication required - just make your sheet publicly accessible.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Update-or-Create (Upsert) Approach:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• If a problem with the same name exists in the same lecture, it will be updated</li>
                    <li>• If no matching problem exists, a new one will be created</li>
                    <li>• Courses and lectures are auto-created if they don't exist</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Quick Start
                </h3>
                <ol className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                    <span>Prepare your Google Sheet with the correct format</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                    <span>Make it publicly accessible</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                    <span>Set the GOOGLE_SHEET_ID environment variable</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                    <span>Click "Import from Sheet" button</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === "setup" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  1. Environment Variable
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Add the following to your <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">.env</code> file:
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    GOOGLE_SHEET_ID="your-google-sheet-id-here"
                  </code>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">How to find your Google Sheet ID:</h4>
                  <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>1. Open your Google Sheet</li>
                    <li>2. Look at the URL: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit</code></li>
                    <li>3. Copy the <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">YOUR_SHEET_ID</code> part</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  2. Make Sheet Public
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Your Google Sheet must be publicly accessible:
                </p>
                <ol className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                    <span>Click "Share" in your Google Sheet</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                    <span>Change access to "Anyone with the link can view"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                    <span>Ensure "Viewer" permissions are set</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === "format" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Required Columns
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your Google Sheet must have these exact column names:
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Column Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Required
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {[
                        { name: "name", required: true, desc: "Problem name" },
                        { name: "description", required: false, desc: "Problem description" },
                        { name: "courseName", required: true, desc: "Course name (created if doesn't exist)" },
                        { name: "lectureName", required: true, desc: "Lecture name (created if doesn't exist)" },
                        { name: "codeSnippet", required: true, desc: "Code to display (supports multiline)" },
                        { name: "correctLines", required: true, desc: "Comma-separated line numbers" },
                        { name: "hint", required: true, desc: "Hint text" },
                        { name: "reasons", required: true, desc: "JSON object with line explanations" },
                      ].map((col, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"}>
                          <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                            {col.name}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              col.required 
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}>
                              {col.required ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {col.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Important Notes
                </h3>
                <div className="space-y-4">
                  <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Code Snippets</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Multiline code is fully supported. Use actual line breaks in your Google Sheet cells.
                    </p>
                  </div>
                  
                  <div className="border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Correct Lines</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Must contain valid integers separated by commas. Example: "1,2,5"
                    </p>
                  </div>
                  
                  <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Reasons</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                      Must be valid JSON format. Example:
                    </p>
                    <code className="text-xs bg-purple-100 dark:bg-purple-900/30 p-2 rounded block">
                      {"{"}"1": "Missing value after equals sign", "2": "Syntax error"{"}"} 
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Validation Rules
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Rows will be skipped if they contain:</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Empty values in required fields</li>
                    <li>• Invalid JSON syntax in the reasons field</li>
                    <li>• Column count mismatch</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 