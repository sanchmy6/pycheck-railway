"use client";

import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { evaluateProblemSelection, getProblemById, getProblemHint } from "../actions";

interface CodeSnippetProps {
  code: string;
  problemId: number;
  language?: string;
  problemData?: {
    correctLinesCount: number;
    hint: string;
  };
}

interface EvaluationResult {
  success: boolean;
  isCorrect?: boolean;
  incorrectSelections?: Array<{ line: number; reason: string }>;
  correctSelections?: Array<{ line: number; reason: string }>;
  correctSelectionsCount?: number;
  missingLinesCount?: number;
  expectedLinesCount?: number;
  message?: string;
}

export function CodeSnippet({ code, problemId, language = "python", problemData }: CodeSnippetProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [expectedLinesCount, setExpectedLinesCount] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<EvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState<string>("");
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    setIsDarkMode(theme === "dark");

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          const newTheme = document.documentElement.getAttribute("data-theme");
          setIsDarkMode(newTheme === "dark");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (problemData) {
      // Use provided problem data
      setExpectedLinesCount(problemData.correctLinesCount);
      setHint(problemData.hint);
    } else {
      // Fallback to API call if no problem data provided
      const fetchProblemInfo = async () => {
        const problemInfo = await getProblemById(problemId);
        if (problemInfo) {
          setExpectedLinesCount(problemInfo.correctLinesCount);
        }
      };

      fetchProblemInfo();
    }
  }, [problemId, problemData]);

  const handleLineClick = (lineNumber: number) => {
    if (hasSubmitted) return;

    setSelectedLines(prev => {
      if (prev.includes(lineNumber)) {
        return prev.filter(line => line !== lineNumber);
      }
      return [...prev, lineNumber].sort((a, b) => a - b);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowFeedback(false);

    try {
      const result = await evaluateProblemSelection(problemId, selectedLines);
      setFeedback(result);
      setShowFeedback(true);
    } catch {
      setFeedback({
        success: false,
        isCorrect: false,
        message: "An error occurred while evaluating your selection. Please try again."
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedLines([]);
    setEvaluationResult(null);
    setHasSubmitted(false);
  };

  const handleHintClick = async () => {
    if (showHint) {
      setShowHint(false);
      return;
    }

    if (problemData?.hint) {
      setShowHint(true);
    } else if (!hint) {
      setIsLoadingHint(true);
      try {
        const hintData = await getProblemHint(problemId);
        if (hintData?.hint) {
          setHint(hintData.hint);
        }
      } catch (error) {
        console.error("Failed to load hint:", error);
      } finally {
        setIsLoadingHint(false);
      }
      setShowHint(true);
    } else {
      setShowHint(true);
    }
  };

  const getLineBackgroundColor = (lineNumber: number) => {
    if (!hasSubmitted) {
      return selectedLines.includes(lineNumber)
        ? (isDarkMode ? "#2d3748" : "#e2e8f0")
        : "transparent";
    }

    if (evaluationResult?.isCorrect && selectedLines.includes(lineNumber)) {
      return isDarkMode ? "#065f46" : "#dcfce7";
    }

    const incorrectLine = evaluationResult?.incorrectSelections?.find(sel => sel.line === lineNumber);
    if (incorrectLine) {
      return isDarkMode ? "#7f1d1d" : "#fef2f2";
    }

    return selectedLines.includes(lineNumber)
      ? (isDarkMode ? "#065f46" : "#dcfce7")
      : "transparent";
  };

  const getLineProps = (lineNumber: number) => {
    return {
      style: {
        display: "block",
        backgroundColor: getLineBackgroundColor(lineNumber),
        cursor: hasSubmitted ? "default" : "pointer",
      },
      onClick: () => handleLineClick(lineNumber),
      className: `${selectedLines.includes(lineNumber) ? "font-medium" : ""} ${!hasSubmitted ? "hover:bg-gray-200 dark:hover:bg-gray-700" : ""} transition-colors`,
      title: hasSubmitted ? undefined : "Click to select this line"
    };
  };

  const canSubmit = selectedLines.length === expectedLinesCount && !hasSubmitted;
  const remainingLines = expectedLinesCount - selectedLines.length;

  return (
    <div className="p-4">
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={isDarkMode ? vscDarkPlus : oneLight}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            textAlign: "right",
            userSelect: "none"
          }}
          wrapLines={true}
          lineProps={getLineProps}
          className="text-sm font-mono"
        >
          {code}
        </SyntaxHighlighter>
      </div>

      <div className="mt-4 space-y-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {!hasSubmitted ? (
            <>
              Selected: {selectedLines.length} / {expectedLinesCount} lines
              {remainingLines > 0 && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  ({remainingLines} more needed)
                </span>
              )}
            </>
          ) : (
            <>Selected: {selectedLines.length} lines</>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleHintClick}
            disabled={isLoadingHint}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingHint ? "Loading..." : showHint ? "Hide Hint" : "💡 Show Hint"}
          </button>

          {!hasSubmitted ? (
            canSubmit ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Evaluating..." : "Submit Selection"}
              </button>
            ) : (
              <div className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500">
                Select {expectedLinesCount} lines to submit
              </div>
            )
          ) : (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
            >
              Try Again
            </button>
          )}
        </div>
      </div>

      {showFeedback && feedback && (
        <div className="mt-4">
          {feedback.isCorrect ? (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
                <div className="font-medium">Good Job!</div>
              </div>

              {feedback.correctSelections && feedback.correctSelections.length > 0 && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                  <div className="font-medium mb-2">Explanation:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {feedback.correctSelections.map(sel => (
                      <li key={sel.line} className="text-sm">
                        <span className="font-medium">Line {sel.line}:</span> {sel.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
                <div className="text-sm mt-1">
                  You found {feedback.correctSelectionsCount} of {feedback.expectedLinesCount} correct lines.
                  {(feedback.missingLinesCount && feedback.missingLinesCount > 0) && (
                    <span className="block mt-1">
                      {feedback.missingLinesCount} more correct line{feedback.missingLinesCount !== 1 ? 's' : ''} {feedback.missingLinesCount !== 1 ? 'are' : 'is'} missing.
                    </span>
                  )}
                </div>
              </div>

              {feedback.correctSelections && feedback.correctSelections.length > 0 && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                  <div className="font-medium mb-2">Correctly identified lines:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {feedback.correctSelections.map(sel => (
                      <li key={sel.line} className="text-sm">
                        <span className="font-medium">Line {sel.line}:</span> {sel.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showHint && (problemData?.hint || hint) && (
        <div className="mt-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Hint</h3>
                <div className="mt-1 text-sm">
                  {problemData?.hint || hint}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 