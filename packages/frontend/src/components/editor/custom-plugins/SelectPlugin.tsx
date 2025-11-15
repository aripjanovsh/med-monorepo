import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertNodes,
  $getNodeByKey,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";
import { CustomElementNode, CustomElementData } from "./base/CustomElementNode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ReactNode, useState } from "react";
import { LexicalEditor, EditorConfig, NodeKey } from "lexical";
import { generateElementId } from "./utils/generateId";
import { ElementEditDialog } from "./components/ElementEditDialog";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export class SelectNode extends CustomElementNode {
  static getType(): string {
    return "select-input";
  }

  constructor(
    data: CustomElementData = {
      type: "select",
      id: generateElementId("select"),
      label: "",
      placeholder: "",
      required: false,
      displayMode: "inline",
      width: "150px",
      options: [],
    },
    key?: NodeKey,
  ) {
    super(data, key);
  }

  static clone(node: SelectNode): SelectNode {
    return new SelectNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: any): SelectNode {
    const { data } = serializedNode;
    return new SelectNode(data);
  }

  exportJSON(): any {
    return {
      data: this.__data,
      type: "select-input",
      version: 1,
    };
  }

  decorate(editor: LexicalEditor, config: EditorConfig): ReactNode {
    return (
      <SelectComponent
        data={this.__data}
        nodeKey={this.__key}
        editor={editor}
      />
    );
  }
}

interface SelectComponentProps {
  data: CustomElementData;
  nodeKey: NodeKey;
  editor: LexicalEditor;
}

function SelectComponent({ data, nodeKey, editor }: SelectComponentProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newData: CustomElementData) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as SelectNode;
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

  const elementContent = (
    <>
      <span
        className={`${data.displayMode === "block" ? "flex" : "inline-flex"} items-center gap-1 ${data.displayMode === "block" ? "my-2" : "mx-1"} group relative`}
        contentEditable={false}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        {data.label && (
          <span className="text-sm font-medium">{data.label}:</span>
        )}
        <Select disabled>
          <SelectTrigger
            className="inline-flex h-7 px-2 text-sm border-b border-t-0 border-x-0 rounded-none bg-transparent hover:bg-muted/50"
            style={{ width: data.width || "150px" }}
          >
            <SelectValue placeholder={data.placeholder || "Выберите..."} />
          </SelectTrigger>
          <SelectContent>
            {data.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {data.required && <span className="text-red-500 text-xs">*</span>}
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-6"
          onClick={handleClick}
        >
          <Settings2 className="h-3 w-3" />
        </Button>
      </span>
      <ElementEditDialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        data={data}
        onSave={handleSave}
      />
    </>
  );

  return elementContent;
}

export const INSERT_SELECT_COMMAND = createCommand<CustomElementData>(
  "INSERT_SELECT_COMMAND",
);

export default function SelectPlugin(): null {
  const [editor] = useLexicalComposerContext();

  if (!editor.hasNodes([SelectNode])) {
    throw new Error("SelectPlugin: SelectNode not registered on editor");
  }

  editor.registerCommand(
    INSERT_SELECT_COMMAND,
    (data: CustomElementData) => {
      const node = new SelectNode({
        displayMode: "inline",
        width: "150px",
        ...data,
        type: "select",
      });
      $insertNodes([node]);
      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );

  return null;
}
