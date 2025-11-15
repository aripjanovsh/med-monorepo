import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertNodes,
  $getNodeByKey,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";
import { CustomElementNode, CustomElementData } from "./base/CustomElementNode";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ReactNode, useState } from "react";
import { LexicalEditor, EditorConfig, NodeKey } from "lexical";
import { generateElementId } from "./utils/generateId";
import { ElementEditDialog } from "./components/ElementEditDialog";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export class CheckboxNode extends CustomElementNode {
  static getType(): string {
    return "checkbox-input";
  }

  constructor(
    data: CustomElementData = {
      type: "checkbox",
      id: generateElementId("checkbox"),
      label: "",
      placeholder: "",
      required: false,
      displayMode: "inline",
      options: [],
    },
    key?: NodeKey,
  ) {
    super(data, key);
  }

  static clone(node: CheckboxNode): CheckboxNode {
    return new CheckboxNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: any): CheckboxNode {
    const { data } = serializedNode;
    return new CheckboxNode(data);
  }

  exportJSON(): any {
    return {
      data: this.__data,
      type: "checkbox-input",
      version: 1,
    };
  }

  decorate(editor: LexicalEditor, config: EditorConfig): ReactNode {
    return (
      <CheckboxComponent
        data={this.__data}
        nodeKey={this.__key}
        editor={editor}
      />
    );
  }
}

interface CheckboxComponentProps {
  data: CustomElementData;
  nodeKey: NodeKey;
  editor: LexicalEditor;
}

function CheckboxComponent({ data, nodeKey, editor }: CheckboxComponentProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newData: CustomElementData) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as CheckboxNode;
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

  // Если есть опции, показываем группу чекбоксов
  if (data.options && data.options.length > 0) {
    return (
      <>
        <div
          className={`${data.displayMode === "block" ? "my-2" : "inline-block mx-1"} group relative p-2 rounded hover:bg-muted/50 cursor-pointer`}
          contentEditable={false}
          onClick={handleClick}
        >
          {data.label && (
            <Label className="mb-2 block text-sm font-medium">
              {data.label}
              {data.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          <div className="space-y-1">
            {data.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${data.id}-${option.value}`}
                  disabled
                  className="cursor-not-allowed h-3 w-3"
                  defaultChecked={
                    Array.isArray(data.defaultValue)
                      ? data.defaultValue.includes(option.value)
                      : false
                  }
                />
                <Label
                  htmlFor={`${data.id}-${option.value}`}
                  className="cursor-not-allowed text-sm"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
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

  // Одиночный чекбокс для inline режима
  return (
    <>
      <span
        className={`${data.displayMode === "block" ? "flex" : "inline-flex"} items-center gap-1 ${data.displayMode === "block" ? "my-2" : "mx-1"} group relative`}
        contentEditable={false}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <Checkbox
          id={data.id}
          disabled
          className="cursor-not-allowed h-4 w-4"
          defaultChecked={data.defaultValue as boolean}
        />
        {(data.label || data.placeholder) && (
          <Label htmlFor={data.id} className="cursor-pointer text-sm">
            {data.label || data.placeholder}
          </Label>
        )}
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
}

export const INSERT_CHECKBOX_COMMAND = createCommand<CustomElementData>(
  "INSERT_CHECKBOX_COMMAND",
);

export default function CheckboxPlugin(): null {
  const [editor] = useLexicalComposerContext();

  if (!editor.hasNodes([CheckboxNode])) {
    throw new Error("CheckboxPlugin: CheckboxNode not registered on editor");
  }

  editor.registerCommand(
    INSERT_CHECKBOX_COMMAND,
    (data: CustomElementData) => {
      const node = new CheckboxNode({
        displayMode: "inline",
        ...data,
        type: "checkbox",
      });
      $insertNodes([node]);
      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );

  return null;
}
