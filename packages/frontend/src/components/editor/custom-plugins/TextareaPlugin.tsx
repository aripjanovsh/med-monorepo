import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertNodes,
  $getNodeByKey,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";
import { CustomElementNode, CustomElementData } from "./base/CustomElementNode";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReactNode, useState } from "react";
import { LexicalEditor, EditorConfig, NodeKey } from "lexical";
import { generateElementId } from "./utils/generateId";
import { ElementEditDialog } from "./components/ElementEditDialog";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export class TextareaNode extends CustomElementNode {
  static getType(): string {
    return "textarea-input";
  }

  constructor(
    data: CustomElementData = {
      type: "textarea",
      id: generateElementId("textarea"),
      label: "",
      placeholder: "",
      required: false,
      displayMode: "block",
      rows: 4,
    },
    key?: NodeKey,
  ) {
    super(data, key);
  }

  static clone(node: TextareaNode): TextareaNode {
    return new TextareaNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: any): TextareaNode {
    const { data } = serializedNode;
    return new TextareaNode(data);
  }

  exportJSON(): any {
    return {
      data: this.__data,
      type: "textarea-input",
      version: 1,
    };
  }

  decorate(editor: LexicalEditor, config: EditorConfig): ReactNode {
    return (
      <TextareaComponent
        data={this.__data}
        nodeKey={this.__key}
        editor={editor}
      />
    );
  }
}

interface TextareaComponentProps {
  data: CustomElementData;
  nodeKey: NodeKey;
  editor: LexicalEditor;
}

function TextareaComponent({ data, nodeKey, editor }: TextareaComponentProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newData: CustomElementData) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as TextareaNode;
      if (node) {
        node.setData(newData);
      }
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <>
      <div
        className="my-2 group relative"
        contentEditable={false}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        {data.label && (
          <Label htmlFor={data.id} className="mb-1 block text-sm font-medium">
            {data.label}
            {data.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <Textarea
          id={data.id}
          placeholder={data.placeholder || "Введите текст..."}
          disabled
          className="cursor-not-allowed resize-none hover:bg-muted/50"
          rows={data.rows || 4}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0"
          onClick={handleClick}
        >
          <Settings2 className="h-3 w-3" />
        </Button>
      </div>
      <ElementEditDialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        data={data}
        onSave={handleSave}
      />
    </>
  );
}

export const INSERT_TEXTAREA_COMMAND = createCommand<CustomElementData>(
  "INSERT_TEXTAREA_COMMAND",
);

export default function TextareaPlugin(): null {
  const [editor] = useLexicalComposerContext();

  if (!editor.hasNodes([TextareaNode])) {
    throw new Error("TextareaPlugin: TextareaNode not registered on editor");
  }

  editor.registerCommand(
    INSERT_TEXTAREA_COMMAND,
    (data: CustomElementData) => {
      const node = new TextareaNode({
        displayMode: "block",
        ...data,
        type: "textarea",
      });
      $insertNodes([node]);
      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );

  return null;
}
