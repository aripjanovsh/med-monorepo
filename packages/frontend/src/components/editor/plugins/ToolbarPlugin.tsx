"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getNodeByKey,
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isParentElementRTL,
  $wrapNodes,
  $isAtNodeEnd,
} from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import { createPortal } from "react-dom";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { $isCodeNode } from "@lexical/code";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Type,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LowPriority = 1;

const supportedBlockTypes = new Set([
  "paragraph",
  "quote",
  "code",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
]);

const blockTypeToBlockName = {
  code: "Код",
  h1: "Заголовок 1",
  h2: "Заголовок 2",
  h3: "Заголовок 3",
  ol: "Нумерованный список",
  paragraph: "Обычный текст",
  quote: "Цитата",
  ul: "Маркированный список",
};

function Divider() {
  return <Separator orientation="vertical" className="mx-1 h-6" />;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState(null);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey as any);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
          if ($isCodeNode(element)) {
            setIsCode(true);
          }
        }
      }
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: "h1" | "h2" | "h3") => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div className="flex items-center gap-1 border-b p-2 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        disabled={!canUndo}
        aria-label="Отменить"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        disabled={!canRedo}
        aria-label="Повторить"
      >
        <Redo className="h-4 w-4" />
      </Button>
      <Divider />

      <Select
        value={blockType}
        onValueChange={(value) => {
          if (value === "paragraph") formatParagraph();
          else if (value === "h1") formatHeading("h1");
          else if (value === "h2") formatHeading("h2");
          else if (value === "h3") formatHeading("h3");
          else if (value === "quote") formatQuote();
          else if (value === "ul") {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          } else if (value === "ol") {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          }
        }}
      >
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Обычный текст
            </div>
          </SelectItem>
          <SelectItem value="h1">
            <div className="flex items-center gap-2">
              <Heading1 className="h-4 w-4" />
              Заголовок 1
            </div>
          </SelectItem>
          <SelectItem value="h2">
            <div className="flex items-center gap-2">
              <Heading2 className="h-4 w-4" />
              Заголовок 2
            </div>
          </SelectItem>
          <SelectItem value="h3">
            <div className="flex items-center gap-2">
              <Heading3 className="h-4 w-4" />
              Заголовок 3
            </div>
          </SelectItem>
          <SelectItem value="quote">
            <div className="flex items-center gap-2">
              <Quote className="h-4 w-4" />
              Цитата
            </div>
          </SelectItem>
          <SelectItem value="ul">
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Маркированный список
            </div>
          </SelectItem>
          <SelectItem value="ol">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              Нумерованный список
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Divider />

      <Button
        variant={isBold ? "secondary" : "ghost"}
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        aria-label="Жирный"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant={isItalic ? "secondary" : "ghost"}
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        aria-label="Курсив"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant={isUnderline ? "secondary" : "ghost"}
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        aria-label="Подчеркнутый"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant={isStrikethrough ? "secondary" : "ghost"}
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        aria-label="Зачеркнутый"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        variant={isCode ? "secondary" : "ghost"}
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
        }}
        aria-label="Код"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant={isLink ? "secondary" : "ghost"}
        size="sm"
        onClick={insertLink}
        aria-label={isLink ? "Удалить ссылку" : "Вставить ссылку"}
      >
        {isLink ? <Unlink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
      </Button>

      <Divider />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        aria-label="Выравнивание по левому краю"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        aria-label="Выравнивание по центру"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        aria-label="Выравнивание по правому краю"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        aria-label="Выравнивание по ширине"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>
    </div>
  );
}

function getSelectedNode(selection: any) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}
