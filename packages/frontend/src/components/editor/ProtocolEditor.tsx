"use client";

import { $getRoot, $getSelection, EditorState } from "lexical";
import React, { useEffect } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";

import ToolbarPlugin from "./plugins/ToolbarPlugin";
import CustomElementsToolbar from "./plugins/CustomElementsToolbar";

// Импортируем кастомные плагины
import {
  CUSTOM_ELEMENT_NODES,
  TextInputPlugin,
  SelectPlugin,
  RadioPlugin,
  CheckboxPlugin,
  TextareaPlugin,
} from "./custom-plugins";

const editorConfig = {
  namespace: "ProtocolEditor",
  theme: {
    root: "prose prose-slate dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none",
    link: "text-blue-600 dark:text-blue-400 underline",
    text: {
      bold: "font-bold",
      italic: "italic",
      underline: "underline",
      strikethrough: "line-through",
      code: "px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono",
    },
    heading: {
      h1: "text-3xl font-bold mb-4 mt-6",
      h2: "text-2xl font-bold mb-3 mt-5",
      h3: "text-xl font-bold mb-2 mt-4",
    },
    list: {
      ul: "list-disc ml-6",
      ol: "list-decimal ml-6",
      listitem: "mb-1",
    },
    quote: "border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4",
    table: "border-collapse table-auto w-full",
    tableCell: "border border-gray-300 dark:border-gray-600 px-4 py-2",
    tableRow: "border-b border-gray-300 dark:border-gray-600",
  },
  onError(error: Error) {
    console.error("Lexical error:", error);
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    ...CUSTOM_ELEMENT_NODES,
  ],
};

interface ProtocolEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

export default function ProtocolEditor({
  initialContent,
  onChange,
  placeholder = "Начните вводить текст протокола...",
}: ProtocolEditorProps) {
  const initialConfig = React.useMemo(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        return {
          ...editorConfig,
          editorState: JSON.stringify(parsed),
        };
      } catch {
        return editorConfig;
      }
    }
    return editorConfig;
  }, []);
  function handleChange(editorState: EditorState) {
    editorState.read(() => {
      const root = $getRoot();
      const content = JSON.stringify(editorState.toJSON());
      onChange?.(content);
    });
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border rounded-lg overflow-hidden">
        <ToolbarPlugin />
        <CustomElementsToolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[400px] px-4 py-3 focus:outline-none"
                aria-label="Редактор протокола"
              />
            }
            placeholder={
              <div className="absolute top-3 left-4 text-muted-foreground pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

          {/* Регистрируем кастомные плагины */}
          <TextInputPlugin />
          <SelectPlugin />
          <RadioPlugin />
          <CheckboxPlugin />
          <TextareaPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
